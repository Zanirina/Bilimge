import { useState, useEffect, useRef } from "react";
import { TbRobot, TbSend, TbTrash } from "react-icons/tb";
import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";

interface Message {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

const SUGGESTED_PROMPTS = [
  "Which universities are in Almaty?",
  "What IT specializations are available?",
  "What passing scores do universities require?",
  "Help me choose a major for software engineering",
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
        <TbRobot size={18} className="text-[#3356AA]" />
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

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
          <TbRobot size={18} className="text-[#3356AA]" />
        </div>
      )}
      <div
        className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
          isUser
            ? "bg-[#3356AA] text-white rounded-br-sm"
            : "bg-white border border-gray-100 text-[#111928] rounded-bl-sm"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    http.get(endpoints.chat.root).then((res) => {
      setMessages(res.data);
      setHistoryLoaded(true);
    }).catch(() => setHistoryLoaded(true));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const res = await http.post(endpoints.chat.root, { message: trimmed });
      const aiMsg: Message = { role: "assistant", content: res.data.response };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function clearHistory() {
    await http.delete(endpoints.chat.root).catch(() => {});
    setMessages([]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const isEmpty = historyLoaded && messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-[#F3F4F6] -m-8">
      {/* Header */}
      <div className="bg-white shadow-sm px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EEF2FF] flex items-center justify-center">
            <TbRobot size={22} className="text-[#3356AA]" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#111928]">Bilimge AI Assistant</h1>
            <p className="text-xs text-gray-400">Powered by Llama 3.3 · Ask me anything about universities</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <TbTrash size={15} />
            Clear chat
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-8 pb-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
                <TbRobot size={36} className="text-[#3356AA]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#111928]">How can I help you today?</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Ask me about universities, majors, and admissions in Kazakhstan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-[#374151] hover:border-[#3356AA] hover:bg-[#EEF2FF] hover:text-[#3356AA] transition-colors shadow-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {loading && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-100 px-8 py-4 flex-shrink-0">
        <div className="flex items-end gap-3 bg-[#F9FAFB] border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-[#3356AA] focus-within:ring-2 focus-within:ring-[#3356AA]/10 transition">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about universities, majors, or admissions..."
            className="flex-1 bg-transparent resize-none outline-none text-sm text-[#111928] placeholder-gray-400 leading-relaxed"
            style={{ maxHeight: 160 }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-[#3356AA] hover:bg-[#2a4699] disabled:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <TbSend size={17} className="text-white" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-300 mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
