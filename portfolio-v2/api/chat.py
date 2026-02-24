import json
import os
import traceback
from http.server import BaseHTTPRequestHandler
from typing import Any, Dict, List, Optional
from urllib import error, request

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"


def _send_json(
    handler: BaseHTTPRequestHandler, status_code: int, payload: Dict[str, Any]
) -> None:
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status_code)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def _normalize_history(history: List[Any]) -> List[Dict[str, str]]:
    messages: List[Dict[str, str]] = []

    for entry in history:
        if not isinstance(entry, dict):
            continue

        raw_role = entry.get("role")
        if raw_role == "model":
            role = "assistant"
        elif raw_role in {"user", "assistant", "system"}:
            role = raw_role
        else:
            role = "user"

        parts = entry.get("parts", [])
        if not isinstance(parts, list):
            continue

        text_fragments: List[str] = []
        for part in parts:
            if isinstance(part, dict):
                text = part.get("text")
                if isinstance(text, str) and text.strip():
                    text_fragments.append(text.strip())

        if text_fragments:
            messages.append({"role": role, "content": "\n".join(text_fragments)})

    return messages


def _extract_reply(response_body: Dict[str, Any]) -> Optional[str]:
    output_text = response_body.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text.strip()

    output = response_body.get("output", [])
    if not isinstance(output, list):
        return None

    for item in output:
        if not isinstance(item, dict):
            continue
        content = item.get("content", [])
        if not isinstance(content, list):
            continue
        for part in content:
            if (
                isinstance(part, dict)
                and part.get("type") == "output_text"
                and isinstance(part.get("text"), str)
                and part["text"].strip()
            ):
                return part["text"].strip()

    return None


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self) -> None:
        _send_json(self, 200, {"ok": True})

    def do_POST(self) -> None:
        if not OPENAI_API_KEY:
            _send_json(self, 500, {"error": "Missing OPENAI_API_KEY"})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(content_length) if content_length > 0 else b"{}"
            body = json.loads(raw_body.decode("utf-8"))
        except (ValueError, json.JSONDecodeError):
            _send_json(self, 400, {"error": "Invalid JSON body"})
            return

        history = body.get("history")
        message = body.get("message")

        if not isinstance(history, list) or not isinstance(message, str) or not message.strip():
            _send_json(self, 400, {"error": "Missing 'message' or invalid 'history'"})
            return

        messages = _normalize_history(history)
        latest_message = message.strip()
        if not messages or messages[-1].get("content") != latest_message:
            messages.append({"role": "user", "content": latest_message})

        payload = {
            "model": OPENAI_MODEL,
            "input": messages,
            "store": False,
        }

        upstream_request = request.Request(
            OPENAI_RESPONSES_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with request.urlopen(upstream_request, timeout=30) as upstream_response:
                upstream_body = json.loads(upstream_response.read().decode("utf-8"))
        except error.HTTPError as http_error:
            raw_error = http_error.read().decode("utf-8", errors="replace")
            print(f"OpenAI HTTP error ({http_error.code}): {raw_error}")
            error_body: Dict[str, Any] = {"status": http_error.code}
            try:
                parsed_error = json.loads(raw_error)
                if isinstance(parsed_error, dict):
                    error_body["details"] = parsed_error.get("error", parsed_error)
                else:
                    error_body["details"] = parsed_error
            except Exception:
                if raw_error:
                    error_body["details"] = raw_error

            # Keep upstream 4xx codes for easier debugging (auth/model/quota/etc).
            downstream_status = http_error.code if 400 <= http_error.code < 500 else 502
            _send_json(
                self, downstream_status, {"error": "OpenAI request failed", **error_body}
            )
            return
        except error.URLError as url_error:
            print(f"OpenAI network error: {url_error}")
            _send_json(
                self,
                502,
                {
                    "error": "Unable to reach OpenAI",
                    "details": str(getattr(url_error, "reason", url_error)),
                },
            )
            return
        except Exception as exc:
            print(f"Unexpected /api/chat error: {exc}")
            traceback.print_exc()
            _send_json(self, 500, {"error": "Internal server error"})
            return

        reply = _extract_reply(upstream_body) or "No response."
        _send_json(self, 200, {"reply": reply})

    def log_message(self, _format: str, *args) -> None:
        return
