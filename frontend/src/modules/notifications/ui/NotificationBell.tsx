import { useState, useRef, useEffect, useMemo } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { MdCampaign, MdEventNote } from "react-icons/md";
import {
  useNotificationsStore,
  buildNotifications,
  type NotificationItem,
} from "../model/notificationsStore";

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(t).toLocaleDateString();
}

function Row({
  item,
  onClick,
}: {
  item: NotificationItem;
  onClick: () => void;
}) {
  const Icon = item.kind === "reminder" ? MdEventNote : MdCampaign;
  const tint = item.kind === "reminder" ? "text-[#E08A00]" : "text-[#3356AA]";
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
        item.read ? "" : "bg-[#3356AA]/[0.04]"
      }`}
    >
      <span className={`mt-0.5 flex-shrink-0 ${tint}`}>
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-[#111928] truncate">
          {item.title}
        </span>
        <span className="block text-xs text-gray-500">{item.body}</span>
        <span className="block text-[11px] text-gray-400 mt-0.5">
          {relativeTime(item.iso)}
        </span>
      </span>
      {!item.read && (
        <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-[#3356AA]" />
      )}
    </button>
  );
}

export default function NotificationBell() {
  const {
    announcements,
    events,
    readIds,
    loading,
    loaded,
    refresh,
    markRead,
    markManyRead,
  } = useNotificationsStore();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Initial load.
  useEffect(() => {
    if (!loaded) refresh();
  }, [loaded, refresh]);

  // Close on outside click.
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const notifications = useMemo(
    () => buildNotifications(announcements, events, readIds),
    [announcements, events, readIds]
  );

  // The bell is an unread-only inbox: read items drop off the list.
  const visible = notifications.filter((n) => !n.read);
  const unreadCount = visible.length;

  function toggleOpen() {
    setOpen((v) => {
      const next = !v;
      if (next) refresh(); // refresh on open so it stays current
      return next;
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggleOpen}
        className="relative p-2 text-gray-500 hover:text-[#3356AA] hover:bg-gray-50 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <IoNotificationsOutline size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-semibold text-white bg-[#E95C4B] rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-[#111928]">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-1.5 text-xs font-semibold text-[#E95C4B]">
                  {unreadCount}
                </span>
              )}
            </p>
            <button
              onClick={() => markManyRead(notifications.map((n) => n.id))}
              disabled={unreadCount === 0}
              className="text-xs font-medium text-[#3356AA] hover:underline disabled:text-gray-300 disabled:no-underline"
            >
              Mark all read
            </button>
          </div>

          {/* list */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {loading && visible.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">Loading…</p>
            ) : visible.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">
                No new notifications.
              </p>
            ) : (
              visible.map((item) => (
                <Row key={item.id} item={item} onClick={() => markRead(item.id)} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
