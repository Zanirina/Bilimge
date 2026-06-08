import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../auth/model/authStore";
import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";
import {
  TbSend,
  TbSparkles,
  TbShieldCheck,
  TbSchool,
  TbChartBar,
  TbBooks,
} from "react-icons/tb";
import { FiCheckCircle } from "react-icons/fi";

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

// ── Quick actions (i18n keys) ─────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    categoryKey: "chatbot.actions.universitiesCat",
    textKey: "chatbot.actions.universitiesText",
    icon: TbSchool,
  },
  {
    categoryKey: "chatbot.actions.grantsCat",
    textKey: "chatbot.actions.grantsText",
    icon: FiCheckCircle,
  },
  {
    categoryKey: "chatbot.actions.compareCat",
    textKey: "chatbot.actions.compareText",
    icon: TbChartBar,
  },
  {
    categoryKey: "chatbot.actions.untCat",
    textKey: "chatbot.actions.untText",
    icon: TbBooks,
  },
];

const QUICK_TOPIC_KEYS = [
  "chatbot.topics.costsGrants",
  "chatbot.topics.passingScore",
  "chatbot.topics.citiesMost",
  "chatbot.topics.dorms",
];

const IT_SUGGESTION_KEYS = [
  "chatbot.suggestions.bestIt",
  "chatbot.suggestions.subjectsIt",
  "chatbot.suggestions.tuitionIt",
];

const GRANT_SUGGESTION_KEYS = [
  "chatbot.suggestions.grantScore",
  "chatbot.suggestions.grantSpecialties",
  "chatbot.suggestions.grantResult",
];

// ── Suggested questions based on last message (returns i18n keys) ─────────────
function getSuggestionKeys(messages: Message[]): string[] {
  const lastUser =
    [...messages].reverse().find((m) => m.role === "user")?.content.toLowerCase() ?? "";

  if (lastUser.includes("grant") || lastUser.includes("грант"))
    return GRANT_SUGGESTION_KEYS;
  return IT_SUGGESTION_KEYS;
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
  const { t } = useTranslation();
  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md focus-within:border-[#3356AA] focus-within:ring-2 focus-within:ring-[#3356AA]/10 transition-all">
      <div className="flex items-center gap-2 px-4 py-3">
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
          placeholder={t("chatbot.inputPlaceholder")}
          className="flex-1 bg-transparent resize-none outline-none text-sm text-[#111928] placeholder-gray-400 leading-relaxed"
          style={{ maxHeight: 160 }}
        />
        <div className="flex items-center">
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
  const { t } = useTranslation();
  const suggestionKeys = getSuggestionKeys(messages);
  const hasMessages = messages.length > 0;

  return (
    <aside className="w-[280px] flex-shrink-0 flex flex-col h-full px-6 py-7 gap-7">
      {/* YOUR CONTEXT */}
      {userCtx && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
            {t("chatbot.context.title")}
          </p>
          <div className="rounded-2xl bg-[#F5F7FF] border border-[#E6EBFA] p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-600">{t("chatbot.context.savedUnis")}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                  {userCtx.favoriteNames.length > 0
                    ? userCtx.favoriteNames.slice(0, 3).join(", ")
                    : t("chatbot.context.noneSaved")}
                </p>
              </div>
              <span className="text-lg font-bold text-[#3356AA]">
                {userCtx.favoritesCount}
              </span>
            </div>
            <div className="border-t border-[#E6EBFA] pt-3 flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-600">{t("chatbot.context.untAverage")}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t("chatbot.context.selfReported")}</p>
              </div>
              <span className="text-lg font-bold text-[#3356AA]">
                {userCtx.untScore > 0 ? userCtx.untScore : "—"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUGGESTED QUESTIONS */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          {t("chatbot.suggestedTitle")}
        </p>
        <ul>
          {(hasMessages ? suggestionKeys : IT_SUGGESTION_KEYS).map((key) => {
            const q = t(key);
            return (
              <li key={key}>
                <button
                  onClick={() => onSelect(q)}
                  className="w-full text-left text-xs text-gray-600 flex items-start gap-2 py-2 hover:text-[#3356AA] transition-colors leading-snug"
                >
                  <span className="text-[#3356AA] mt-0.5 flex-shrink-0">↗</span>
                  {q}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* QUICK TOPICS */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
          {t("chatbot.quickTopicsTitle")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_TOPIC_KEYS.map((key) => {
            const topic = t(key);
            return (
              <button
                key={key}
                onClick={() => onSelect(topic)}
                className="text-xs text-gray-600 px-2.5 py-1 bg-gray-50 rounded-full hover:text-[#3356AA] hover:bg-[#EEF2FF] transition-colors"
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      {/* VERIFIED BADGE */}
      <div className="mt-auto rounded-2xl bg-[#EEF2FF] p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <TbShieldCheck size={16} className="text-[#3356AA] flex-shrink-0" />
          <span className="text-xs font-semibold text-[#3356AA]">{t("chatbot.verifiedTitle")}</span>
        </div>
        <p className="text-[11px] text-[#3356AA]/70 leading-relaxed">
          {t("chatbot.verifiedText")}
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
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6 overflow-y-auto">
      {/* Star icon */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-[#EEF2FF] flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3356AA"
            strokeWidth="2"
            strokeLinejoin="round"
          >
            <path d="M12 2.5C12.6 8 16 11.4 21.5 12C16 12.6 12.6 16 12 21.5C11.4 16 8 12.6 2.5 12C8 11.4 11.4 8 12 2.5Z" />
          </svg>
        </div>
        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
      </div>

      {/* Headline */}
      <div className="text-center space-y-1 max-w-lg">
        <h1 className="text-3xl font-bold text-[#111928]">
          {t("chatbot.welcomeGreeting", { name: firstName })}{" "}
          <span className="text-[#3356AA]">{t("chatbot.welcomeBrand")}</span>
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          {t("chatbot.welcomeSubtitle")}
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
        {QUICK_ACTIONS.map(({ categoryKey, textKey, icon: Icon }) => {
          const text = t(textKey);
          return (
            <button
              key={textKey}
              onClick={() => onSelect(text)}
              className="flex flex-col justify-between gap-4 text-left p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#3356AA] hover:shadow-md transition-all group"
            >
              <div>
                <p className="text-[10px] font-bold text-[#3356AA] tracking-wider mb-1.5 uppercase">
                  {t(categoryKey)}
                </p>
                <p className="text-sm text-[#374151] leading-snug">{text}</p>
              </div>
              <Icon size={18} className="text-gray-300 group-hover:text-[#3356AA] transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AIAssistantPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.first_name?.trim() || user?.email?.split("@")[0] || t("chatbot.defaultName");

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
            content: t("chatbot.errorMessage"),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [convId, loading, setSearchParams, t]
  );

  const isEmpty = !convId && messages.length === 0;

  return (
    <>
      <div className="flex flex-col bg-[#F3F4F6] -m-8" style={{ height: "calc(100% + 4rem)" }}>
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
                    {t("chatbot.disclaimer")}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Right panel */}
          <div className="border-l border-gray-100 bg-white h-full">
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
