import { useState, useEffect } from "react";
import { useAuthStore } from "../../../auth/model/authStore";
import { useUniversityStore } from "../../model/universityStore";

// ─── Sparkline ───────────────────────────────────────────────────────────────
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
  coral:  "#E85842",
  amber:  "#E08900",
  green:  "#10B981",
};
const FUNNEL_BG: Record<string, string> = {
  blue:   "#EBF2FE",
  purple: "#F1ECFE",
  coral:  "#FEEFEC",
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

// ─── Mini Calendar ────────────────────────────────────────────────────────────
const MARKED_DAYS = [14, 18, 22, 27];

function MiniCalendar({ selected, onSelect }: { selected: number; onSelect: (d: number) => void }) {
  const firstDow = new Date(2026, 4, 1).getDay();
  const offset = (firstDow + 6) % 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= 31; d++) cells.push(d);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-gray-900 text-sm">May 2026</div>
        <div className="flex gap-1">
          <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
        ))}
        {cells.map((d, i) => {
          const isToday = d === 14;
          const isSelected = d === selected;
          const isMarked = d !== null && MARKED_DAYS.includes(d) && !isSelected;
          return (
            <button
              key={i}
              disabled={!d}
              onClick={() => d && onSelect(d)}
              className={`aspect-square text-xs font-medium rounded-lg flex items-center justify-center relative transition-all
                ${isSelected ? "bg-[#E85842] text-white font-bold" : isToday ? "bg-[#FEEFEC] text-[#E85842] font-bold" : d ? "hover:bg-gray-100 text-gray-700" : ""}
              `}
            >
              {d}
              {isMarked && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E85842]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Static mock data ─────────────────────────────────────────────────────────
const EVENTS = [
  { date: 14, time: "14:00", title: "Open Day – Spring intake",        kind: "Event",    color: "coral" },
  { date: 18, time: "09:00", title: "UNT result deadline",             kind: "Deadline", color: "amber" },
  { date: 22, time: "12:00", title: "Programme committee meeting",     kind: "Meeting",  color: "blue" },
  { date: 27, time: "10:00", title: "Application portal closes",       kind: "Deadline", color: "amber" },
];

const TASKS_INIT = [
  { id: 1, text: "Review 12 new applicants this week",                  due: "Today",   done: false, priority: "high" as const },
  { id: 2, text: "Update Computer Science programme description",        due: "May 16",  done: false, priority: "med"  as const },
  { id: 3, text: "Post announcement for Open Day",                       due: "May 17",  done: false, priority: "high" as const },
  { id: 4, text: "Verify university accreditation document",             due: "May 20",  done: true,  priority: "low"  as const },
  { id: 5, text: "Respond to applicant Q&A inbox",                       due: "May 22",  done: false, priority: "med"  as const },
];

const PRIORITY_STYLE = {
  high: "bg-[#FEEFEC] text-[#E85842]",
  med:  "bg-[#FFF4E0] text-[#E08900]",
  low:  "bg-gray-100 text-gray-500",
};

const EVENT_TILE_STYLE: Record<string, string> = {
  coral: "bg-[#FEEFEC] text-[#E85842]",
  amber: "bg-[#FFF4E0] text-[#E08900]",
  blue:  "bg-[#EBF2FE] text-[#3D5AFE]",
};
const EVENT_CHIP_STYLE: Record<string, string> = {
  coral: "bg-[#FEEFEC] text-[#E85842]",
  amber: "bg-[#FFF4E0] text-[#E08900]",
  blue:  "bg-[#EBF2FE] text-[#3D5AFE]",
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function UniDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { myUniversity, myPrograms, fetchMyPrograms } = useUniversityStore();

  const [tasks, setTasks] = useState(TASKS_INIT);
  const [selectedDay, setSelectedDay] = useState(14);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "", kind: "Event" });

  useEffect(() => {
    fetchMyPrograms();
  }, []);

  const firstName = user?.first_name || "Admin";
  const uniName   = myUniversity?.name ?? "";

  const toggleTask = (id: number) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const eventsForDay = EVENTS.filter((e) => e.date === selectedDay);
  const upcomingEvents = [...EVENTS].sort((a, b) => a.date - b.date);
  const shownEvents = eventsForDay.length ? eventsForDay : upcomingEvents;

  // ── Stat strip ──────────────────────────────────────────────────────────────
  const StatStrip = (
    <div className="grid grid-cols-4 gap-4">
      {([
        { tile: "5",  color: "bg-[#EBF2FE] text-[#3D5AFE]",  label: "TOTAL APPLICANTS",  value: "5 students",  spark: [3,2,4,3,5,4,5] as number[], sc: "#3D5AFE" },
        { tile: "4",  color: "bg-[#F1ECFE] text-[#7C5CFF]",  label: "UNT SCORE ≥ 100",   value: "4 students",  spark: [1,2,3,2,3,4,4] as number[], sc: "#7C5CFF" },
        { tile: "10", color: "bg-[#E6F7EF] text-[#10B981]",  label: "PROGRAMMES SAVED",  value: "10 total",    spark: [6,5,8,7,9,10,10] as number[], sc: "#10B981" },
        { tile: `${myPrograms.length || 4}`, color: "bg-[#FEEFEC] text-[#E85842]", label: "ACTIVE PROGRAMMES", value: `${myPrograms.length || 4} published`, spark: [4,4,5,5,6,6,myPrograms.length || 6] as number[], sc: "#E85842" },
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

  // ── Calendar card ────────────────────────────────────────────────────────────
  const CalendarCard = (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold text-lg text-gray-900">Calendar</h3>
        <button
          onClick={() => setAddEventOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E85842] text-white text-sm font-semibold rounded-xl hover:bg-[#D24A36] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Event
        </button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <MiniCalendar selected={selectedDay} onSelect={setSelectedDay} />
        <div>
          <div className="text-xs font-bold text-gray-500 mb-3">
            {eventsForDay.length ? `Events on May ${selectedDay}` : "Upcoming"}
          </div>
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
            {shownEvents.map((e, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${EVENT_TILE_STYLE[e.color]}`}>
                  <span className="text-base font-extrabold leading-none">{e.date}</span>
                  <span className="text-[8px] font-bold opacity-70">MAY</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">{e.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${EVENT_CHIP_STYLE[e.color]}`}>{e.kind}</span>
                    <span className="text-xs text-gray-400">{e.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add event modal */}
      {addEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm" onClick={() => setAddEventOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start p-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-xl text-gray-900">Add calendar event</h3>
                <p className="text-sm text-gray-400 mt-1">Visible to your admin team.</p>
              </div>
              <button onClick={() => setAddEventOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">Title *</label>
                <input className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85842]/30 focus:border-[#E85842]" placeholder="e.g. Open Day – Spring intake" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">Date *</label>
                  <input type="date" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85842]/30 focus:border-[#E85842]" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">Time</label>
                  <input type="time" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85842]/30 focus:border-[#E85842]" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">Type</label>
                <div className="flex gap-2">
                  {["Event","Deadline","Meeting"].map((k) => (
                    <button key={k} onClick={() => setNewEvent({ ...newEvent, kind: k })}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${newEvent.kind === k ? "bg-[#FEEFEC] text-[#E85842] border-[#E85842]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-6 pt-2">
              <button onClick={() => setAddEventOpen(false)} className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={() => setAddEventOpen(false)} className="px-4 py-2 text-sm font-semibold bg-[#E85842] text-white rounded-xl hover:bg-[#D24A36]">Save event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Tasks card ───────────────────────────────────────────────────────────────
  const TasksCard = (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="font-bold text-lg text-gray-900">Tasks</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {tasks.filter((t) => !t.done).length} pending · {tasks.filter((t) => t.done).length} done
          </p>
        </div>
        <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-2.5 py-1.5 rounded-xl transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add task
        </button>
      </div>
      <div className="flex flex-col">
        {tasks.map((t, i) => (
          <div key={t.id} className={`flex items-start gap-3 py-3 ${i < tasks.length - 1 ? "border-b border-gray-100" : ""}`}>
            <button
              onClick={() => toggleTask(t.id)}
              className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${t.done ? "bg-[#10B981] border-0" : "border-2 border-gray-300 bg-white"}`}
            >
              {t.done && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${t.done ? "line-through text-gray-400" : "text-gray-800"}`}>{t.text}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">{t.due}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Programme popularity card ─────────────────────────────────────────────
  const popularityData = myPrograms.length > 0
    ? myPrograms.slice(0, 5).map((p, i) => ({
        label: p.local_name,
        value: [248, 192, 124, 188, 64][i] ?? 50,
        color: ["#3D5AFE","#7C5CFF","#E85842","#10B981","#E08900"][i],
      }))
    : [
        { label: "Software Engineering", value: 248, color: "#3D5AFE" },
        { label: "Computer Science",     value: 192, color: "#7C5CFF" },
        { label: "Cybersecurity",        value: 124, color: "#E85842" },
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
        { label: "Profile views",        value: 4820, color: "blue"   },
        { label: "Saved university",     value: 1240, color: "purple" },
        { label: "Saved programme",      value: 892,  color: "coral"  },
        { label: "Started application",  value: 421,  color: "amber"  },
        { label: "Submitted",            value: 184,  color: "green"  },
      ]} />
    </div>
  );

  // ── Page ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex justify-between items-start gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-sm text-gray-400 mt-1.5">
            Here's what's happening{uniName ? ` at ${uniName}` : ""} today, 14 May 2026.
          </p>
        </div>
      </div>

      {StatStrip}

      <div className="grid grid-cols-[1.4fr_1fr] gap-5">
        {CalendarCard}
        {TasksCard}
      </div>
      <div className="grid grid-cols-2 gap-5">
        {PopularityCard}
        {FunnelCard}
      </div>
    </div>
  );
}
