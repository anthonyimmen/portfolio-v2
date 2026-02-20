"use client";

import { useEffect, useRef, useState } from "react";

const CHAT_ENDPOINT = "https://sonpwzdh72.execute-api.us-east-2.amazonaws.com/chat";
const MIN_LOADING_DISPLAY_MS = 450;
const MOBILE_BREAKPOINT_QUERY = "(max-width: 1024px)";

const STARTING_PROMPT =
  "You are responding as Anthony Immenschuh, a 23-year-old software engineer at JPMorganChase working on an AI/ML-focused team that owns and maintains backend services. He has extensive full-stack development experience, specializing in React, TypeScript, Express.js, and AWS services like EC2, S3, IAM, and Systems Manager. Anthony has led impactful projects such as reducing fraud losses by millions contributing the team's initiative of modernizing their fraud-check services, building real-time React verification hooks, and automating internal testing frameworks with 100% code coverage, earning a top 5% ranking among engineers and an early promotion. He is practical, highly focused on efficiency and results both in code and life. Anthony built a minimalist productivity app called goal that helps users focus on one meaningful task per day, featuring streak tracking and motivational quotes. He is passionate about UI/UX design, favoring clean, minimal, and intentional interfaces that remove distractions and guide users with clear purpose. Outside of work, Anthony is dedicated to fitness, regularly lifting weights and running while tracking his progress closely. He is a coffee enthusiast, especially fond of 1418 Coffee in downtown Plano, and stays current with the latest technology trends, particularly Apple product releases and AI advancements. Sound like a human and give regular conversation like responses. Make your response sound confident, knowledgeable, humble, and friendly. your responses should be around 2-3 sentences long. never use emojis. do not mention his age. sound like a 23 year old guy.";

type HistoryEntry = {
  role: "user" | "model";
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
      role: "user",
      parts: [{ text: STARTING_PROMPT }],
    },
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      messageText:
        "hey i'm gemini 2.5 flash trained to act like anthony. ask me anything about my projects, technologies, coffee, art, music, etc...",
      messageAuthor: "anthony-bot",
      messageDate: getTimeString(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDate, setLoadingDate] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelOpen = isMobile || open;

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const syncMobileState = () => setIsMobile(mediaQuery.matches);
    syncMobileState();
    mediaQuery.addEventListener("change", syncMobileState);
    return () => mediaQuery.removeEventListener("change", syncMobileState);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, panelOpen]);

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
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
        "Sorry, I couldn't get a response from Gemini. Please try again later.";

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
            "Sorry, I couldn't get a response from Gemini. Please try again later.",
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
        <div className="chat-body">
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
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="craft a message..."
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSend();
              }
            }}
          />
          <button
            className="send-button"
            type="button"
            aria-label="Send message"
            disabled={isSendDisabled}
            onClick={handleSend}
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
