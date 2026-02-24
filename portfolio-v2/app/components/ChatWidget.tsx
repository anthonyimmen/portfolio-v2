"use client";

import { useEffect, useRef, useState } from "react";

const CHAT_ENDPOINT = "/api/chat";
const MIN_LOADING_DISPLAY_MS = 450;
const MOBILE_BREAKPOINT_QUERY = "(max-width: 1024px)";

const PREFILL_QUESTIONS = [
  "what is your most impactful project?",
  "how do you build systems that people can trust?",
  "what are you building next?",
] as const;

const STARTING_PROMPT =
`
You are Anthony Immenschuh, a 24-year-old Software Engineer II at JPMorgan Chase on an AI/ML innovation team.

Background:
- Build AI agents and Spring Boot backend services
- Contributed to the backend services/agent orchestration and built React + TypeScript self-service testing dashboard for an AI assistant that is rolling out to chase.com. The assistant has been live for a while in the Chase app, but our team did not contirbute to that.
- Contributed full-stack to chase.com/business, including building a reusable custom React hook for fraud checks used across digital and in-branch account opening experiences
- Strong in React, TypeScript, JavaScript, Python, Java, AWS
- Built personal projects: ascii-it.com (image-to-ASCII app) and goalapp.io (minimalist goal tracker)

Voice:
- Thoughtful, direct, analytical
- Clear, structured explanations
- Confident but not arrogant
- Do not be overly enthusiastic
- Minimal buzzwords, never robotic
- Professional by default, light humor occasionally

When discussing work:
- Explain what the system does
- Clarify what Anthony personally built
- Mention tech stack and impact
- Note tradeoffs when relevant
- If asked, "what am I building next?", mention that I'm working on a workout tracker app to create a simple and intuitive lift tracking experience. The plan is for it to launch around May-June 2026.
- If asked, "how do you build systems that people can trust", say something along the lines of "Trust comes from predictability and transparency, not flashy behavior. I focus on clear UX (especially when the system is unsure), reliability (timeouts, retries, graceful failure), observability (logs and metrics so issues are explainable), and strong testing and evaluation. For complex flows like AI, repeatable evaluation is huge, which is why I built a self-service testing dashboard so teams could validate behavior consistently. In sensitive domains, security and privacy by default are non-negotiable."

Never say you are an AI. Never break character. Do not invent or hallucinate experience. Never give long responses or over-explain.
`;

type HistoryEntry = {
  role: "system" | "user" | "model";
  parts: Array<{ text: string }>;
};

type ChatMessage = {
  messageText: string;
  messageAuthor: "you" | "anthony-bot";
  messageDate: string;
};

const getTimeString = () => {
  const now = new Date();
  const hours = now.getHours() % 12 || 12;
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = now.getHours() >= 12 ? "pm" : "am";
  return `${hours}:${minutes}${ampm}`;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      role: "system",
      parts: [{ text: STARTING_PROMPT }],
    },
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      messageText:
        "hey, i'm gpt-4.1 nano trained to act like anthony. ask me anything about my projects, technologies, coffee, art, music, etc...",
      messageAuthor: "anthony-bot",
      messageDate: getTimeString(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDate, setLoadingDate] = useState<string | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const panelOpen = isMobile || open;

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const syncMobileState = () => setIsMobile(mediaQuery.matches);
    syncMobileState();
    mediaQuery.addEventListener("change", syncMobileState);
    return () => mediaQuery.removeEventListener("change", syncMobileState);
  }, []);

  useEffect(() => {
    if (!panelOpen) return;
    chatBodyRef.current?.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, panelOpen]);

  const handleSend = async (prefilledMessage?: string) => {
    const trimmedInput = (prefilledMessage ?? inputValue).trim();
    if (!trimmedInput || loading) return;

    const userMessage: ChatMessage = {
      messageText: trimmedInput,
      messageAuthor: "you",
      messageDate: getTimeString(),
    };
    const userHistoryEntry: HistoryEntry = {
      role: "user",
      parts: [{ text: trimmedInput }],
    };
    const nextHistory = [...history, userHistoryEntry];

    setMessages((prev) => [...prev, userMessage]);
    setHistory(nextHistory);
    setInputValue("");
    setLoading(true);
    setLoadingDate(getTimeString());
    const loadingStartedAt = Date.now();

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: nextHistory,
          message: trimmedInput,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`);
      }

      const data = (await response.json()) as { reply?: string };
      const reply =
        data.reply?.trim() ||
        "Sorry, I couldn't get a response right now. Please try again later.";

      setMessages((prev) => [
        ...prev,
        {
          messageText: reply,
          messageAuthor: "anthony-bot",
          messageDate: getTimeString(),
        },
      ]);
      setHistory((prev) => [...prev, { role: "model", parts: [{ text: reply }] }]);
    } catch {
      setHistory((prev) => prev.slice(0, -1));
      setMessages((prev) => [
        ...prev,
        {
          messageText:
            "Sorry, I couldn't get a response right now. Please try again later.",
          messageAuthor: "anthony-bot",
          messageDate: getTimeString(),
        },
      ]);
    } finally {
      const loadingElapsed = Date.now() - loadingStartedAt;
      if (loadingElapsed < MIN_LOADING_DISPLAY_MS) {
        await new Promise((resolve) =>
          setTimeout(resolve, MIN_LOADING_DISPLAY_MS - loadingElapsed),
        );
      }
      setLoading(false);
      setLoadingDate(null);
    }
  };

  const isSendDisabled = loading || inputValue.trim().length === 0;

  return (
    <>
      <aside id="chat-panel" className="chat-card card" hidden={!panelOpen}>
        <div className="chat-header">
          <span>Chat</span>
        </div>
        <div className="chat-body" ref={chatBodyRef}>
          {messages.map((message, index) => (
            <div
              key={`${message.messageAuthor}-${message.messageDate}-${index}`}
              className={`chat-row ${
                message.messageAuthor === "you" ? "user" : "bot"
              }`}
            >
              <div
                className={`chat-bubble ${
                  message.messageAuthor === "you" ? "user" : "bot"
                }`}
              >
                {message.messageText}
              </div>
              <div
                className={`chat-meta ${
                  message.messageAuthor === "you" ? "user" : ""
                }`}
              >
                {message.messageAuthor} · {message.messageDate}
              </div>
            </div>
          ))}
          {loading ? (
            <div className="chat-row bot">
              <div className="chat-bubble bot">
                <div
                  className="chat-loading"
                  role="status"
                  aria-live="polite"
                  aria-label="anthony-bot is typing"
                >
                  <span className="chat-loading-dot" />
                  <span className="chat-loading-dot" />
                  <span className="chat-loading-dot" />
                </div>
              </div>
              <div className="chat-meta">anthony-bot · {loadingDate}</div>
            </div>
          ) : null}
        </div>
        <div className="chat-prefill" aria-label="Suggested prompts">
          {PREFILL_QUESTIONS.map((question) => (
            <button
              key={question}
              className="chat-prefill-chip"
              type="button"
              disabled={loading}
              onClick={() => handleSend(question)}
            >
              {question}
            </button>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="craft a message..."
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleSend();
              }
            }}
          />
          <button
            className="send-button"
            type="button"
            aria-label="Send message"
            disabled={isSendDisabled}
            onClick={() => {
              void handleSend();
            }}
          >
            <i className="ph ph-arrow-up" />
          </button>
        </div>
      </aside>
      <div id="chat" className="chat-anchor" />
      <button
        className="chat-fab"
        type="button"
        aria-label={panelOpen ? "Hide chat" : "Show chat"}
        aria-controls="chat-panel"
        aria-expanded={panelOpen}
        onClick={() => setOpen((prev) => !prev)}
      >
        <i className="ph-thin ph-chat-text" />
      </button>
    </>
  );
}
