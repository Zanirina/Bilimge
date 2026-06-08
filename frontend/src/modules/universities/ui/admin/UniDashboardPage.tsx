import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../auth/model/authStore";
import { useUniversityStore } from "../../model/universityStore";
import { universityService } from "../../api/universityService";
import { announcementsService } from "../../../announcements/api/announcementsService";
import { http } from "../../../../shared/api/http";
import { endpoints } from "../../../../shared/api/endpoints";
import type { UniApplicant } from "../../model/types";

type ApiCalendarEvent = {
  id: number;
  title: string;
  description: string;
  event_type: string;
  visibility: string;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  university_id: number | null;
  created_at: string;
};

const EVENT_COLOR: Record<string, string> = {
  deadline: "amber",
  exam: "purple",
  enrollment: "blue",
  open_day: "coral",
  event: "coral",
  announcement: "blue",
};

const EVENT_TILE_STYLE: Record<string, string> = {
  coral:  "bg-[#EEF2FF] text-[#3356AA]",
  amber:  "bg-[#FFF4E0] text-[#E08900]",
  blue:   "bg-[#EBF2FE] text-[#3D5AFE]",
  purple: "bg-[#F1ECFE] text-[#7C5CFF]",
};

const EVENT_CHIP_STYLE: Record<string, string> = {
  coral:  "bg-[#EEF2FF] text-[#3356AA]",
  amber:  "bg-[#FFF4E0] text-[#E08900]",
  blue:   "bg-[#EBF2FE] text-[#3D5AFE]",
  purple: "bg-[#F1ECFE] text-[#7C5CFF]",
};

const EVENT_TYPES = ["event", "deadline", "exam", "enrollment", "open_day", "announcement"] as const;

const CHART_COLORS = ["#3D5AFE", "#7C5CFF", "#3356AA", "#10B981", "#E08900"];

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-36 text-sm font-medium text-gray-600 flex-shrink-0 truncate">{d.label}</div>
          <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden relative">
            <div
              className="h-full rounded-lg transition-all duration-500"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color }}
            />
          </div>
          <div className="w-10 text-sm font-bold text-right text-gray-800">{d.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Funnel Chart ─────────────────────────────────────────────────────────────
const FUNNEL_COLORS: Record<string, string> = {
  blue:   "#3D5AFE",
  purple: "#7C5CFF",
  coral:  "#3356AA",
  amber:  "#E08900",
  green:  "#10B981",
};
const FUNNEL_BG: Record<string, string> = {
  blue:   "#EBF2FE",
  purple: "#F1ECFE",
  coral:  "#EEF2FF",
  amber:  "#FFF4E0",
  green:  "#E6F7EF",
};

function FunnelChart({ stages }: { stages: { label: string; value: number; color: string }[] }) {
  const max = Math.max(stages[0]?.value ?? 0, 1);
  return (
    <div className="flex flex-col gap-3">
      {stages.map((s, i) => {
        const pct = (s.value / max) * 100;
        const prev = i > 0 ? stages[i - 1].value : 0;
        const drop = i > 0 && prev > 0 ? Math.round((1 - s.value / prev) * 100) : null;
        return (
          <div key={i}>
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: FUNNEL_BG[s.color], color: FUNNEL_COLORS[s.color] }}
                >
                  {i + 1}
                </div>
                <span className="text-sm font-semibold text-gray-800">{s.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {drop !== null && <span className="text-xs text-gray-400">↓ {drop}%</span>}
                <span className="text-sm font-bold text-gray-900">{s.value.toLocaleString()}</span>
              </div>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: FUNNEL_COLORS[s.color] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Mini Calendar ─────────────────────────────────────────────────────────────
function MiniCalendar({ year, month, selectedDay, onSelect, markedDays }: {
  year: number;
  month: number;
  selectedDay: number | null;
  onSelect: (d: number) => void;
  markedDays: Set<number>;
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const offset = (firstDow + 6) % 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayDate = new Date();
  const isCurrentMonth = todayDate.getFullYear() === year && todayDate.getMonth() === month;
  const todayDay = isCurrentMonth ? todayDate.getDate() : -1;

  return (
    <div className="grid grid-cols-7 gap-1">
      {["M","T","W","T","F","S","S"].map((d, i) => (
        <div key={i} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
      ))}
      {cells.map((d, i) => {
        const isToday = d === todayDay;
        const isSelected = d === selectedDay;
        const isMarked = d !== null && markedDays.has(d) && !isSelected;
        return (
          <button
            key={i}
            disabled={!d}
            onClick={() => d && onSelect(d)}
            className={`aspect-square text-xs font-medium rounded-lg flex items-center justify-center relative transition-all
              ${isSelected ? "bg-[#3356AA] text-white font-bold" : isToday ? "bg-[#EEF2FF] text-[#3356AA] font-bold" : d ? "hover:bg-gray-100 text-gray-700" : ""}
            `}
          >
            {d}
            {isMarked && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#3356AA]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function UniDashboardPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || "en";
  const user = useAuthStore((s) => s.user);
  const { myUniversity, myPrograms, fetchMyPrograms } = useUniversityStore();

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const [events, setEvents] = useState<ApiCalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "", description: "", event_type: "event",
    start_date: "", start_time: "", end_date: "",
  });
  const [saving, setSaving] = useState(false);

  // ── Stats data ────────────────────────────────────────────────────────────
  const [applicants, setApplicants] = useState<UniApplicant[]>([]);
  const [announcementsCount, setAnnouncementsCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => { fetchMyPrograms(); }, []);

  useEffect(() => {
    setStatsLoading(true);
    Promise.all([
      universityService.getMyApplicants().then((r) => setApplicants(r.data)).catch(() => setApplicants([])),
      announcementsService.getList("university").then((r) => setAnnouncementsCount(r.data.length)).catch(() => setAnnouncementsCount(0)),
    ]).finally(() => setStatsLoading(false));
  }, []);

  // ── Localized date helpers ──────────────────────────────────────────────────
  const monthLongLabel = (y: number, m: number) =>
    new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(y, m, 1));
  const dayLabel = (y: number, m: number, d: number) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(new Date(y, m, d));
  const monthAbbrLabel = (y: number, m: number) =>
    new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(y, m, 1)).toUpperCase();

  const loadEvents = (year: number, month: number) => {
    setEventsLoading(true);
    http.get(endpoints.calendar.myUniversity, { params: { year, month: month + 1 } })
      .then(r => setEvents(r.data))
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  };

  useEffect(() => { loadEvents(currentYear, currentMonth); }, [currentYear, currentMonth]);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else { setCurrentMonth(m => m - 1); }
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else { setCurrentMonth(m => m + 1); }
    setSelectedDay(null);
  };

  const markedDays = new Set(
    events.map(e => parseInt(e.start_date.split("-")[2], 10))
  );

  const eventsForDay = selectedDay
    ? events.filter(e => parseInt(e.start_date.split("-")[2], 10) === selectedDay)
    : [];
  const shownEvents = eventsForDay.length ? eventsForDay : [...events].sort((a, b) => a.start_date.localeCompare(b.start_date));

  const submitAddEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.start_date) return;
    setSaving(true);
    try {
      await http.post(endpoints.calendar.myUniversity, {
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        event_type: newEvent.event_type,
        start_date: newEvent.start_date,
        start_time: newEvent.start_time || null,
        end_date: newEvent.end_date || null,
      });
      const [ey, em] = newEvent.start_date.split("-").map(Number);
      if (ey === currentYear && em - 1 === currentMonth) loadEvents(currentYear, currentMonth);
      setAddEventOpen(false);
      setNewEvent({ title: "", description: "", event_type: "event", start_date: "", start_time: "", end_date: "" });
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (id: number) => {
    await http.delete(endpoints.calendar.myUniversityById(id));
    setEvents(ev => ev.filter(e => e.id !== id));
  };

  const eventTypeLabel = (type: string) =>
    t(`uniAdmin.dashboard.eventTypes.${type}`, { defaultValue: type });

  const firstName = user?.first_name || "Admin";
  const uniName   = myUniversity?.name ?? "";

  // ── Derived stats ────────────────────────────────────────────────────────────
  const programmesSaved = useMemo(
    () => applicants.reduce((s, a) => s + a.favorited_programs.length, 0),
    [applicants]
  );

  // ── Stat strip ──────────────────────────────────────────────────────────────
  const stats = [
    {
      tile: applicants.length,
      color: "bg-[#EBF2FE] text-[#3D5AFE]",
      label: t("uniAdmin.dashboard.stats.followers"),
      value: t("uniAdmin.dashboard.stats.followersValue", { n: applicants.length }),
    },
    {
      tile: announcementsCount,
      color: "bg-[#F1ECFE] text-[#7C5CFF]",
      label: t("uniAdmin.dashboard.stats.announcements"),
      value: t("uniAdmin.dashboard.stats.announcementsValue", { n: announcementsCount }),
    },
    {
      tile: programmesSaved,
      color: "bg-[#E6F7EF] text-[#10B981]",
      label: t("uniAdmin.dashboard.stats.saved"),
      value: t("uniAdmin.dashboard.stats.savedValue", { n: programmesSaved }),
    },
    {
      tile: myPrograms.length,
      color: "bg-[#EEF2FF] text-[#3356AA]",
      label: t("uniAdmin.dashboard.stats.active"),
      value: t("uniAdmin.dashboard.stats.activeValue", { n: myPrograms.length }),
    },
  ];

  const StatStrip = (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${s.color}`}>
            {statsLoading ? "—" : s.tile}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{s.label}</div>
            <div className="font-bold text-lg text-gray-900 mt-0.5">
              {statsLoading ? t("uniAdmin.dashboard.calendar.loading") : s.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── Calendar card ─────────────────────────────────────────────────────────────
  const CalendarCard = (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold text-lg text-gray-900">{t("uniAdmin.dashboard.calendar.title")}</h3>
        <button
          onClick={() => setAddEventOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3356AA] text-white text-sm font-semibold rounded-xl hover:bg-[#D24A36] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          {t("uniAdmin.dashboard.calendar.addEvent")}
        </button>
      </div>
      <div className="grid grid-cols-[280px_1fr] gap-6">
        {/* Left: mini calendar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-900 text-sm">
              {monthLongLabel(currentYear, currentMonth)}
            </span>
            <div className="flex gap-1">
              <button onClick={prevMonth} title={t("uniAdmin.dashboard.calendar.prevMonth")} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button onClick={nextMonth} title={t("uniAdmin.dashboard.calendar.nextMonth")} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
          <MiniCalendar
            year={currentYear}
            month={currentMonth}
            selectedDay={selectedDay}
            onSelect={setSelectedDay}
            markedDays={markedDays}
          />
        </div>

        {/* Right: events list */}
        <div>
          <div className="text-xs font-bold text-gray-500 mb-3">
            {eventsForDay.length
              ? t("uniAdmin.dashboard.calendar.eventsOn", { date: dayLabel(currentYear, currentMonth, selectedDay!) })
              : events.length
                ? t("uniAdmin.dashboard.calendar.allEvents", { month: monthLongLabel(currentYear, currentMonth) })
                : ""}
          </div>
          {eventsLoading ? (
            <p className="text-sm text-gray-400">{t("uniAdmin.dashboard.calendar.loading")}</p>
          ) : shownEvents.length === 0 ? (
            <p className="text-sm text-gray-400">{t("uniAdmin.dashboard.calendar.noEvents")}</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {shownEvents.map((e) => {
                const color = EVENT_COLOR[e.event_type] ?? "blue";
                const day = parseInt(e.start_date.split("-")[2], 10);
                const monthAbbr = monthAbbrLabel(currentYear, parseInt(e.start_date.split("-")[1], 10) - 1);
                return (
                  <div key={e.id} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 group">
                    <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${EVENT_TILE_STYLE[color]}`}>
                      <span className="text-base font-extrabold leading-none">{day}</span>
                      <span className="text-[8px] font-bold opacity-70">{monthAbbr}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{e.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${EVENT_CHIP_STYLE[color]}`}>
                          {eventTypeLabel(e.event_type)}
                        </span>
                        {e.start_time && (
                          <span className="text-xs text-gray-400">{e.start_time.slice(0, 5)}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEvent(e.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity flex-shrink-0 self-center"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add event modal */}
      {addEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm" onClick={() => setAddEventOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start p-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-xl text-gray-900">{t("uniAdmin.dashboard.modal.title")}</h3>
                <p className="text-sm text-gray-400 mt-1">{t("uniAdmin.dashboard.modal.subtitle")}</p>
              </div>
              <button onClick={() => setAddEventOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">{t("uniAdmin.dashboard.modal.titleLabel")}</label>
                <input
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]"
                  placeholder={t("uniAdmin.dashboard.modal.titlePlaceholder")}
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(p => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">{t("uniAdmin.dashboard.modal.startDate")}</label>
                  <input type="date" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]"
                    value={newEvent.start_date} onChange={(e) => setNewEvent(p => ({ ...p, start_date: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">{t("uniAdmin.dashboard.modal.time")}</label>
                  <input type="time" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]"
                    value={newEvent.start_time} onChange={(e) => setNewEvent(p => ({ ...p, start_time: e.target.value }))} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">{t("uniAdmin.dashboard.modal.endDate")}</label>
                <input type="date" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]"
                  value={newEvent.end_date} onChange={(e) => setNewEvent(p => ({ ...p, end_date: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">{t("uniAdmin.dashboard.modal.type")}</label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPES.map((k) => (
                    <button key={k} onClick={() => setNewEvent(p => ({ ...p, event_type: k }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${newEvent.event_type === k ? "bg-[#EEF2FF] text-[#3356AA] border-[#3356AA]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                      {eventTypeLabel(k)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">{t("uniAdmin.dashboard.modal.description")}</label>
                <textarea
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA] resize-none h-20"
                  placeholder={t("uniAdmin.dashboard.modal.descriptionPlaceholder")}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(p => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-6 pt-2">
              <button onClick={() => setAddEventOpen(false)} className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50">{t("uniAdmin.dashboard.modal.cancel")}</button>
              <button
                onClick={submitAddEvent}
                disabled={!newEvent.title.trim() || !newEvent.start_date || saving}
                className="px-4 py-2 text-sm font-semibold bg-[#3356AA] text-white rounded-xl hover:bg-[#D24A36] disabled:opacity-60"
              >
                {saving ? t("uniAdmin.dashboard.modal.saving") : t("uniAdmin.dashboard.modal.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Programme popularity card (real data: saves per programme) ────────────────
  const popularityData = useMemo(() => {
    const counts = new Map<string, { label: string; value: number }>();
    applicants.forEach((a) =>
      a.favorited_programs.forEach((p) => {
        const cur = counts.get(p.code);
        counts.set(p.code, { label: p.local_name, value: (cur?.value ?? 0) + 1 });
      })
    );
    return [...counts.values()]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map((d, i) => ({ ...d, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [applicants]);

  const PopularityCard = (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{t("uniAdmin.dashboard.popularity.title")}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{t("uniAdmin.dashboard.popularity.subtitle")}</p>
        </div>
      </div>
      {statsLoading ? (
        <p className="text-sm text-gray-400">{t("uniAdmin.dashboard.calendar.loading")}</p>
      ) : popularityData.length === 0 ? (
        <p className="text-sm text-gray-400">{t("uniAdmin.dashboard.popularity.empty")}</p>
      ) : (
        <BarChart data={popularityData} />
      )}
    </div>
  );

  // ── Application funnel card (real data: nested engagement stages) ─────────────
  const funnelStages = useMemo(() => {
    const savers = applicants.filter((a) => a.favorited_programs.length > 0);
    return [
      { label: t("uniAdmin.dashboard.funnel.followers"),      value: applicants.length, color: "blue" },
      { label: t("uniAdmin.dashboard.funnel.savedProgramme"), value: savers.length, color: "purple" },
      { label: t("uniAdmin.dashboard.funnel.withScore"),      value: savers.filter((a) => a.unt_score != null).length, color: "amber" },
      { label: t("uniAdmin.dashboard.funnel.highScore"),      value: savers.filter((a) => (a.unt_score ?? 0) >= 100).length, color: "green" },
    ];
  }, [applicants, t]);

  const FunnelCard = (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{t("uniAdmin.dashboard.funnel.title")}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{t("uniAdmin.dashboard.funnel.subtitle")}</p>
        </div>
      </div>
      {statsLoading ? (
        <p className="text-sm text-gray-400">{t("uniAdmin.dashboard.calendar.loading")}</p>
      ) : applicants.length === 0 ? (
        <p className="text-sm text-gray-400">{t("uniAdmin.dashboard.funnel.empty")}</p>
      ) : (
        <FunnelChart stages={funnelStages} />
      )}
    </div>
  );

  // ── Page ──────────────────────────────────────────────────────────────────
  const todayLabel = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(now);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-start gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {t("uniAdmin.dashboard.greeting", { name: firstName })}
          </h1>
          <p className="text-sm text-gray-400 mt-1.5">
            {uniName
              ? t("uniAdmin.dashboard.subtitleWithUni", { uni: uniName, date: todayLabel })
              : t("uniAdmin.dashboard.subtitle", { date: todayLabel })}
          </p>
        </div>
      </div>

      {StatStrip}
      {CalendarCard}

      <div className="grid grid-cols-2 gap-5">
        {PopularityCard}
        {FunnelCard}
      </div>
    </div>
  );
}
