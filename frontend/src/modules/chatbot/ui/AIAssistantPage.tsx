import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../auth/model/authStore";
import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";
import { TbSend, TbSparkles } from "react-icons/tb";
import { FiUser, FiCode, FiBookOpen, FiMapPin } from "react-icons/fi";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  { text: "Which universities are in Almaty?", icon: FiMapPin },
  { text: "What IT programs are available?", icon: FiCode },
  { text: "What are passing scores for top unis?", icon: FiBookOpen },
  { text: "Help me choose a major for software engineering", icon: FiUser },
];

// Follow-up suggestions derived from the last user message
function getFollowUps(messages: Message[]): string[] {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content.toLowerCase() ?? "";
  if (!lastUser) return [];

  if (lastUser.includes("almaty") || lastUser.includes("алматы"))
    return [
      "What are passing scores for Almaty universities?",
      "Which Almaty universities have dormitories?",
      "What IT programs exist in Almaty?",
    ];
  if (lastUser.includes("astana") || lastUser.includes("астана"))
    return [
      "Which Astana universities offer grants?",
      "What are the tuition costs in Astana?",
      "Do Astana universities have military departments?",
    ];
  if (lastUser.includes("grant") || lastUser.includes("грант"))
    return [
      "What score do I need for a grant?",
      "Which specialties have the most grants?",
      "How do I check my grant result?",
    ];
  if (lastUser.includes("it") || lastUser.includes("software") || lastUser.includes("программир"))
    return [
      "Which universities have the best IT programs?",
      "What subjects are required for IT admission?",
      "What is the tuition cost for IT programs?",
    ];
  if (lastUser.includes("cost") || lastUser.includes("стоимост") || lastUser.includes("цена"))
    return [
      "Which universities are the cheapest?",
      "Are there scholarship options?",
      "What is the grant score threshold?",
    ];
  return [
    "Which universities have the highest passing scores?",
    "What are the cheapest programs?",
    "Which cities have the most universities?",
  ];
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

// ── Inline markdown (bold) ────────────────────────────────────────────────────
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-[#111928]">
        {p.slice(2, -2)}
      </strong>
    ) : (
      p
    )
  );
}

// ── Markdown renderer (paragraphs + bullets + bold) ───────────────────────────
function MarkdownText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-2.5 text-sm leading-relaxed">
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter(Boolean);
        const isList = lines.some((l) => /^[\-•*]\s/.test(l.trim()));
        if (isList) {
          return (
            <ul key={bi} className="space-y-1">
              {lines
                .filter((l) => l.trim())
                .map((line, li) => {
                  const content = line.replace(/^[\-•*]\s*/, "");
                  return (
                    <li key={li} className="flex gap-2">
                      <span className="text-[#3356AA] mt-0.5 flex-shrink-0 text-xs">●</span>
                      <span>{renderInline(content)}</span>
                    </li>
                  );
                })}
            </ul>
          );
        }
        return (
          <p key={bi}>
            {lines.map((line, li) => (
              <span key={li}>
                {renderInline(line)}
                {li < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

// ── Animated orb ─────────────────────────────────────────────────────────────
function Orb() {
  return (
    <div className="relative w-20 h-20 mx-auto">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 35%, #6b8fd4, #3356AA 55%, #1a3070)",
          boxShadow: "0 8px 40px rgba(51,86,170,0.45)",
          animation: "orbFloat 4s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.35) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
        <TbSparkles size={15} className="text-[#3356AA]" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-5">
          <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function ChatMessage({
  message,
  isLast,
  onFollowUp,
}: {
  message: Message;
  isLast: boolean;
  onFollowUp: (text: string) => void;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0 self-start mt-1">
          <TbSparkles size={15} className="text-[#3356AA]" />
        </div>
      )}
      <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"} max-w-[78%]`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-[#3356AA] text-white rounded-br-sm shadow-md text-sm leading-relaxed whitespace-pre-wrap"
              : "bg-white border border-gray-100 text-[#374151] rounded-bl-sm shadow-sm"
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <MarkdownText text={message.content} />
          )}
        </div>

        {/* Follow-up chips after last AI message */}
        {!isUser && isLast && (
          <div className="flex flex-wrap gap-2 mt-1">
            {getFollowUps([message]).length > 0 &&
              getFollowUps([message]).map((q) => (
                <button
                  key={q}
                  onClick={() => onFollowUp(q)}
                  className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-[#3356AA] hover:text-[#3356AA] hover:bg-[#EEF2FF] transition-colors shadow-sm"
                >
                  {q}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Input box ─────────────────────────────────────────────────────────────────
function InputBox({
  value,
  onChange,
  onSend,
  loading,
  textareaRef,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: (text: string) => void;
  loading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md focus-within:border-[#3356AA] focus-within:ring-2 focus-within:ring-[#3356AA]/10 transition-all">
        <div className="flex items-end gap-2 px-4 pt-3 pb-3">
          <TbSparkles size={17} className="text-[#3356AA] flex-shrink-0 mb-0.5" />
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => { onChange(e.target.value); autoResize(); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend(value);
              }
            }}
            placeholder="Ask AI a question or make a request..."
            className="flex-1 bg-transparent resize-none outline-none text-sm text-[#111928] placeholder-gray-400 leading-relaxed"
            style={{ maxHeight: 160 }}
          />
          <button
            onClick={() => onSend(value)}
            disabled={!value.trim() || loading}
            className="w-9 h-9 rounded-xl bg-[#3356AA] hover:bg-[#2a4699] disabled:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0 mb-0.5"
          >
            <TbSend size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Right sidebar ─────────────────────────────────────────────────────────────
function RightPanel({
  messages,
  onSelect,
}: {
  messages: Message[];
  onSelect: (text: string) => void;
}) {
  const followUps = getFollowUps(messages);
  return (
    <aside className="w-60 flex-shrink-0 flex flex-col gap-4 overflow-y-auto py-6 pr-2">
      <div className="rounded-2xl border border-gray-100 p-4 shadow-sm">
        <p className="text-xs font-bold text-[#111928] uppercase tracking-wider mb-3">
          Suggested questions
        </p>
        <ul className="space-y-1.5">
          {followUps.map((q) => (
            <li key={q}>
              <button
                onClick={() => onSelect(q)}
                className="w-full text-left text-xs text-gray-600 px-3 py-2 rounded-xl bg-gray-50 hover:bg-[#EEF2FF] hover:text-[#3356AA] transition-colors leading-snug"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <p className="text-xs font-bold text-[#111928] uppercase tracking-wider mb-3">
          Quick topics
        </p>
        <ul className="space-y-1.5">
          {[
            "University costs & grants",
            "Passing score requirements",
            "Cities with most universities",
            "IT & tech programs",
            "Check grant by IKT number",
          ].map((t) => (
            <li key={t}>
              <button
                onClick={() => onSelect(t)}
                className="w-full text-left text-xs text-gray-600 px-3 py-2 rounded-xl bg-gray-50 hover:bg-[#EEF2FF] hover:text-[#3356AA] transition-colors"
              >
                {t}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AIAssistantPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.first_name?.trim() || user?.email?.split("@")[0] || "there";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    http.get(endpoints.chat.root)
      .then((res) => setMessages(res.data))
      .catch(() => {})
      .finally(() => setHistoryLoaded(true));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);
    try {
      const res = await http.post(endpoints.chat.root, { message: trimmed });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const isEmpty = historyLoaded && messages.length === 0;

  return (
    <>
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px); box-shadow: 0 8px 40px rgba(51,86,170,0.45); }
          50% { transform: translateY(-8px); box-shadow: 0 20px 60px rgba(51,86,170,0.3); }
        }
      `}</style>

      <div className="flex flex-col bg-[#F3F4F6] -m-8" style={{ height: "calc(100% + 4rem)" }}>
        {isEmpty ? (
          /* ── empty / welcome state ── */
          <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-10 gap-6">
            <Orb />
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-bold text-[#111928]">
                {timeGreeting()}, {firstName}
              </h1>
              <h2 className="text-3xl font-bold">
                What's on <span className="text-[#3356AA]">your mind?</span>
              </h2>
            </div>
            <InputBox
              value={input}
              onChange={setInput}
              onSend={sendMessage}
              loading={loading}
              textareaRef={textareaRef}
            />
            <div className="w-full max-w-2xl">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 text-center">
                Get started with an example below
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SUGGESTIONS.map(({ text, icon: Icon }) => (
                  <button
                    key={text}
                    onClick={() => sendMessage(text)}
                    className="flex flex-col justify-between gap-6 text-left p-4 bg-white border border-gray-200 rounded-2xl text-sm text-[#374151] hover:border-[#3356AA] hover:shadow-md transition-all"
                  >
                    <span className="leading-snug text-xs">{text}</span>
                    <Icon size={17} className="text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── chat state ── */
          <div className="flex flex-1 overflow-hidden">
            {/* messages */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">
                {messages.map((msg, i) => (
                  <ChatMessage
                    key={i}
                    message={msg}
                    isLast={i === messages.length - 1}
                    onFollowUp={(q) => sendMessage(q)}
                  />
                ))}
                {loading && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>

              <div className="bg-white border-t border-gray-100 px-8 py-4 flex-shrink-0">
                <InputBox
                  value={input}
                  onChange={setInput}
                  onSend={sendMessage}
                  loading={loading}
                  textareaRef={textareaRef}
                />
              </div>
            </div>

            {/* right sidebar */}
            <div className="w-64 flex-shrink-0 border-l border-gray-100 bg-white px-4 overflow-y-auto">
              <RightPanel messages={messages} onSelect={(q) => sendMessage(q)} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
