import { create } from "zustand";
import { announcementsService } from "../api/announcementsService";
import type { Announcement, AnnouncementAuthorType, CreateAnnouncementRequest } from "./types";

type AnnouncementsState = {
  announcements: Announcement[];
  current: Announcement | null;
  isLoading: boolean;
  error: string | null;

  fetchList: (authorType?: AnnouncementAuthorType) => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  createNtc: (data: CreateAnnouncementRequest) => Promise<void>;
  createUniversity: (data: CreateAnnouncementRequest) => Promise<void>;
  deleteNtc: (id: number) => Promise<void>;
  deleteUniversity: (id: number) => Promise<void>;
  updateUniversity: (id: number, data: CreateAnnouncementRequest) => Promise<void>;
  updateNtc: (id: number, data: CreateAnnouncementRequest) => Promise<void>;
};

export const useAnnouncementsStore = create<AnnouncementsState>((set) => ({
  announcements: [],
  current: null,
  isLoading: false,
  error: null,

  fetchList: async (authorType) => {
    set({ isLoading: true, error: null });
    try {
      const res = await announcementsService.getList(authorType);
      set({ announcements: res.data });
    } catch {
      set({ error: "Failed to load announcements" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await announcementsService.getById(id);
      set({ current: res.data });
    } catch {
      set({ error: "Failed to load announcement" });
    } finally {
      set({ isLoading: false });
    }
  },

  createNtc: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await announcementsService.createNtc(data);
      set((s) => ({ announcements: [res.data, ...s.announcements] }));
    } catch {
      set({ error: "Failed to create announcement" });
      throw new Error("Failed to create announcement");
    } finally {
      set({ isLoading: false });
    }
  },

  createUniversity: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await announcementsService.createUniversity(data);
      set((s) => ({ announcements: [res.data, ...s.announcements] }));
    } catch {
      set({ error: "Failed to create announcement" });
      throw new Error("Failed to create announcement");
    } finally {
      set({ isLoading: false });
    }
  },

  deleteNtc: async (id) => {
    await announcementsService.deleteNtc(id);
    set((s) => ({ announcements: s.announcements.filter((a) => a.id !== id) }));
  },

  deleteUniversity: async (id) => {
    await announcementsService.deleteUniversity(id);
    set((s) => ({ announcements: s.announcements.filter((a) => a.id !== id) }));
  },

  updateUniversity: async (id, data) => {
    const res = await announcementsService.updateUniversity(id, data);
    set((s) => ({
      announcements: s.announcements.map((a) => (a.id === id ? res.data : a)),
    }));
  },

  updateNtc: async (id, data) => {
    const res = await announcementsService.updateNtc(id, data);
    set((s) => ({
      announcements: s.announcements.map((a) => (a.id === id ? res.data : a)),
    }));
  },
}));
