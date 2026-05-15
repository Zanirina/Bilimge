import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../auth/model/authStore";
import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";
import {
  TbSend,
  TbSparkles,
  TbPaperclip,
  TbShieldCheck,
  TbSchool,
  TbChartBar,
  TbBooks,
} from "react-icons/tb";
import { FiCheckCircle } from "react-icons/fi";
import { MdLanguage } from "react-icons/md";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface UserContext {
  favoritesCount: number;
  favoriteNames: string[];
  untScore: number;
}

// ── Quick actions matching screenshot ─────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    category: "UNIVERSITIES",
    text: "Which universities have the best IT programs?",
    icon: TbSchool,
  },
  {
    category: "GRANTS",
    text: "Check if I qualify for a state grant by IKT number",
    icon: FiCheckCircle,
  },
  {
    category: "COMPARE",
    text: "Compare AITU and KIMEP computer science programs",
    icon: TbChartBar,
  },
  {
    category: "UNT",
    text: "What UNT score do I need for Nazarbayev University?",
    icon: TbBooks,
  },
];

const QUICK_TOPICS = [
  "University costs & grants",
  "Passing score requirements",
  "Cities with most universities",
  "IT & tech programs",
  "Check grant by IKT number",
  "Dorms & housing",
];

// ── Suggested questions based on last message ────────────────────────────────
function getSuggestions(messages: Message[]): string[] {
  const lastUser =
    [...messages].reverse().find((m) => m.role === "user")?.content.toLowerCase() ?? "";

  if (lastUser.includes("almaty") || lastUser.includes("алматы"))
    return [
      "Which universities have the best IT programs?",
      "What subjects are required for IT admission?",
      "What is the tuition cost for IT programs?",
    ];
  if (lastUser.includes("grant") || lastUser.includes("грант"))
    return [
      "What score do I need for a grant?",
      "Which specialties have the most grants?",
      "How do I check my grant result?",
    ];
  if (lastUser.includes("it") || lastUser.includes("software"))
    return [
      "Which universities have the best IT programs?",
      "What subjects are required for IT admission?",
      "What is the tuition cost for IT programs?",
    ];
  return [
    "Which universities have the best IT programs?",
    "What subjects are required for IT admission?",
    "What is the tuition cost for IT programs?",
  ];
}

// ── Markdown renderer ─────────────────────────────────────────────────────────
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold">
        {p.slice(2, -2)}
      </strong>
    ) : (
      p
    )
  );
}

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
function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0 self-start mt-1">
          <TbSparkles size={15} className="text-[#3356AA]" />
        </div>
      )}
      <div
        className={`px-4 py-3 rounded-2xl max-w-[80%] ${
          isUser
            ? "bg-[#3356AA] text-white rounded-br-sm shadow-md text-sm leading-relaxed whitespace-pre-wrap"
            : "bg-white border border-gray-100 text-[#374151] rounded-bl-sm shadow-sm"
        }`}
      >
        {isUser ? message.content : <MarkdownText text={message.content} />}
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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md focus-within:border-[#3356AA] focus-within:ring-2 focus-within:ring-[#3356AA]/10 transition-all">
      <div className="flex items-start gap-2 px-4 pt-3">
        <TbSparkles size={17} className="text-[#3356AA] flex-shrink-0 mt-0.5" />
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            autoResize();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend(value);
            }
          }}
          placeholder="Ask about universities, programs, the UNT, or grants..."
          className="flex-1 bg-transparent resize-none outline-none text-sm text-[#111928] placeholder-gray-400 leading-relaxed"
          style={{ maxHeight: 160 }}
        />
      </div>
      <div className="flex items-center justify-between px-4 pb-2.5 pt-1">
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
            <TbPaperclip size={14} />
            <span>Attach</span>
          </button>
          <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
            <MdLanguage size={14} />
            <span>EN</span>
          </button>
          <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
            <span>↑</span>
            <span>Use my profile</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-300 hidden sm:block">⌘↵ to send</span>
          <button
            onClick={() => onSend(value)}
            disabled={!value.trim() || loading}
            className="w-8 h-8 rounded-xl bg-[#3356AA] hover:bg-[#2a4699] disabled:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <TbSend size={15} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Right context panel ───────────────────────────────────────────────────────
function RightPanel({
  messages,
  userCtx,
  onSelect,
}: {
  messages: Message[];
  userCtx: UserContext | null;
  onSelect: (text: string) => void;
}) {
  const suggestions = getSuggestions(messages);
  const hasMessages = messages.length > 0;

  return (
    <aside className="w-[260px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto py-5 px-3">
      {/* YOUR CONTEXT */}
      {userCtx && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
            Your Context
          </p>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Saved unis</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                  {userCtx.favoriteNames.length > 0
                    ? userCtx.favoriteNames.slice(0, 3).join(", ")
                    : "None saved yet"}
                </p>
              </div>
              <span className="text-lg font-bold text-[#3356AA]">
                {userCtx.favoritesCount}
              </span>
            </div>
            <div className="border-t border-gray-50 pt-3 flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">UNT average</p>
                <p className="text-xs text-gray-400 mt-0.5">Self-reported score</p>
              </div>
              <span className="text-lg font-bold text-[#3356AA]">
                {userCtx.untScore > 0 ? userCtx.untScore : "—"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUGGESTED QUESTIONS */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
          Suggested Questions
        </p>
        <ul className="space-y-1">
          {(hasMessages ? suggestions : [
            "Which universities have the best IT programs?",
            "What subjects are required for IT admission?",
            "What is the tuition cost for IT programs?",
          ]).map((q) => (
            <li key={q}>
              <button
                onClick={() => onSelect(q)}
                className="w-full text-left text-xs text-gray-600 flex items-start gap-2 px-2 py-2 rounded-xl hover:bg-[#EEF2FF] hover:text-[#3356AA] transition-colors leading-snug group"
              >
                <span className="text-[#3356AA] mt-0.5 flex-shrink-0">↗</span>
                {q}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* QUICK TOPICS */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
          Quick Topics
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => onSelect(t)}
              className="text-xs text-gray-600 px-2.5 py-1 bg-gray-50 rounded-full border border-gray-100 hover:border-[#3356AA] hover:text-[#3356AA] hover:bg-[#EEF2FF] transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* VERIFIED BADGE */}
      <div className="bg-[#3356AA] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <TbShieldCheck size={16} className="text-white flex-shrink-0" />
          <span className="text-xs font-semibold text-white">Verified by Bilimge</span>
        </div>
        <p className="text-[11px] text-blue-200 leading-relaxed">
          All university data comes from 2026 NTC catalogue & official school pages.
        </p>
      </div>
    </aside>
  );
}

// ── Welcome hero (empty state) ────────────────────────────────────────────────
function WelcomeHero({
  firstName,
  onSelect,
  input,
  setInput,
  onSend,
  loading,
  textareaRef,
}: {
  firstName: string;
  onSelect: (text: string) => void;
  input: string;
  setInput: (v: string) => void;
  onSend: (text: string) => void;
  loading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6 overflow-y-auto">
      {/* Star icon */}
      <div className="relative">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: "radial-gradient(circle at 35% 35%, #6b8fd4, #3356AA 55%, #1a3070)",
            boxShadow: "0 8px 32px rgba(51,86,170,0.4)",
            animation: "orbFloat 4s ease-in-out infinite",
          }}
        >
          <TbSparkles size={28} className="text-white" />
        </div>
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
      </div>

      {/* Headline */}
      <div className="text-center space-y-1 max-w-lg">
        <h1 className="text-3xl font-bold text-[#111928]">
          Hi {firstName} —{" "}
          <span className="text-[#3356AA]">I'm Bilimge AI</span>
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Ask about Kazakhstani universities, programs, the UNT, scholarships,
          <br />
          or your application strategy. I'll cite my sources.
        </p>
      </div>

      {/* Input */}
      <div className="w-full max-w-2xl">
        <InputBox
          value={input}
          onChange={setInput}
          onSend={onSend}
          loading={loading}
          textareaRef={textareaRef}
        />
      </div>

      {/* Quick action cards */}
      <div className="w-full max-w-2xl grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map(({ category, text, icon: Icon }) => (
          <button
            key={text}
            onClick={() => onSelect(text)}
            className="flex flex-col justify-between gap-4 text-left p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#3356AA] hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[10px] font-bold text-[#3356AA] tracking-wider mb-1.5 uppercase">
                {category}
              </p>
              <p className="text-sm text-[#374151] leading-snug">{text}</p>
            </div>
            <Icon size={18} className="text-gray-300 group-hover:text-[#3356AA] transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AIAssistantPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.first_name?.trim() || user?.email?.split("@")[0] || "there";

  const [searchParams, setSearchParams] = useSearchParams();
  const convId = searchParams.get("conv");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userCtx, setUserCtx] = useState<UserContext | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch user context (saved unis count + UNT score from /me)
  useEffect(() => {
    http
      .get(endpoints.auth.me)
      .then((res) => {
        const d = res.data;
        setUserCtx({
          favoritesCount: d.favorites_count ?? 0,
          favoriteNames: [],
          untScore: d.unt_score ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  // Load messages when convId changes
  useEffect(() => {
    if (!convId) {
      setMessages([]);
      return;
    }
    http
      .get(endpoints.chat.conversationDetail(convId))
      .then((res) => setMessages(res.data.messages ?? []))
      .catch(() => setMessages([]));
  }, [convId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setLoading(true);

      try {
        let targetConvId = convId;

        if (!targetConvId) {
          // Create a new conversation first
          const r = await http.post(endpoints.chat.conversations, {
            title: trimmed.slice(0, 60),
          });
          targetConvId = String(r.data.id);
          setSearchParams({ conv: targetConvId });
        }

        const res = await http.post(endpoints.chat.conversationMessages(targetConvId), {
          message: trimmed,
        });
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.data.response },
        ]);

        // Dispatch event so sidebar can refresh its conversation list
        window.dispatchEvent(new CustomEvent("chat:conversation-updated"));
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [convId, loading, setSearchParams]
  );

  const isEmpty = !convId && messages.length === 0;

  return (
    <>
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      <div className="flex flex-col bg-[#F3F4F6] -m-8" style={{ height: "calc(100% + 4rem)" }}>
        {/* Inner header */}
        <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <TbSparkles size={18} className="text-[#3356AA]" />
            <span className="font-semibold text-[#111928] text-sm">AI Assistant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-gray-500">
              Online · Trained on 2026 Kazakhstani admissions data
            </span>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main chat area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {isEmpty ? (
              <WelcomeHero
                firstName={firstName}
                onSelect={sendMessage}
                input={input}
                setInput={setInput}
                onSend={sendMessage}
                loading={loading}
                textareaRef={textareaRef}
              />
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
                  {messages.map((msg, i) => (
                    <ChatMessage key={i} message={msg} />
                  ))}
                  {loading && <TypingIndicator />}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="flex-shrink-0 border-t border-gray-100 bg-white px-6 py-4">
                  <InputBox
                    value={input}
                    onChange={setInput}
                    onSend={sendMessage}
                    loading={loading}
                    textareaRef={textareaRef}
                  />
                  <p className="text-center text-[11px] text-gray-400 mt-2">
                    AI may produce inaccurate info — verify on each university's official page.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Right panel */}
          <div className="border-l border-gray-100 bg-white overflow-y-auto">
            <RightPanel
              messages={messages}
              userCtx={userCtx}
              onSelect={sendMessage}
            />
          </div>
        </div>
      </div>
    </>
  );
}
