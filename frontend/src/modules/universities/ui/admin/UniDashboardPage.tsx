import { useState, useEffect } from "react";
import { useAuthStore } from "../../../auth/model/authStore";
import { useUniversityStore } from "../../model/universityStore";
import { http } from "../../../../shared/api/http";
import { endpoints } from "../../../../shared/api/endpoints";

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

const EVENT_TYPE_LABELS: Record<string, string> = {
  deadline: "Deadline",
  exam: "Exam",
  enrollment: "Enrollment",
  open_day: "Open Day",
  event: "Event",
  announcement: "Announcement",
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

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color = "#3D5AFE", height = 32, width = 160 }: {
  data: number[]; color?: string; height?: number; width?: number;
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
  const gradId = `sg-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value));
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
  const max = stages[0].value;
  return (
    <div className="flex flex-col gap-3">
      {stages.map((s, i) => {
        const pct = (s.value / max) * 100;
        const drop = i > 0 ? Math.round((1 - s.value / stages[i - 1].value) * 100) : null;
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

  useEffect(() => { fetchMyPrograms(); }, []);

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

  const firstName = user?.first_name || "Admin";
  const uniName   = myUniversity?.name ?? "";

  // ── Stat strip ──────────────────────────────────────────────────────────────
  const StatStrip = (
    <div className="grid grid-cols-4 gap-4">
      {([
        { tile: "5",  color: "bg-[#EBF2FE] text-[#3D5AFE]",  label: "TOTAL APPLICANTS",    value: "5 students",  spark: [3,2,4,3,5,4,5] as number[], sc: "#3D5AFE" },
        { tile: "4",  color: "bg-[#F1ECFE] text-[#7C5CFF]",  label: "UNT SCORE ≥ 100",     value: "4 students",  spark: [1,2,3,2,3,4,4] as number[], sc: "#7C5CFF" },
        { tile: "10", color: "bg-[#E6F7EF] text-[#10B981]",  label: "PROGRAMMES SAVED",    value: "10 total",    spark: [6,5,8,7,9,10,10] as number[], sc: "#10B981" },
        { tile: `${myPrograms.length || 4}`, color: "bg-[#EEF2FF] text-[#3356AA]", label: "ACTIVE PROGRAMMES", value: `${myPrograms.length || 4} published`, spark: [4,4,5,5,6,6,myPrograms.length || 6] as number[], sc: "#3356AA" },
      ]).map((s, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${s.color}`}>
              {s.tile}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{s.label}</div>
              <div className="font-bold text-lg text-gray-900 mt-0.5">{s.value}</div>
            </div>
          </div>
          <Sparkline data={s.spark} color={s.sc} height={32} width={200} />
        </div>
      ))}
    </div>
  );

  // ── Calendar card ─────────────────────────────────────────────────────────────
  const CalendarCard = (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold text-lg text-gray-900">Calendar</h3>
        <button
          onClick={() => setAddEventOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3356AA] text-white text-sm font-semibold rounded-xl hover:bg-[#D24A36] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Event
        </button>
      </div>
      <div className="grid grid-cols-[280px_1fr] gap-6">
        {/* Left: mini calendar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-900 text-sm">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
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
              ? `Events on ${MONTH_NAMES[currentMonth]} ${selectedDay}`
              : events.length
                ? `All events — ${MONTH_NAMES[currentMonth]} ${currentYear}`
                : ""}
          </div>
          {eventsLoading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : shownEvents.length === 0 ? (
            <p className="text-sm text-gray-400">No events this month.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {shownEvents.map((e) => {
                const color = EVENT_COLOR[e.event_type] ?? "blue";
                const day = parseInt(e.start_date.split("-")[2], 10);
                const monthAbbr = MONTH_NAMES[parseInt(e.start_date.split("-")[1], 10) - 1]?.slice(0, 3).toUpperCase();
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
                          {EVENT_TYPE_LABELS[e.event_type] ?? e.event_type}
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
                <h3 className="font-bold text-xl text-gray-900">Add calendar event</h3>
                <p className="text-sm text-gray-400 mt-1">Visible to your university followers.</p>
              </div>
              <button onClick={() => setAddEventOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">Title *</label>
                <input
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]"
                  placeholder="e.g. Open Day – Spring intake"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(p => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">Start date *</label>
                  <input type="date" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]"
                    value={newEvent.start_date} onChange={(e) => setNewEvent(p => ({ ...p, start_date: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">Time</label>
                  <input type="time" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]"
                    value={newEvent.start_time} onChange={(e) => setNewEvent(p => ({ ...p, start_time: e.target.value }))} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">End date</label>
                <input type="date" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]"
                  value={newEvent.end_date} onChange={(e) => setNewEvent(p => ({ ...p, end_date: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">Type</label>
                <div className="flex flex-wrap gap-2">
                  {(["event","deadline","exam","enrollment","open_day","announcement"] as const).map((k) => (
                    <button key={k} onClick={() => setNewEvent(p => ({ ...p, event_type: k }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${newEvent.event_type === k ? "bg-[#EEF2FF] text-[#3356AA] border-[#3356AA]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                      {EVENT_TYPE_LABELS[k]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">Description</label>
                <textarea
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA] resize-none h-20"
                  placeholder="Optional details…"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(p => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-6 pt-2">
              <button onClick={() => setAddEventOpen(false)} className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button
                onClick={submitAddEvent}
                disabled={!newEvent.title.trim() || !newEvent.start_date || saving}
                className="px-4 py-2 text-sm font-semibold bg-[#3356AA] text-white rounded-xl hover:bg-[#D24A36] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Programme popularity card ─────────────────────────────────────────────
  const popularityData = myPrograms.length > 0
    ? myPrograms.slice(0, 5).map((p, i) => ({
        label: p.local_name,
        value: [248, 192, 124, 188, 64][i] ?? 50,
        color: ["#3D5AFE","#7C5CFF","#3356AA","#10B981","#E08900"][i],
      }))
    : [
        { label: "Software Engineering", value: 248, color: "#3D5AFE" },
        { label: "Computer Science",     value: 192, color: "#7C5CFF" },
        { label: "Cybersecurity",        value: 124, color: "#3356AA" },
        { label: "Data Science",         value: 188, color: "#10B981" },
        { label: "Big Data Analysis",    value: 64,  color: "#E08900" },
      ];

  const PopularityCard = (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="font-bold text-lg text-gray-900">Programme popularity</h3>
          <p className="text-xs text-gray-400 mt-0.5">Times saved by applicants this month</p>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {["Saves","Views"].map((t) => (
            <button key={t} className="px-3 py-1.5 rounded-lg text-xs font-semibold first:bg-white first:shadow-sm text-gray-700 hover:text-gray-900 transition-all">{t}</button>
          ))}
        </div>
      </div>
      <BarChart data={popularityData} />
    </div>
  );

  // ── Application funnel card ───────────────────────────────────────────────
  const FunnelCard = (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="font-bold text-lg text-gray-900">Application funnel</h3>
          <p className="text-xs text-gray-400 mt-0.5">Spring 2026 intake · 30-day trail</p>
        </div>
        <button className="flex items-center gap-1 text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
          Last 30 days
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
      </div>
      <FunnelChart stages={[
        { label: "Profile views",       value: 4820, color: "blue"   },
        { label: "Saved university",    value: 1240, color: "purple" },
        { label: "Saved programme",     value: 892,  color: "coral"  },
        { label: "Started application", value: 421,  color: "amber"  },
        { label: "Submitted",           value: 184,  color: "green"  },
      ]} />
    </div>
  );

  // ── Page ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-start gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-sm text-gray-400 mt-1.5">
            Here's what's happening{uniName ? ` at ${uniName}` : ""} today, {now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
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
