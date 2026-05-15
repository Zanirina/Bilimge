import { useEffect, useState, useMemo, useRef } from "react";
import { useAnnouncementsStore } from "../model/announcementsStore";
import type { Announcement, AnnouncementTag, CreateAnnouncementRequest } from "../model/types";
import { HiOutlineChevronRight, HiOutlineShare, HiOutlineTrash, HiPlus, HiX } from "react-icons/hi";
import { LuCalendar, LuUpload } from "react-icons/lu";

// ─── constants ───────────────────────────────────────────────────────────────

const TAGS: { key: AnnouncementTag; label: string; color: string; bg: string }[] = [
  { key: "event",       label: "Event",       color: "#E85842", bg: "#FEEFEC" },
  { key: "scholarship", label: "Scholarship", color: "#10B981", bg: "#E6F7EF" },
  { key: "programme",   label: "Programme",   color: "#7C5CFF", bg: "#F1ECFE" },
  { key: "update",      label: "Update",      color: "#3D5AFE", bg: "#EBF2FE" },
];

const ALL_FILTERS: { key: AnnouncementTag | "all"; label: string }[] = [
  { key: "all",         label: "All" },
  { key: "event",       label: "Event" },
  { key: "scholarship", label: "Scholarship" },
  { key: "programme",   label: "Programme" },
  { key: "update",      label: "Update" },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function tagMeta(tag: AnnouncementTag) {
  return TAGS.find((t) => t.key === tag) ?? null;
}

// ─── sub-components ──────────────────────────────────────────────────────────

function TagBadge({ tag }: { tag: AnnouncementTag }) {
  const meta = tagMeta(tag);
  if (!meta) return null;
  return (
    <span
      className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
      style={{ color: meta.color, backgroundColor: meta.bg }}
    >
      {meta.label}
    </span>
  );
}

function AnnouncementCard({
  item,
  onView,
  onDelete,
}: {
  item: Announcement;
  onView: (a: Announcement) => void;
  onDelete: (id: number) => void;
}) {
  const preview = item.body.length > 180 ? item.body.slice(0, 180) + "…" : item.body;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <TagBadge tag={item.tag} />
        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            title="Share"
          >
            <HiOutlineShare size={16} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <HiOutlineTrash size={16} />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-[15px] font-bold text-[#111928] mb-1">{item.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{preview}</p>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <LuCalendar size={13} />
          {formatDate(item.created_at)}
        </span>
        <button
          onClick={() => onView(item)}
          className="flex items-center gap-1 text-sm text-[#3356AA] font-medium hover:underline"
        >
          View post <HiOutlineChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function LatestCard({ item, onView }: { item: Announcement; onView: (a: Announcement) => void }) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <TagBadge tag={item.tag} />
      <p className="text-sm font-semibold text-[#111928] mt-1.5 line-clamp-1">{item.title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.created_at)}</p>
      <button
        onClick={() => onView(item)}
        className="flex items-center gap-1 mt-1.5 text-xs text-[#3356AA] font-medium hover:underline"
      >
        View <HiOutlineChevronRight size={12} />
      </button>
    </div>
  );
}

function FullPostModal({ item, onClose }: { item: Announcement; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <TagBadge tag={item.tag} />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><HiX size={20} /></button>
        </div>
        <h2 className="text-xl font-bold text-[#111928] mb-2">{item.title}</h2>
        <p className="text-xs text-gray-400 mb-4">{formatDate(item.created_at)}</p>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.body}</p>
      </div>
    </div>
  );
}

// ─── New Announcement Modal ───────────────────────────────────────────────────

const EMPTY_FORM: CreateAnnouncementRequest = { title: "", body: "", tag: "event" };

function NewAnnouncementModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: CreateAnnouncementRequest) => Promise<void>;
}) {
  const [form, setForm] = useState<CreateAnnouncementRequest>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const valid = form.title.trim() && form.body.trim();

  async function handleSubmit() {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-[#111928]">New announcement</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Will appear on all university pages and applicants' feeds.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
            <HiX size={20} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-[#111928] mb-2">Tag</label>
            <div className="flex items-center gap-2 flex-wrap">
              {TAGS.map((t) => {
                const active = form.tag === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setForm((p) => ({ ...p, tag: t.key }))}
                    className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
                    style={
                      active
                        ? { borderColor: t.color, color: t.color, backgroundColor: t.bg }
                        : { borderColor: "#E5E7EB", color: "#6B7280", backgroundColor: "white" }
                    }
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111928] mb-1.5">
              Title <span className="text-[#E85842]">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Headline applicants will see"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85842]/30 focus:border-[#E85842]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111928] mb-1.5">
              Body <span className="text-[#E85842]">*</span>
            </label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              placeholder="Tell applicants what's happening and what to do next..."
              rows={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E85842]/30 focus:border-[#E85842] resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">Markdown supported. Aim for 1–3 short paragraphs.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111928] mb-1.5">
              Cover image <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                dragOver ? "border-[#E85842] bg-[#FEEFEC]" : "border-gray-200 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <LuUpload size={24} className="text-gray-400" />
              <p className="text-sm text-gray-400 font-mono">Drop image or click to upload</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!valid || submitting}
            className="px-5 py-2.5 rounded-xl bg-[#E85842] text-white text-sm font-semibold hover:bg-[#d04535] disabled:opacity-50 transition-colors"
          >
            {submitting ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

type FilterKey = AnnouncementTag | "all";

export default function NtcAnnouncementsPage() {
  const { announcements, isLoading, fetchList, createNtc, deleteNtc } =
    useAnnouncementsStore();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchList("ntc");
  }, [fetchList]);

  const filtered = useMemo(() => {
    if (filter === "all") return announcements;
    return announcements.filter((a) => a.tag === filter);
  }, [announcements, filter]);

  const latest = useMemo(() => announcements.slice(0, 3), [announcements]);

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = { all: announcements.length, event: 0, scholarship: 0, programme: 0, update: 0, "": 0 };
    announcements.forEach((a) => { if (a.tag) c[a.tag] = (c[a.tag] ?? 0) + 1; });
    return c;
  }, [announcements]);

  return (
    <>
      {selected && <FullPostModal item={selected} onClose={() => setSelected(null)} />}
      {showCreate && (
        <NewAnnouncementModal
          onClose={() => setShowCreate(false)}
          onSubmit={createNtc}
        />
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111928]">Post Announcements</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Announcements published here appear on all university pages and applicant feeds.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#E85842] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d04535] transition-colors flex-shrink-0"
        >
          <HiPlus size={18} /> New announcement
        </button>
      </div>

      <div className="flex gap-5 items-start">
        {/* left sidebar */}
        <aside className="w-52 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
            Category
          </p>
          <ul className="space-y-0.5">
            {ALL_FILTERS.map(({ key, label }) => {
              const active = filter === key;
              const meta = key !== "all" ? tagMeta(key as AnnouncementTag) : null;
              return (
                <li key={key}>
                  <button
                    onClick={() => setFilter(key)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      active ? "text-white" : "text-gray-600 hover:bg-gray-50"
                    }`}
                    style={active ? { backgroundColor: meta?.color ?? "#E85842" } : undefined}
                  >
                    <span>{label}</span>
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 font-semibold ${
                        active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {counts[key] ?? 0}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* center feed */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center py-16 text-gray-400 text-sm">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-gray-400 text-sm">No announcements yet.</p>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 text-sm text-[#E85842] font-medium hover:underline"
              >
                <HiPlus size={16} /> Post your first announcement
              </button>
            </div>
          ) : (
            filtered.map((item) => (
              <AnnouncementCard
                key={item.id}
                item={item}
                onView={setSelected}
                onDelete={deleteNtc}
              />
            ))
          )}
        </div>

        {/* right sidebar */}
        <aside className="w-64 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm font-bold text-[#111928] mb-2">Latest</p>
          {latest.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">Nothing yet.</p>
          ) : (
            latest.map((item) => (
              <LatestCard key={item.id} item={item} onView={setSelected} />
            ))
          )}
        </aside>
      </div>
    </>
  );
}
