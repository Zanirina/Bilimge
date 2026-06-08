import { useState, useEffect, useCallback } from "react";
import { NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { http } from "../api/http";
import { endpoints } from "../api/endpoints";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
import { TbPlus, TbMessage, TbTrash } from "react-icons/tb";

export interface SidebarItem {
  label: string;
  path: string;
  icon: React.ElementType;
  type?: "ai-chat";
  children?: Omit<SidebarItem, "children">[];
}

interface SidebarProps {
  items: SidebarItem[];
  userSubtitle?: string;
}

interface Conversation {
  id: number;
  title: string;
  updated_at: string;
}

// ── AI Chat nav item with conversation history dropdown ───────────────────────
function AIChatNavItem({
  item,
  collapsed,
}: {
  item: SidebarItem;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeConvId = searchParams.get("conv");

  const isOnChatPage = location.pathname === item.path;
  const [open, setOpen] = useState(isOnChatPage);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const fetchConversations = useCallback(() => {
    http
      .get(endpoints.chat.conversations)
      .then((r) => setConversations(r.data))
      .catch(() => {});
  }, []);

  // Auto-open when on chat page
  useEffect(() => {
    if (isOnChatPage) {
      setOpen(true);
      fetchConversations();
    }
  }, [isOnChatPage, fetchConversations]);

  // Re-fetch when a new conversation is created
  useEffect(() => {
    const handler = () => fetchConversations();
    window.addEventListener("chat:conversation-updated", handler);
    return () => window.removeEventListener("chat:conversation-updated", handler);
  }, [fetchConversations]);

  // Re-fetch when URL conv param changes
  useEffect(() => {
    if (isOnChatPage && open) fetchConversations();
  }, [activeConvId, isOnChatPage, open, fetchConversations]);

  function handleNewChat() {
    navigate(item.path, { replace: true });
  }

  async function handleDeleteConv(e: React.MouseEvent, convId: number) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await http.delete(endpoints.chat.conversationDetail(convId));
      fetchConversations();
      // If the deleted conv is active, go to new chat
      if (String(convId) === activeConvId) {
        navigate(item.path, { replace: true });
      }
    } catch {}
  }

  return (
    <div>
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) fetchConversations();
          if (!isOnChatPage) navigate(item.path);
        }}
        className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isOnChatPage
            ? "bg-[#EEF2FF] text-[#3356AA]"
            : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111928]"
        } ${collapsed ? "justify-center" : "justify-between"}`}
        title={collapsed ? item.label : undefined}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className="flex-shrink-0" />
          {!collapsed && <span>{item.label}</span>}
        </div>
      </button>

      {open && !collapsed && (
        <div className="ml-4 border-l border-gray-100 pl-2 flex flex-col gap-0.5 mt-0.5 mb-1">
          {/* New Chat button */}
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#3356AA] hover:bg-[#EEF2FF] transition-colors font-medium w-full text-left"
          >
            <TbPlus size={14} />
            New Chat
          </button>

          {/* Conversation list */}
          {conversations.length === 0 ? (
            <p className="px-3 py-1.5 text-xs text-gray-400">No chats yet</p>
          ) : (
            conversations.map((conv) => (
              <NavLink
                key={conv.id}
                to={`${item.path}?conv=${conv.id}`}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                  String(conv.id) === activeConvId
                    ? "text-[#3356AA] font-medium bg-[#EEF2FF]"
                    : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111928]"
                }`}
              >
                <TbMessage size={13} className="flex-shrink-0 opacity-60" />
                <span className="flex-1 truncate">{conv.title}</span>
                <button
                  onClick={(e) => handleDeleteConv(e, conv.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-0.5 rounded"
                >
                  <TbTrash size={12} />
                </button>
              </NavLink>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Standard nav item ─────────────────────────────────────────────────────────
function NavItemComponent({
  item,
  collapsed,
}: {
  item: SidebarItem;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  if (item.type === "ai-chat") {
    return <AIChatNavItem item={item} collapsed={collapsed} />;
  }

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((v) => !v)}
          className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-[#6B7280] hover:bg-gray-50 hover:text-[#111928] ${
            collapsed ? "justify-center" : "justify-between"
          }`}
          title={collapsed ? item.label : undefined}
        >
          <div className="flex items-center gap-3">
            <Icon size={20} className="flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </div>
          {!collapsed &&
            (open ? (
              <MdKeyboardArrowDown size={18} />
            ) : (
              <MdKeyboardArrowRight size={18} />
            ))}
        </button>

        {open && !collapsed && (
          <div className="ml-5 border-l border-gray-100 pl-2 flex flex-col gap-0.5 mt-0.5 mb-0.5">
            {item.children!.map((child) => {
              const ChildIcon = child.icon;
              return (
                <NavLink
                  key={child.path}
                  to={child.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "text-[#3356AA] font-medium bg-[#EEF2FF]"
                        : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111928]"
                    }`
                  }
                >
                  <ChildIcon size={16} className="flex-shrink-0" />
                  {child.label}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-[#EEF2FF] text-[#3356AA]"
            : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111928]"
        } ${collapsed ? "justify-center" : ""}`
      }
      title={collapsed ? item.label : undefined}
    >
      <Icon size={20} className="flex-shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export default function Sidebar({ items }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-[72px]" : "w-[260px]"
      } flex-shrink-0 bg-white flex flex-col justify-between py-6 shadow-sm transition-[width] duration-200 overflow-hidden`}
    >
      <div className="flex flex-col min-h-0 overflow-hidden">
        {/* Logo */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={`flex items-center mb-6 px-4 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {collapsed ? (
            <span className="text-[22px] font-extrabold tracking-tight leading-none select-none">
              <span className="text-[#3356AA]">b</span>
              <span className="text-[#E95C4B]">g</span>
            </span>
          ) : (
            <span className="text-[24px] font-bold tracking-tight leading-none select-none">
              <span className="text-[#3356AA]">bilim</span>
              <span className="text-[#E95C4B]">ge</span>
            </span>
          )}
        </button>

        <nav className="flex flex-col gap-0.5 px-3 overflow-y-auto flex-1">
          {items.map((item) => (
            <NavItemComponent key={item.path} item={item} collapsed={collapsed} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
