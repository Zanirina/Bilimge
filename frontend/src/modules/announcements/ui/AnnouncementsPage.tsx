import { useEffect, useState, useMemo } from "react";
import { useAnnouncementsStore } from "../model/announcementsStore";
import type { Announcement, AnnouncementAuthorType } from "../model/types";
import {
  AnnouncementCard,
  AuthorAvatar,
  PinnedCard,
  TypeBadge,
  authorLabel,
  authorRole,
  formatFeedDate,
} from "./AnnouncementCard";

function FullPostModal({
  item,
  onClose,
}: {
  item: Announcement;
  onClose: () => void;
}) {
  const name = authorLabel(item);
  const role = authorRole(item);
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <AuthorAvatar name={name} type={item.author_type} avatarUrl={item.author_avatar_url} />
          <div>
            <p className="font-semibold text-[#111928]">{name}</p>
            <p className="text-xs text-gray-400">
              {role} · {formatFeedDate(item.created_at)}
            </p>
          </div>
          <div className="ml-auto">
            <TypeBadge type={item.author_type} />
          </div>
        </div>
        <h2 className="text-xl font-bold text-[#111928] mb-3">{item.title}</h2>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.body}</p>
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-[#3356AA] text-white text-sm rounded-xl hover:bg-[#2a4590] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

type FilterKey = "all" | AnnouncementAuthorType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All Announcements" },
  { key: "ntc", label: "NTC" },
  { key: "university", label: "University" },
];

export default function AnnouncementsPage() {
  const { announcements, isLoading, fetchList } = useAnnouncementsStore();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filtered = useMemo(() => {
    if (filter === "all") return announcements;
    return announcements.filter((a) => a.author_type === filter);
  }, [announcements, filter]);

  const pinned = useMemo(() => announcements.slice(0, 3), [announcements]);

  const counts: Record<FilterKey, number> = useMemo(
    () => ({
      all: announcements.length,
      ntc: announcements.filter((a) => a.author_type === "ntc").length,
      university: announcements.filter((a) => a.author_type === "university").length,
    }),
    [announcements]
  );

  return (
    <>
      {selected && (
        <FullPostModal item={selected} onClose={() => setSelected(null)} />
      )}

      {/* page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#111928]">Announcements</h1>
        <div className="flex items-center gap-2">
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#3356AA]">
            <option>All time</option>
            <option>This week</option>
            <option>This month</option>
          </select>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#3356AA]">
            <option>Newest first</option>
            <option>Oldest first</option>
          </select>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex gap-5 items-start">
        {/* ── left sidebar ── */}
        <aside className="w-52 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
            Category
          </p>
          <ul className="space-y-0.5">
            {FILTERS.map(({ key, label }) => {
              const active = filter === key;
              return (
                <li key={key}>
                  <button
                    onClick={() => setFilter(key)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#3356AA] text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 font-semibold ${
                        active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {counts[key]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ── center feed ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center py-16 text-gray-400 text-sm">
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex justify-center py-16 text-gray-400 text-sm">
              No announcements yet.
            </div>
          ) : (
            filtered.map((item) => (
              <AnnouncementCard
                key={item.id}
                item={item}
                variant="feed"
                onView={setSelected}
              />
            ))
          )}
        </div>

        {/* ── right sidebar ── */}
        <aside className="w-64 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-[#111928]">Latest</p>
          </div>
          {pinned.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">Nothing yet.</p>
          ) : (
            pinned.map((item) => (
              <PinnedCard key={item.id} item={item} onView={setSelected} />
            ))
          )}
        </aside>
      </div>
    </>
  );
}
