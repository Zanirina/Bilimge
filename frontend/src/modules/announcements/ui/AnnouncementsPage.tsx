import { useEffect, useState, useMemo } from "react";
import { useAnnouncementsStore } from "../model/announcementsStore";
import type { Announcement, AnnouncementAuthorType } from "../model/types";
import { BsPin } from "react-icons/bs";
import { LuBuilding2 } from "react-icons/lu";
import { MdOutlineSchool } from "react-icons/md";
import { HiOutlineChevronRight } from "react-icons/hi";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function authorLabel(a: Announcement) {
  return a.author_type === "university" && a.university_name
    ? a.university_name
    : "NTC";
}

function authorRole(a: Announcement) {
  return a.author_type === "university" ? "University" : "NTC Admin";
}

// ─── sub-components ─────────────────────────────────────────────────────────

function AuthorAvatar({ name, type }: { name: string; type: AnnouncementAuthorType }) {
  const bg = type === "university" ? "bg-purple-600" : "bg-[#3356AA]";
  return (
    <div
      className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
    >
      {initials(name)}
    </div>
  );
}

function TypeBadge({ type }: { type: AnnouncementAuthorType }) {
  if (type === "university") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
        <MdOutlineSchool size={12} /> University
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
      <LuBuilding2 size={12} /> NTC
    </span>
  );
}

function AnnouncementCard({
  item,
  onView,
}: {
  item: Announcement;
  onView: (a: Announcement) => void;
}) {
  const name = authorLabel(item);
  const role = authorRole(item);
  const preview = item.body.length > 200 ? item.body.slice(0, 200) + "…" : item.body;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
      {/* header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <AuthorAvatar name={name} type={item.author_type} />
          <div>
            <p className="text-sm font-semibold text-[#111928]">{name}</p>
            <p className="text-xs text-gray-400">
              {role} · {formatDate(item.created_at)}
            </p>
          </div>
        </div>
        <TypeBadge type={item.author_type} />
      </div>

      {/* body */}
      <div>
        <h3 className="text-[15px] font-bold text-[#111928] mb-1">{item.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{preview}</p>
      </div>

      {/* footer */}
      <div className="flex items-center justify-end pt-1 border-t border-gray-50">
        <button
          onClick={() => onView(item)}
          className="flex items-center gap-1 text-sm text-[#3356AA] font-medium hover:underline"
        >
          View Full Post <HiOutlineChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function PinnedCard({ item, onView }: { item: Announcement; onView: (a: Announcement) => void }) {
  const name = authorLabel(item);
  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 mb-2">
        <AuthorAvatar name={name} type={item.author_type} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#111928] truncate">{name}</p>
        </div>
        <span className="flex items-center gap-1 text-xs text-gray-400 font-medium flex-shrink-0">
          <BsPin size={11} /> Pinned
        </span>
      </div>
      <TypeBadge type={item.author_type} />
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.body}</p>
      <button
        onClick={() => onView(item)}
        className="flex items-center gap-1 mt-2 text-xs text-[#3356AA] font-medium hover:underline"
      >
        View post <HiOutlineChevronRight size={13} />
      </button>
    </div>
  );
}

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
          <AuthorAvatar name={name} type={item.author_type} />
          <div>
            <p className="font-semibold text-[#111928]">{name}</p>
            <p className="text-xs text-gray-400">
              {role} · {formatDate(item.created_at)}
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

  // top-3 for "pinned" sidebar
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
              <AnnouncementCard key={item.id} item={item} onView={setSelected} />
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
