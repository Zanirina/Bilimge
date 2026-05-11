import { create } from "zustand";
import { universityService } from "../api/universityService";
import type { University, UniversityProgram, FieldOfStudy, Subject } from "./types";

type UniversityState = {
  universities: University[];
  programs: UniversityProgram[];
  fields: FieldOfStudy[];
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
  myUniversity: University | null;

  fetchMyUniversity: () => Promise<void>;
  fetchUniversities: () => Promise<void>;
  fetchPrograms: () => Promise<void>;
  fetchProgramsByUniversity: (code: string) => Promise<void>;
  fetchFields: () => Promise<void>;
  fetchSubjects: () => Promise<void>;
};

export const useUniversityStore = create<UniversityState>((set) => ({
  universities: [],
  programs: [],
  fields: [],
  subjects: [],
  isLoading: false,
  error: null,
  myUniversity: null as University | null,

  fetchUniversities: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await universityService.getUniversities();
      set({ universities: res.data });
    } catch {
      set({ error: "Failed to load universities" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPrograms: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await universityService.getUniversityPrograms();
      set({ programs: res.data });
    } catch {
      set({ error: "Failed to load programs" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProgramsByUniversity: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const res = await universityService.getUniversityProgramsByUniversity(code);
      set({ programs: res.data });
    } catch {
      set({ error: "Failed to load programs" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFields: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await universityService.getFields();
      set({ fields: res.data });
    } catch {
      set({ error: "Failed to load fields" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSubjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await universityService.getSubjects();
      set({ subjects: res.data });
    } catch {
      set({ error: "Failed to load subjects" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyUniversity: async () => {
    try {
      const res = await universityService.getMyUniversity();
      set({ myUniversity: res.data });
    } catch {
      set({ error: "Failed to load university" });
    }
  },
}));