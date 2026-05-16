import { useEffect, useState, useMemo } from "react";
import { universityService } from "../../universities/api/universityService";
import { useAnnouncementsStore } from "../../announcements/model/announcementsStore";
import type { UniversityListItem, NtcProgram } from "../../universities/model/types";

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

// ─── Mini Calendar ────────────────────────────────────────────────────────────

const NTC_EVENTS = [
  { date: 18, time: "09:00", title: "UNT main session · Round 1 begins", kind: "Exam",      color: { bg: "#FFF4E0", text: "#E08900" } },
  { date: 22, time: "23:59", title: "Programme catalogue freeze",         kind: "Deadline",  color: { bg: "#EEF2FF", text: "#3356AA" } },
  { date: 25, time: "14:00", title: "University compliance review",       kind: "Review",    color: { bg: "#EBF2FE", text: "#3D5AFE" } },
  { date: 28, time: "10:00", title: "Results published",                  kind: "Milestone", color: { bg: "#E6F7EF", text: "#10B981" } },
];
const MARKED = NTC_EVENTS.map((e) => e.date);

function MiniCalendar({ selected, onSelect }: { selected: number; onSelect: (d: number) => void }) {
  const firstDow = new Date(2026, 4, 1).getDay();
  const offset = (firstDow + 6) % 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= 31; d++) cells.push(d);
  const today = 15;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-gray-900 text-sm">May 2026</div>
        <div className="flex gap-1">
          {["←","→"].map((a, i) => (
            <button key={i} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 text-sm">{a}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
        ))}
        {cells.map((d, i) => {
          const isToday = d === today;
          const isSel = d === selected;
          const isMarked = d !== null && MARKED.includes(d) && !isSel;
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
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NtcDashboardPage() {
  const [universities, setUniversities] = useState<UniversityListItem[]>([]);
  const [programs, setPrograms] = useState<NtcProgram[]>([]);
  const [selectedDay, setSelectedDay] = useState(15);
  const { announcements, fetchList } = useAnnouncementsStore();

  useEffect(() => {
    universityService.getUniversities().then((r) => setUniversities(r.data));
    universityService.getNtcPrograms().then((r) => setPrograms(r.data));
    fetchList("ntc");
  }, [fetchList]);

  const eventsForDay = NTC_EVENTS.filter((e) => e.date === selectedDay);
  const shownEvents = eventsForDay.length ? eventsForDay : NTC_EVENTS;

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
      label: "UNIVERSITIES",
      value: `${universities.length} registered`,
      sub: `${universities.length} on Bilimge platform`,
      spark: [40, 41, 42, 44, 45, 46, universities.length || 47],
      sc: "#3D5AFE",
    },
    {
      tile: String(programs.length || "—"),
      tileBg: "#F1ECFE", tileText: "#7C5CFF",
      label: "PROGRAMMES",
      value: `${programs.length} in catalogue`,
      sub: "National programme registry",
      spark: [120, 128, 134, 137, 140, 142, programs.length || 143],
      sc: "#7C5CFF",
    },
    {
      tile: String(announcements.length || "—"),
      tileBg: "#EEF2FF", tileText: "#3356AA",
      label: "ANNOUNCEMENTS",
      value: `${announcements.length} posted`,
      sub: "NTC platform-wide messages",
      spark: [1, 2, 2, 3, 4, announcements.length - 1, announcements.length || 4],
      sc: "#3356AA",
    },
    {
      tile: String(avgMinScore || "—"),
      tileBg: "#E6F7EF", tileText: "#10B981",
      label: "AVG MIN. SCORE",
      value: `${avgMinScore} points avg`,
      sub: "Average minimum UNT threshold",
      spark: [48, 50, 51, 52, 52, avgMinScore - 1, avgMinScore || 52],
      sc: "#10B981",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">National Testing Center · Overview</h1>
        <p className="text-sm text-gray-400 mt-1">System-wide stats for the Bilimge admissions platform. Today: 15 May 2026.</p>
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
              <h3 className="font-bold text-lg text-gray-900">UNT Calendar</h3>
              <p className="text-xs text-gray-400 mt-0.5">National testing milestones and review windows</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3356AA] text-white text-sm font-semibold rounded-xl hover:bg-[#2c4892] transition-colors">
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
                    <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                      style={{ background: e.color.bg, color: e.color.text }}>
                      <span className="text-base font-extrabold leading-none">{e.date}</span>
                      <span className="text-[8px] font-bold opacity-70">MAY</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 line-clamp-1">{e.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: e.color.bg, color: e.color.text }}>{e.kind}</span>
                        <span className="text-xs text-gray-400">{e.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* top universities */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Top Universities</h3>
              <p className="text-xs text-gray-400 mt-0.5">By UNT passing score</p>
            </div>
          </div>
          {topUnis.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Loading…</p>
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
            <h3 className="font-bold text-lg text-gray-900">Programmes by subject combination</h3>
            <p className="text-xs text-gray-400 mt-0.5">Distribution across the {programs.length} catalogue entries</p>
          </div>
          {subjectCombos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Loading…</p>
          ) : (
            <BarChart data={subjectCombos} />
          )}
        </div>

        {/* recent activity */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="mb-5">
            <h3 className="font-bold text-lg text-gray-900">Recent announcements</h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest NTC platform-wide messages</p>
          </div>
          {recentAnnouncements.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No announcements yet.</p>
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
                    <div className="text-xs text-gray-400 mt-0.5">{new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
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
