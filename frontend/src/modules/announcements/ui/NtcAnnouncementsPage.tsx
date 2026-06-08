import { useEffect, useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAnnouncementsStore } from "../model/announcementsStore";
import type { Announcement, AnnouncementTag, CreateAnnouncementRequest } from "../model/types";
import { HiOutlineChevronRight, HiPlus, HiX } from "react-icons/hi";
import { LuUpload } from "react-icons/lu";
import {
  AnnouncementCard,
  TAG_OPTIONS,
  TagBadge,
  formatManageDate,
  tagMeta,
} from "./AnnouncementCard";

// ─── constants ───────────────────────────────────────────────────────────────

const ALL_FILTERS: (AnnouncementTag | "all")[] = ["all", "event", "scholarship", "programme", "update"];

// ─── sub-components ──────────────────────────────────────────────────────────

function LatestCard({ item, onView }: { item: Announcement; onView: (a: Announcement) => void }) {
  const { t } = useTranslation();
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <TagBadge tag={item.tag} />
      <p className="text-sm font-semibold text-[#111928] mt-1.5 line-clamp-1">{item.title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{formatManageDate(item.created_at)}</p>
      <button
        onClick={() => onView(item)}
        className="flex items-center gap-1 mt-1.5 text-xs text-[#3356AA] font-medium hover:underline"
      >
        {t("announcements.manage.view")} <HiOutlineChevronRight size={12} />
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
        <p className="text-xs text-gray-400 mb-4">{formatManageDate(item.created_at)}</p>
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
  const { t } = useTranslation();
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
            <h2 className="text-xl font-bold text-[#111928]">{t("announcements.manage.newModal.title")}</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {t("ntcAdmin.announcements.newModalSubtitle")}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
            <HiX size={20} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-[#111928] mb-2">{t("announcements.manage.newModal.tag")}</label>
            <div className="flex items-center gap-2 flex-wrap">
              {TAG_OPTIONS.map((opt) => {
                const active = form.tag === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setForm((p) => ({ ...p, tag: opt.key }))}
                    className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
                    style={
                      active
                        ? { borderColor: opt.color, color: opt.color, backgroundColor: opt.bg }
                        : { borderColor: "#E5E7EB", color: "#6B7280", backgroundColor: "white" }
                    }
                  >
                    {t(`announcements.tags.${opt.key}`)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111928] mb-1.5">
              {t("announcements.manage.newModal.titleLabel")} <span className="text-[#3356AA]">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder={t("announcements.manage.newModal.titlePlaceholder")}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111928] mb-1.5">
              {t("announcements.manage.newModal.bodyLabel")} <span className="text-[#3356AA]">*</span>
            </label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              placeholder={t("announcements.manage.newModal.bodyPlaceholder")}
              rows={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA] resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{t("announcements.manage.newModal.bodyHint")}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111928] mb-1.5">
              {t("announcements.manage.newModal.coverImage")} <span className="text-gray-400 font-normal">{t("announcements.manage.newModal.optional")}</span>
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                dragOver ? "border-[#3356AA] bg-[#EEF2FF]" : "border-gray-200 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <LuUpload size={24} className="text-gray-400" />
              <p className="text-sm text-gray-400 font-mono">{t("announcements.manage.newModal.dropImage")}</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!valid || submitting}
            className="px-5 py-2.5 rounded-xl bg-[#3356AA] text-white text-sm font-semibold hover:bg-[#2c4892] disabled:opacity-50 transition-colors"
          >
            {submitting ? t("announcements.manage.newModal.publishing") : t("announcements.manage.newModal.publish")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

type FilterKey = AnnouncementTag | "all";

export default function NtcAnnouncementsPage() {
  const { t } = useTranslation();
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
          <h1 className="text-2xl font-bold text-[#111928]">{t("ntcAdmin.announcements.title")}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {t("ntcAdmin.announcements.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#3356AA] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2c4892] transition-colors flex-shrink-0"
        >
          <HiPlus size={18} /> {t("announcements.manage.newAnnouncement")}
        </button>
      </div>

      <div className="flex gap-5 items-start">
        {/* left sidebar */}
        <aside className="w-52 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
            {t("announcements.manage.category")}
          </p>
          <ul className="space-y-0.5">
            {ALL_FILTERS.map((key) => {
              const active = filter === key;
              const meta = key !== "all" ? tagMeta(key as AnnouncementTag) : null;
              const label = key === "all" ? t("announcements.manage.filterAll") : t(`announcements.tags.${key}`);
              return (
                <li key={key}>
                  <button
                    onClick={() => setFilter(key)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      active ? "text-white" : "text-gray-600 hover:bg-gray-50"
                    }`}
                    style={active ? { backgroundColor: meta?.color ?? "#3356AA" } : undefined}
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
            <div className="flex justify-center py-16 text-gray-400 text-sm">{t("announcements.manage.loading")}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-gray-400 text-sm">{t("announcements.empty")}</p>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 text-sm text-[#3356AA] font-medium hover:underline"
              >
                <HiPlus size={16} /> {t("announcements.manage.postFirst")}
              </button>
            </div>
          ) : (
            filtered.map((item) => (
              <AnnouncementCard
                key={item.id}
                item={item}
                variant="manage"
                onView={setSelected}
                onDelete={deleteNtc}
                onShare={() => {}}
              />
            ))
          )}
        </div>

        {/* right sidebar */}
        <aside className="w-64 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm font-bold text-[#111928] mb-2">{t("announcements.latest")}</p>
          {latest.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">{t("announcements.nothingYet")}</p>
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
