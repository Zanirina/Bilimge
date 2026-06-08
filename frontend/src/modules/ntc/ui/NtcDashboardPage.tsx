import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { universityService } from "../../universities/api/universityService";
import { useAnnouncementsStore } from "../../announcements/model/announcementsStore";
import type { UniversityListItem, NtcProgram } from "../../universities/model/types";
import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";

// ─── colour helpers ───────────────────────────────────────────────────────────

const PALETTE = [
  { bg: "#EBF2FE", text: "#3D5AFE" },
  { bg: "#F1ECFE", text: "#7C5CFF" },
  { bg: "#EEF2FF", text: "#3356AA" },
  { bg: "#FFF4E0", text: "#E08900" },
  { bg: "#E6F7EF", text: "#10B981" },
  { bg: "#FDE8F3", text: "#E5499A" },
];

function uniColor(code: string) {
  let h = 0;
  for (const c of String(code)) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
  return PALETTE[h];
}

function uniInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color, height = 32, width = 200 }: {
  data: number[]; color: string; height?: number; width?: number;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - ((v - min) / range) * (height - 4) - 2,
  ]);
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const areaD = pathD + ` L ${width} ${height} L 0 ${height} Z`;
  const gid = `ntcsg-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gid})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-44 text-sm font-medium text-gray-600 flex-shrink-0 truncate">{d.label}</div>
          <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
            <div className="h-full rounded-lg transition-all duration-500" style={{ width: `${(d.value / max) * 100}%`, background: d.color }} />
          </div>
          <div className="w-8 text-sm font-bold text-right text-gray-800">{d.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Calendar types & colours ─────────────────────────────────────────────────

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

const EVENT_COLOR: Record<string, { bg: string; text: string }> = {
  deadline:     { bg: "#EEF2FF", text: "#3356AA" },
  exam:         { bg: "#FFF4E0", text: "#E08900" },
  enrollment:   { bg: "#EBF2FE", text: "#3D5AFE" },
  open_day:     { bg: "#FDE8F3", text: "#E5499A" },
  event:        { bg: "#F1ECFE", text: "#7C5CFF" },
  announcement: { bg: "#E6F7EF", text: "#10B981" },
};
const eventColor = (type: string) => EVENT_COLOR[type] ?? EVENT_COLOR.event;

const EVENT_TYPES = ["event", "deadline", "exam", "enrollment", "open_day", "announcement"] as const;

// ─── Mini Calendar ────────────────────────────────────────────────────────────

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

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDay = isCurrentMonth ? today.getDate() : -1;

  return (
    <div className="grid grid-cols-7 gap-1">
      {["M","T","W","T","F","S","S"].map((d, i) => (
        <div key={i} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
      ))}
      {cells.map((d, i) => {
        const isToday = d === todayDay;
        const isSel = d === selectedDay;
        const isMarked = d !== null && markedDays.has(d) && !isSel;
        return (
          <button
            key={i}
            disabled={!d}
            onClick={() => d && onSelect(d)}
            className={`aspect-square text-xs font-medium rounded-lg flex items-center justify-center relative transition-all
              ${isSel ? "bg-[#3356AA] text-white font-bold" : isToday ? "bg-[#EEF2FF] text-[#3356AA] font-bold" : d ? "hover:bg-gray-100 text-gray-700" : ""}`}
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NtcDashboardPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || "en";
  const [universities, setUniversities] = useState<UniversityListItem[]>([]);
  const [programs, setPrograms] = useState<NtcProgram[]>([]);
  const { announcements, fetchList } = useAnnouncementsStore();

  // ── Calendar state (real API, NTC platform-wide events) ─────────────────────
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

  // ── Localized date helpers ──────────────────────────────────────────────────
  const monthLongLabel = (y: number, m: number) =>
    new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(y, m, 1));
  const monthAbbrLabel = (y: number, m: number) =>
    new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(y, m, 1)).toUpperCase();
  const dayLabel = (y: number, m: number, d: number) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(new Date(y, m, d));
  const todayLabel = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(now);

  useEffect(() => {
    universityService.getUniversities().then((r) => setUniversities(r.data));
    universityService.getNtcPrograms().then((r) => setPrograms(r.data));
    fetchList("ntc");
  }, [fetchList]);

  const loadEvents = (year: number, month: number) => {
    setEventsLoading(true);
    // The public list endpoint supports GET; NTC platform-wide events are the
    // public ones not tied to a university (university_id == null).
    http.get(endpoints.calendar.list, { params: { year, month: month + 1 } })
      .then((r) => setEvents(
        (r.data as ApiCalendarEvent[]).filter((e) => e.university_id == null && e.visibility === "public")
      ))
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  };

  useEffect(() => { loadEvents(currentYear, currentMonth); }, [currentYear, currentMonth]);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else { setCurrentMonth((m) => m - 1); }
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else { setCurrentMonth((m) => m + 1); }
    setSelectedDay(null);
  };

  const markedDays = new Set(events.map((e) => parseInt(e.start_date.split("-")[2], 10)));

  const eventsForDay = selectedDay
    ? events.filter((e) => parseInt(e.start_date.split("-")[2], 10) === selectedDay)
    : [];
  const shownEvents = eventsForDay.length
    ? eventsForDay
    : [...events].sort((a, b) => a.start_date.localeCompare(b.start_date));

  const eventTypeLabel = (type: string) =>
    t(`ntcAdmin.dashboard.eventTypes.${type}`, { defaultValue: type });

  const submitAddEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.start_date || saving) return;
    setSaving(true);
    try {
      await http.post(endpoints.calendar.ntc, {
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
    await http.delete(endpoints.calendar.ntcById(id));
    setEvents((ev) => ev.filter((e) => e.id !== id));
  };

  const avgMinScore = useMemo(() => {
    if (!programs.length) return 0;
    return Math.round(programs.reduce((s, p) => s + p.minimum_score, 0) / programs.length);
  }, [programs]);

  const topUnis = useMemo(
    () => [...universities].sort((a, b) => b.passing_score - a.passing_score).slice(0, 5),
    [universities]
  );

  const subjectCombos = useMemo(() => {
    const map: Record<string, { value: number; color: string }> = {};
    const colors = ["#3D5AFE","#7C5CFF","#10B981","#E08900","#3356AA","#E5499A"];
    programs.forEach((p) => {
      const key = `${p.subject_1_name} + ${p.subject_2_name}`;
      map[key] = { value: (map[key]?.value ?? 0) + 1, color: "" };
    });
    return Object.entries(map)
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, 6)
      .map(([label, { value }], i) => ({ label, value, color: colors[i % colors.length] }));
  }, [programs]);

  const recentAnnouncements = announcements.slice(0, 6);

  const STATS = [
    {
      tile: String(universities.length || "—"),
      tileBg: "#EBF2FE", tileText: "#3D5AFE",
      label: t("ntcAdmin.dashboard.stats.universities"),
      value: t("ntcAdmin.dashboard.stats.universitiesValue", { n: universities.length }),
      sub: t("ntcAdmin.dashboard.stats.universitiesSub", { n: universities.length }),
      spark: [40, 41, 42, 44, 45, 46, universities.length || 47],
      sc: "#3D5AFE",
    },
    {
      tile: String(programs.length || "—"),
      tileBg: "#F1ECFE", tileText: "#7C5CFF",
      label: t("ntcAdmin.dashboard.stats.programmes"),
      value: t("ntcAdmin.dashboard.stats.programmesValue", { n: programs.length }),
      sub: t("ntcAdmin.dashboard.stats.programmesSub"),
      spark: [120, 128, 134, 137, 140, 142, programs.length || 143],
      sc: "#7C5CFF",
    },
    {
      tile: String(announcements.length || "—"),
      tileBg: "#EEF2FF", tileText: "#3356AA",
      label: t("ntcAdmin.dashboard.stats.announcements"),
      value: t("ntcAdmin.dashboard.stats.announcementsValue", { n: announcements.length }),
      sub: t("ntcAdmin.dashboard.stats.announcementsSub"),
      spark: [1, 2, 2, 3, 4, announcements.length - 1, announcements.length || 4],
      sc: "#3356AA",
    },
    {
      tile: String(avgMinScore || "—"),
      tileBg: "#E6F7EF", tileText: "#10B981",
      label: t("ntcAdmin.dashboard.stats.avgScore"),
      value: t("ntcAdmin.dashboard.stats.avgScoreValue", { n: avgMinScore }),
      sub: t("ntcAdmin.dashboard.stats.avgScoreSub"),
      spark: [48, 50, 51, 52, 52, avgMinScore - 1, avgMinScore || 52],
      sc: "#10B981",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("ntcAdmin.dashboard.title")}</h1>
        <p className="text-sm text-gray-400 mt-1">{t("ntcAdmin.dashboard.subtitle", { date: todayLabel })}</p>
      </div>

      {/* stat strip */}
      <div className="grid grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                style={{ background: s.tileBg, color: s.tileText }}>
                {s.tile}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{s.label}</div>
                <div className="font-bold text-lg text-gray-900 mt-0.5 truncate">{s.value}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">{s.sub}</div>
            <Sparkline data={s.spark} color={s.sc} />
          </div>
        ))}
      </div>

      {/* calendar + top universities */}
      <div className="grid grid-cols-[1.3fr_1fr] gap-5">
        {/* calendar */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-lg text-gray-900">{t("ntcAdmin.dashboard.calendar.title")}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{t("ntcAdmin.dashboard.calendar.subtitle")}</p>
            </div>
            <button
              onClick={() => setAddEventOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3356AA] text-white text-sm font-semibold rounded-xl hover:bg-[#2c4892] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              {t("ntcAdmin.dashboard.calendar.addEvent")}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-gray-900 text-sm">{monthLongLabel(currentYear, currentMonth)}</div>
                <div className="flex gap-1">
                  <button onClick={prevMonth} title={t("ntcAdmin.dashboard.calendar.prevMonth")} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button onClick={nextMonth} title={t("ntcAdmin.dashboard.calendar.nextMonth")} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
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
            <div>
              <div className="text-xs font-bold text-gray-500 mb-3">
                {eventsForDay.length
                  ? t("ntcAdmin.dashboard.calendar.eventsOn", { date: dayLabel(currentYear, currentMonth, selectedDay!) })
                  : events.length
                    ? t("ntcAdmin.dashboard.calendar.allEvents", { month: monthLongLabel(currentYear, currentMonth) })
                    : t("ntcAdmin.dashboard.calendar.upcoming")}
              </div>
              {eventsLoading ? (
                <p className="text-sm text-gray-400">{t("ntcAdmin.dashboard.calendar.loading")}</p>
              ) : shownEvents.length === 0 ? (
                <p className="text-sm text-gray-400">{t("ntcAdmin.dashboard.calendar.noEvents")}</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                  {shownEvents.map((e) => {
                    const col = eventColor(e.event_type);
                    const day = parseInt(e.start_date.split("-")[2], 10);
                    const abbr = monthAbbrLabel(currentYear, parseInt(e.start_date.split("-")[1], 10) - 1);
                    return (
                      <div key={e.id} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 group">
                        <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                          style={{ background: col.bg, color: col.text }}>
                          <span className="text-base font-extrabold leading-none">{day}</span>
                          <span className="text-[8px] font-bold opacity-70">{abbr}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-800 line-clamp-1">{e.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: col.bg, color: col.text }}>{eventTypeLabel(e.event_type)}</span>
                            {e.start_time && <span className="text-xs text-gray-400">{e.start_time.slice(0, 5)}</span>}
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
                    <h3 className="font-bold text-xl text-gray-900">{t("ntcAdmin.dashboard.modal.title")}</h3>
                    <p className="text-sm text-gray-400 mt-1">{t("ntcAdmin.dashboard.modal.subtitle")}</p>
                  </div>
                  <button onClick={() => setAddEventOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600">{t("ntcAdmin.dashboard.modal.titleLabel")}</label>
                    <input
                      className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]"
                      placeholder={t("ntcAdmin.dashboard.modal.titlePlaceholder")}
                      value={newEvent.title}
                      onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600">{t("ntcAdmin.dashboard.modal.startDate")}</label>
                      <input type="date" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]"
                        value={newEvent.start_date} onChange={(e) => setNewEvent((p) => ({ ...p, start_date: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600">{t("ntcAdmin.dashboard.modal.time")}</label>
                      <input type="time" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]"
                        value={newEvent.start_time} onChange={(e) => setNewEvent((p) => ({ ...p, start_time: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600">{t("ntcAdmin.dashboard.modal.endDate")}</label>
                    <input type="date" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]"
                      value={newEvent.end_date} onChange={(e) => setNewEvent((p) => ({ ...p, end_date: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600">{t("ntcAdmin.dashboard.modal.type")}</label>
                    <div className="flex flex-wrap gap-2">
                      {EVENT_TYPES.map((k) => (
                        <button key={k} onClick={() => setNewEvent((p) => ({ ...p, event_type: k }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${newEvent.event_type === k ? "bg-[#EEF2FF] text-[#3356AA] border-[#3356AA]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                          {eventTypeLabel(k)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600">{t("ntcAdmin.dashboard.modal.description")}</label>
                    <textarea
                      className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA] resize-none h-20"
                      placeholder={t("ntcAdmin.dashboard.modal.descriptionPlaceholder")}
                      value={newEvent.description}
                      onChange={(e) => setNewEvent((p) => ({ ...p, description: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 px-6 pb-6 pt-2">
                  <button onClick={() => setAddEventOpen(false)} className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50">{t("ntcAdmin.dashboard.modal.cancel")}</button>
                  <button
                    onClick={submitAddEvent}
                    disabled={!newEvent.title.trim() || !newEvent.start_date || saving}
                    className="px-4 py-2 text-sm font-semibold bg-[#3356AA] text-white rounded-xl hover:bg-[#2c4892] disabled:opacity-60"
                  >
                    {saving ? t("ntcAdmin.dashboard.modal.saving") : t("ntcAdmin.dashboard.modal.save")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* top universities */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-lg text-gray-900">{t("ntcAdmin.dashboard.topUnis.title")}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{t("ntcAdmin.dashboard.topUnis.subtitle")}</p>
            </div>
          </div>
          {topUnis.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{t("ntcAdmin.dashboard.loading")}</p>
          ) : (
            <div className="flex flex-col">
              {topUnis.map((u, i) => {
                const col = uniColor(String(u.code));
                return (
                  <div key={u.code} className={`flex items-center gap-3 py-3 ${i < topUnis.length - 1 ? "border-b border-gray-100" : ""}`}>
                    <div className="text-sm font-bold text-gray-300 w-5">{i + 1}</div>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: col.bg, color: col.text }}>
                      {uniInitials(u.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{u.name}</div>
                      <div className="text-xs text-gray-400">{u.city}</div>
                    </div>
                    <div className="text-base font-bold text-gray-900">{u.passing_score}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* charts row */}
      <div className="grid grid-cols-2 gap-5">
        {/* subject combination bar chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="mb-5">
            <h3 className="font-bold text-lg text-gray-900">{t("ntcAdmin.dashboard.subjectChart.title")}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{t("ntcAdmin.dashboard.subjectChart.subtitle", { n: programs.length })}</p>
          </div>
          {subjectCombos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{t("ntcAdmin.dashboard.loading")}</p>
          ) : (
            <BarChart data={subjectCombos} />
          )}
        </div>

        {/* recent activity */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="mb-5">
            <h3 className="font-bold text-lg text-gray-900">{t("ntcAdmin.dashboard.recent.title")}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{t("ntcAdmin.dashboard.recent.subtitle")}</p>
          </div>
          {recentAnnouncements.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{t("ntcAdmin.dashboard.recent.empty")}</p>
          ) : (
            <div className="flex flex-col">
              {recentAnnouncements.map((a, i) => (
                <div key={a.id} className={`flex items-start gap-3 py-3 ${i < recentAnnouncements.length - 1 ? "border-b border-gray-100" : ""}`}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#EEF2FF] text-[#3356AA]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M3 11v2a2 2 0 0 0 2 2h1l4 4V7L6 11H5a2 2 0 0 0-2 0z"/><path d="M11 7v10l8 4V3z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 line-clamp-1">{a.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{new Date(a.created_at).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
