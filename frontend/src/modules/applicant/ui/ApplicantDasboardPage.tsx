import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdAdd, MdChevronLeft, MdChevronRight, MdClose, MdDelete } from "react-icons/md";
import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";
import { useAuthStore } from "../../auth/model/authStore";

type CalendarEvent = {
  id: number;
  title: string;
  description: string;
  event_type: string;
  visibility: "public" | "university" | "personal" | string;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  university_id: number | null;
  created_at: string;
};

const EVENT_TYPES = [
  "event",
  "deadline",
  "exam",
  "enrollment",
  "open_day",
  "announcement",
] as const;
type EventTypeKey = (typeof EVENT_TYPES)[number];

const EVENT_COLOR: Record<string, { bg: string; ink: string; dot: string }> = {
  deadline:     { bg: "#FFF4E0", ink: "#E08900", dot: "#E08900" },
  exam:         { bg: "#F1ECFE", ink: "#7C5CFF", dot: "#7C5CFF" },
  enrollment:   { bg: "#EBF2FE", ink: "#3D5AFE", dot: "#3D5AFE" },
  open_day:     { bg: "#FEEFEC", ink: "#E85842", dot: "#E85842" },
  event:        { bg: "#EEF2FF", ink: "#3356AA", dot: "#3356AA" },
  announcement: { bg: "#E6F7EF", ink: "#10B981", dot: "#10B981" },
};

const VISIBILITY_COLOR: Record<string, { bg: string; ink: string }> = {
  public:     { bg: "#F2F2F5", ink: "#4A4A55" },
  university: { bg: "#EBF2FE", ink: "#3D5AFE" },
  personal:   { bg: "#FEEFEC", ink: "#E85842" },
};

function ymdLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function colorForType(key: string) {
  return EVENT_COLOR[key] ?? EVENT_COLOR.event;
}

export default function ApplicantDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { t, i18n } = useTranslation();
  const locale = i18n.language || "en";

  // Localized, Monday-first weekday short labels (Jan 1 2024 is a Monday).
  const weekLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2024, 0, 1 + i))
      ),
    [locale]
  );
  const monthLabel = (y: number, m: number) =>
    new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(y, m, 1));
  const formatLongDate = (ymd: string) => {
    const [y, m, d] = ymd.split("-").map(Number);
    if (!y || !m || !d) return ymd;
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(y, m - 1, d));
  };
  const eventTypeLabel = (key: string) => t(`dashboard.eventTypes.${key}`);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(ymdLocal(now));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_type: "event" as EventTypeKey,
    start_date: ymdLocal(now),
    start_time: "",
    end_date: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    http
      .get<CalendarEvent[]>(endpoints.calendar.list, {
        params: { year, month: month + 1 },
      })
      .then((r) => setEvents(Array.isArray(r.data) ? r.data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [year, month]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of events) {
      (map[e.start_date] ||= []).push(e);
    }
    return map;
  }, [events]);

  const cells = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay();
    const offset = (firstDow + 6) % 7; // make Monday first
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr: ({ date: string; day: number; inMonth: boolean } | null)[] = [];

    // leading days from previous month for visual padding
    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = offset - 1; i >= 0; i--) {
      const d = prevMonthLast - i;
      const date = new Date(year, month - 1, d);
      arr.push({ date: ymdLocal(date), day: d, inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      arr.push({ date: ymdLocal(date), day: d, inMonth: true });
    }
    // trailing days only to complete the final week (no extra next-month week)
    while (arr.length % 7 !== 0) {
      const last = arr[arr.length - 1];
      const nextDay = last ? new Date(last.date) : new Date(year, month + 1, 1);
      nextDay.setDate(nextDay.getDate() + 1);
      arr.push({ date: ymdLocal(nextDay), day: nextDay.getDate(), inMonth: false });
    }
    return arr;
  }, [year, month]);

  const todayYmd = ymdLocal(new Date());
  const selectedEvents = (eventsByDay[selectedDate] ?? []).slice().sort((a, b) =>
    (a.start_time ?? "").localeCompare(b.start_time ?? "")
  );

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };
  const goToday = () => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(ymdLocal(today));
  };

  const openAdd = (date?: string) => {
    setForm({
      title: "",
      description: "",
      event_type: "event",
      start_date: date ?? selectedDate ?? ymdLocal(new Date()),
      start_time: "",
      end_date: "",
    });
    setError(null);
    setAddOpen(true);
  };

  const submitAdd = async () => {
    if (!form.title.trim() || !form.start_date) return;
    setSaving(true);
    setError(null);
    try {
      const res = await http.post<CalendarEvent>(endpoints.calendar.personal, {
        title: form.title.trim(),
        description: form.description.trim(),
        event_type: form.event_type,
        start_date: form.start_date,
        start_time: form.start_time || null,
        end_date: form.end_date || null,
      });
      const created = res.data;
      const [y, m] = created.start_date.split("-").map(Number);
      if (y === year && m - 1 === month) {
        setEvents((prev) => [...prev, created]);
      }
      setSelectedDate(created.start_date);
      setAddOpen(false);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? t("dashboard.errors.save"));
    } finally {
      setSaving(false);
    }
  };

  const deletePersonal = async (id: number) => {
    try {
      await http.delete(endpoints.calendar.personalById(id));
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError(t("dashboard.errors.delete"));
    }
  };

  const greet = user?.first_name
    ? t("dashboard.greetingHi", { name: user.first_name })
    : t("dashboard.greetingBack");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greet}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("dashboard.subtitle")}
          </p>
        </div>
        <button
          onClick={() => openAdd()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3356AA] text-white text-sm font-semibold hover:bg-[#2c4892] transition"
        >
          <MdAdd size={18} /> {t("dashboard.addEvent")}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">
              {monthLabel(year, month)}
            </h2>
            <button
              onClick={goToday}
              className="text-xs font-semibold text-[#3356AA] px-3 py-1.5 rounded-lg border border-[#3356AA]/30 hover:bg-[#EEF2FF]"
            >
              {t("dashboard.today")}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
              title={t("dashboard.prevMonth")}
            >
              <MdChevronLeft size={20} />
            </button>
            <button
              onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
              title={t("dashboard.nextMonth")}
            >
              <MdChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
          {/* Month grid */}
          <div className="border-r border-gray-100">
            <div className="grid grid-cols-7 border-b border-gray-100">
              {weekLabels.map((w) => (
                <div
                  key={w}
                  className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider py-2"
                >
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-fr">
              {cells.map((c, i) => {
                if (!c) return <div key={i} className="border-b border-r border-gray-100 min-h-[110px]" />;
                const isToday = c.date === todayYmd;
                const isSelected = c.date === selectedDate;
                const dayEvents = eventsByDay[c.date] ?? [];
                const shown = dayEvents.slice(0, 3);
                const more = dayEvents.length - shown.length;
                return (
                  <button
                    key={c.date + "-" + i}
                    onClick={() => setSelectedDate(c.date)}
                    onDoubleClick={() => openAdd(c.date)}
                    className={`text-left border-b border-r border-gray-100 min-h-[110px] p-2 transition relative ${
                      c.inMonth ? "bg-white" : "bg-gray-50/60"
                    } ${isSelected ? "ring-2 ring-[#3356AA] ring-inset" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-bold w-6 h-6 inline-flex items-center justify-center rounded-full ${
                          isToday
                            ? "bg-[#3356AA] text-white"
                            : c.inMonth
                            ? "text-gray-700"
                            : "text-gray-400"
                        }`}
                      >
                        {c.day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-bold text-gray-400">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {shown.map((e) => {
                        const c2 = colorForType(e.event_type);
                        return (
                          <div
                            key={e.id}
                            className="text-[10.5px] leading-tight px-1.5 py-0.5 rounded truncate font-semibold"
                            style={{ background: c2.bg, color: c2.ink }}
                            title={e.title}
                          >
                            {e.start_time ? `${e.start_time.slice(0, 5)} · ` : ""}
                            {e.title}
                          </div>
                        );
                      })}
                      {more > 0 && (
                        <span className="text-[10px] font-semibold text-gray-400 pl-1">
                          {t("dashboard.moreCount", { count: more })}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side: selected day events */}
          <aside className="p-5 flex flex-col gap-3 min-h-[400px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {t("dashboard.selectedDay")}
                </p>
                <p className="text-base font-bold text-gray-900">
                  {formatLongDate(selectedDate)}
                </p>
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-gray-400">{t("common.loading")}</p>
            ) : selectedEvents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center">
                <p className="text-sm text-gray-500">{t("dashboard.noEvents")}</p>
                <button
                  onClick={() => openAdd(selectedDate)}
                  className="mt-2 text-xs font-semibold text-[#3356AA] hover:underline"
                >
                  {t("dashboard.addEvent")}
                </button>
              </div>
            ) : (
              <ul className="flex flex-col gap-2 overflow-y-auto pr-1">
                {selectedEvents.map((e) => {
                  const c = colorForType(e.event_type);
                  const v = VISIBILITY_COLOR[e.visibility] ?? VISIBILITY_COLOR.public;
                  return (
                    <li
                      key={e.id}
                      className="rounded-xl border border-gray-100 p-3 flex flex-col gap-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {e.title}
                          </p>
                          {e.start_time && (
                            <p className="text-xs text-gray-400">
                              {e.start_time.slice(0, 5)}
                              {e.end_time ? ` – ${e.end_time.slice(0, 5)}` : ""}
                            </p>
                          )}
                        </div>
                        {e.visibility === "personal" && (
                          <button
                            onClick={() => deletePersonal(e.id)}
                            title={t("common.delete")}
                            className="text-gray-300 hover:text-red-500 shrink-0"
                          >
                            <MdDelete size={16} />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: c.bg, color: c.ink }}
                        >
                          {eventTypeLabel(e.event_type)}
                        </span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: v.bg, color: v.ink }}
                        >
                          {t(`dashboard.visibility.${e.visibility}`)}
                        </span>
                      </div>
                      {e.description && (
                        <p className="text-xs text-gray-500 whitespace-pre-line">
                          {e.description}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-auto pt-3 border-t border-gray-100">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                {t("dashboard.legend")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EVENT_TYPES.map((et) => {
                  const c = colorForType(et);
                  return (
                    <span
                      key={et}
                      className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full"
                      style={{ background: c.bg, color: c.ink }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: c.dot }}
                      />
                      {eventTypeLabel(et)}
                    </span>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Add personal event modal */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          onClick={() => setAddOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-xl text-gray-900">{t("dashboard.modal.title")}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {t("dashboard.modal.subtitle")}
                </p>
              </div>
              <button
                onClick={() => setAddOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <MdClose size={18} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">{t("dashboard.form.title")}</label>
                <input
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]"
                  placeholder={t("dashboard.form.titlePlaceholder")}
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">{t("dashboard.form.startDate")}</label>
                  <input
                    type="date"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, start_date: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">{t("dashboard.form.time")}</label>
                  <input
                    type="time"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]"
                    value={form.start_time}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, start_time: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">{t("dashboard.form.endDate")}</label>
                <input
                  type="date"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, end_date: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">{t("dashboard.form.type")}</label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPES.map((k) => (
                    <button
                      key={k}
                      onClick={() => setForm((p) => ({ ...p, event_type: k }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        form.event_type === k
                          ? "bg-[#EEF2FF] text-[#3356AA] border-[#3356AA]"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {eventTypeLabel(k)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">{t("dashboard.form.description")}</label>
                <textarea
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA] resize-none h-20"
                  placeholder={t("dashboard.form.descriptionPlaceholder")}
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setAddOpen(false)}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={submitAdd}
                disabled={saving || !form.title.trim() || !form.start_date}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3356AA] text-white text-sm font-semibold hover:bg-[#2c4892] disabled:opacity-50"
              >
                {saving ? t("common.saving") : t("dashboard.addEventConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
