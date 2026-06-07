import { create } from "zustand";
import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";
import type { Announcement } from "../../announcements/model/types";

// Calendar event shape (only the fields we need for reminders).
export type CalendarEvent = {
  id: number;
  title: string;
  event_type?: string;
  start_date: string; // "YYYY-MM-DD"
  university_id?: number | null;
  university_name?: string;
};

export type NotificationKind = "announcement" | "reminder";

export type NotificationItem = {
  id: string; // stable: "ann:<id>" | "event:<id>:d3" | "event:<id>:d1"
  kind: NotificationKind;
  title: string;
  body: string;
  timestamp: number; // ms, for sorting
  iso: string; // source date (for relative-time display)
  read: boolean;
};

const READ_KEY = "bilimge.notifications.read";
const DAY = 24 * 60 * 60 * 1000;
// Only announcements created within this window count as "new".
const ANNOUNCEMENT_WINDOW_DAYS = 14;

function loadReadIds(): string[] {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveReadIds(ids: string[]) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(ids));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

function startOfDay(ms: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * Derive the notification list from raw announcements + events and the set of
 * read ids. Pure function so it's easy to memoize and test.
 */
export function buildNotifications(
  announcements: Announcement[],
  events: CalendarEvent[],
  readIds: string[],
  now: number = Date.now()
): NotificationItem[] {
  const read = new Set(readIds);
  const items: NotificationItem[] = [];

  // ── new announcements (within the recent window) ──
  for (const a of announcements) {
    const t = new Date(a.created_at).getTime();
    if (Number.isNaN(t)) continue;
    if (now - t > ANNOUNCEMENT_WINDOW_DAYS * DAY) continue;
    const id = `ann:${a.id}`;
    const source = a.author_type === "ntc" ? "NTC" : a.university_name || "University";
    items.push({
      id,
      kind: "announcement",
      title: a.title,
      body: `New announcement · ${source}`,
      timestamp: t,
      iso: a.created_at,
      read: read.has(id),
    });
  }

  // ── event reminders: one at 3 days out, one at 1 day out ──
  const today = startOfDay(now);
  for (const e of events) {
    if (!e.start_date) continue;
    const [y, m, d] = e.start_date.split("-").map(Number);
    if (!y || !m || !d) continue;
    const eventDay = new Date(y, m - 1, d).getTime();
    const daysUntil = Math.round((eventDay - today) / DAY);

    // 3-day reminder covers {3,2}, 1-day reminder covers {1,0} → no overlap,
    // and every event gets both nudges as its date approaches.
    let threshold: 3 | 1 | null = null;
    if (daysUntil === 3 || daysUntil === 2) threshold = 3;
    else if (daysUntil === 1 || daysUntil === 0) threshold = 1;
    if (!threshold) continue;

    const id = `event:${e.id}:d${threshold}`;
    const when =
      daysUntil <= 0 ? "today" : daysUntil === 1 ? "tomorrow" : `in ${daysUntil} days`;
    items.push({
      id,
      kind: "reminder",
      title: e.title,
      body: `Event ${when}`,
      timestamp: eventDay - threshold * DAY, // when the reminder became relevant
      iso: e.start_date,
      read: read.has(id),
    });
  }

  items.sort((a, b) => b.timestamp - a.timestamp);
  return items;
}

type NotificationsState = {
  announcements: Announcement[];
  events: CalendarEvent[];
  readIds: string[];
  loading: boolean;
  loaded: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => void;
  markManyRead: (ids: string[]) => void;
};

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  announcements: [],
  events: [],
  readIds: loadReadIds(),
  loading: false,
  loaded: false,

  refresh: async () => {
    set({ loading: true });
    try {
      const [annRes, evRes] = await Promise.all([
        http.get<Announcement[]>(endpoints.announcements.list),
        http.get<CalendarEvent[]>(endpoints.calendar.list),
      ]);
      set({
        announcements: Array.isArray(annRes.data) ? annRes.data : [],
        events: Array.isArray(evRes.data) ? evRes.data : [],
        loaded: true,
      });
    } catch {
      // keep whatever we had; bell just won't update this cycle
    } finally {
      set({ loading: false });
    }
  },

  markRead: (id) => {
    const next = Array.from(new Set([...get().readIds, id]));
    saveReadIds(next);
    set({ readIds: next });
  },

  markManyRead: (ids) => {
    const next = Array.from(new Set([...get().readIds, ...ids]));
    saveReadIds(next);
    set({ readIds: next });
  },
}));
