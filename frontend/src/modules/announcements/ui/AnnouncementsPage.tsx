import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAnnouncementsStore } from "../model/announcementsStore";
import { useAuthStore } from "../../auth/model/authStore";
import type { Announcement } from "../model/types";
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
  const { t } = useTranslation();
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
          {t("common.close")}
        </button>
      </div>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

// Static filters plus one dynamic `uni:<code>` filter per saved university.
type FilterKey = "all" | "ntc" | "university" | `uni:${string}`;

const BASE_FILTERS: { key: FilterKey; labelKey: string }[] = [
  { key: "all", labelKey: "announcements.filters.all" },
  { key: "university", labelKey: "announcements.filters.universities" },
  { key: "ntc", labelKey: "announcements.filters.ntc" },
];

function FilterItem({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
          active ? "bg-[#3356AA] text-white" : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        <span className="truncate text-left">{label}</span>
        <span
          className={`ml-2 flex-shrink-0 text-xs rounded-full px-2 py-0.5 font-semibold ${
            active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          {count}
        </span>
      </button>
    </li>
  );
}

export default function AnnouncementsPage() {
  const { t, i18n } = useTranslation();
  const { announcements, isLoading, fetchList } = useAnnouncementsStore();
  const { isAuth, favoriteUniversities, fetchFavoriteUniversities } = useAuthStore();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchList();
  }, [fetchList, i18n.language]);

  useEffect(() => {
    if (isAuth) fetchFavoriteUniversities();
  }, [isAuth, fetchFavoriteUniversities]);

  // One extra category per saved university (empty list → no extra categories).
  const savedUniFilters = useMemo(
    () =>
      favoriteUniversities.map((u) => ({
        key: `uni:${u.university_code}` as FilterKey,
        label: u.short_name || u.university_name,
        code: String(u.university_code),
      })),
    [favoriteUniversities]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return announcements;
    if (filter === "ntc" || filter === "university")
      return announcements.filter((a) => a.author_type === filter);
    // dynamic `uni:<code>` → that university's announcements only
    const code = filter.slice(4);
    return announcements.filter(
      (a) => a.author_type === "university" && String(a.university_id) === code
    );
  }, [announcements, filter]);

  const pinned = useMemo(() => announcements.slice(0, 3), [announcements]);

  const counts: Record<string, number> = useMemo(() => {
    const c: Record<string, number> = {
      all: announcements.length,
      ntc: announcements.filter((a) => a.author_type === "ntc").length,
      university: announcements.filter((a) => a.author_type === "university").length,
    };
    savedUniFilters.forEach(({ key, code }) => {
      c[key] = announcements.filter(
        (a) => a.author_type === "university" && String(a.university_id) === code
      ).length;
    });
    return c;
  }, [announcements, savedUniFilters]);

  return (
    <>
      {selected && (
        <FullPostModal item={selected} onClose={() => setSelected(null)} />
      )}

      {/* page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#111928]">{t("announcements.title")}</h1>
      </div>

      {/* 3-column layout */}
      <div className="flex gap-5 items-start">
        {/* ── left sidebar ── */}
        <aside className="w-55 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-4">
          <ul className="space-y-0.5">
            {BASE_FILTERS.map(({ key, labelKey }) => (
              <FilterItem
                key={key}
                label={t(labelKey)}
                count={counts[key] ?? 0}
                active={filter === key}
                onClick={() => setFilter(key)}
              />
            ))}
          </ul>

          {savedUniFilters.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-5 mb-3 px-1">
                {t("announcements.savedUniversities")}
              </p>
              <ul className="space-y-0.5">
                {savedUniFilters.map(({ key, label }) => (
                  <FilterItem
                    key={key}
                    label={label}
                    count={counts[key] ?? 0}
                    active={filter === key}
                    onClick={() => setFilter(key)}
                  />
                ))}
              </ul>
            </>
          )}
        </aside>

        {/* ── center feed ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center py-16 text-gray-400 text-sm">
              {t("common.loading")}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex justify-center py-16 text-gray-400 text-sm">
              {t("announcements.empty")}
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
            <p className="text-sm font-bold text-[#111928]">{t("announcements.latest")}</p>
          </div>
          {pinned.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">{t("announcements.nothingYet")}</p>
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
