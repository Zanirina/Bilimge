import { create } from "zustand";
import { majorService } from "../api/majorService";
import type { NtcProgram, FieldOfStudy, Subject } from "../../universities/model/types";

type MajorState = {
  ntcPrograms: NtcProgram[];
  fields: FieldOfStudy[];
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;

  fetchNtcPrograms: () => Promise<void>;
  fetchFields: () => Promise<void>;
  fetchSubjects: () => Promise<void>;
};

export const useMajorStore = create<MajorState>((set) => ({
  ntcPrograms: [],
  fields: [],
  subjects: [],
  isLoading: false,
  error: null,

  fetchNtcPrograms: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await majorService.getNtcPrograms();
      set({ ntcPrograms: res.data });
    } catch {
      set({ error: "Failed to load programs" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFields: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await majorService.getFields();
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
      const res = await majorService.getSubjects();
      set({ subjects: res.data });
    } catch {
      set({ error: "Failed to load subjects" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
