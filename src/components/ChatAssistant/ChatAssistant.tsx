
import { useState, useEffect, useRef, type JSX } from "react";
import { createPortal } from "react-dom";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function formatMessage(text: string): JSX.Element {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];

  lines.forEach((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const formattedParts = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} style={{ color: "#11001fb0", fontWeight: 600 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={j}>{part}</span>;
    });

    const listMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (listMatch) {
      elements.push(
        <div key={i} style={{ display: "flex", gap: "6px", marginTop: i > 0 ? "6px" : 0 }}>
          <span style={{ color: "#11001fb0", fontWeight: 600, flexShrink: 0 }}>{listMatch[1]}.</span>
          <span>{formattedParts.slice(1)}</span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: "8px" }} />);
    } else {
      elements.push(
        <div key={i} style={{ marginTop: i > 0 && lines[i - 1]?.trim() !== "" ? "2px" : 0 }}>
          {formattedParts}
        </div>
      );
    }
  });

  return <>{elements}</>;
}

interface ChatResponse {
  reply: string;
}

export default function ChatAssistant(): JSX.Element | null {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    const id = localStorage.getItem("sid") ?? crypto.randomUUID();
    localStorage.setItem("sid", id);
    setSessionId(id);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat]);

  const sendMessage = async (): Promise<void> => {
    if (!message.trim() || loading) return;
    const userMsg = message;
    setMessage("");
    setLoading(true);

    setChat((prev) => [
      ...prev,
      { role: "user", content: userMsg },
      { role: "assistant", content: "" },
    ]);

    try {
      const res = await fetch("https://portfolio-backend-production-8f89.up.railway.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, sessionId }),
      });

      const data: ChatResponse = await res.json();

      setChat((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = data.reply;
        return updated;
      });
    } catch {
      setChat((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = "Something went wrong. Please try again.";
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hasMessage = message.trim();

  if (!mounted) return null;

  return createPortal(
    <div ref={containerRef}>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-[#5B00BD] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F3E5FC" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
         <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-robot" viewBox="0 0 16 16">
  <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135"/>
  <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/>
</svg>
        )}
      </button>

      {/* Chat panel */}
      <div
        className="fixed z-[9999] flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          // Position: always bottom-right, 24px from edges
          bottom: "96px",
          right: "16px",
          // On mobile: fill from right edge up to 16px left margin
          // On desktop: fixed 380px wide
          width: open ? "min(380px, calc(100vw - 32px))" : "0px",
          height: open ? "min(480px, calc(100dvh - 120px))" : "0px",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          borderRadius: "16px",
          border: "2px solid transparent",
          background:
            "linear-gradient(#FFFFFF, #FFFFFF) padding-box, linear-gradient(135deg, #B8E7FF, #D2CCFF) border-box",
          boxShadow: "0 0 15px rgba(184, 231, 255, 0.5)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 shrink-0"
          style={{
            borderBottom: "1px solid",
            borderImage: "linear-gradient(to right, #B8E7FF, #D2CCFF) 1",
          }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#5B00BD]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-robot" viewBox="0 0 16 16">
  <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135"/>
  <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/>
</svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-black/75">Sanjana's AI Assistant</p>
            <p className="text-xs text-black/75">Ask me anything about Sanjana</p>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(50, 50, 50, 0.3) transparent" }}
        >
          {chat.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ background: "linear-gradient(135deg, #B8E7FF, #D2CCFF)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <circle cx="9" cy="10" r="1" fill="black" stroke="none" />
            <circle cx="12" cy="10" r="1" fill="black" stroke="none" />
            <circle cx="15" cy="10" r="1" fill="black" stroke="none" />
          </svg>
              </div>
              <p className="text-sm text-black/75">Start a conversation...</p>
            </div>
          )}

          {chat.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[92%] break-words px-3.5 py-2.5 text-sm leading-relaxed"
                style={
                  m.role === "user"
                    ? {
                        background: "#ebedffff",
                        color: "#000000c0",
                        borderRadius: "14px 14px 4px 14px",
                      }
                    : {
                        background: "#F3F3F6",
                        color: "#000000c0",
                        borderRadius: "14px 14px 14px 4px",
                      }
                }
              >
                {m.content ? (
                  m.role === "assistant" ? formatMessage(m.content) : m.content
                ) : (
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div
          className="px-4 py-3 shrink-0"
          style={{ borderTop: "1px solid rgba(50, 50, 50, 0.2)" }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{
              borderRadius: "12px",
              background: isFocused
                ? "linear-gradient(#f9f9fb, #f9f9fb) padding-box, linear-gradient(to right, #B8E7FF, #D2CCFF) border-box"
                : "rgba(255, 255, 255, 0.05)",
              border: isFocused ? "1px solid transparent" : "1px solid rgba(50, 50, 50, 0.2)",
              transition: "all 0.3s ease",
            }}
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={loading}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="flex-1 bg-transparent text-black text-sm outline-none placeholder:text-black/40"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !hasMessage}
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ease-in-out cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110"
              style={{
                background: hasMessage ? "#5B00BD" : "rgba(50, 50, 50, 0.2)",
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke={hasMessage ? "#ffffff" : "#000000"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}