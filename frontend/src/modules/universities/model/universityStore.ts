import { create } from "zustand";
import { universityService } from "../api/universityService";
import type {
  University,
  UniversityListItem,
  UniversityProgram,
  UniversityProgramDetail,
  FieldOfStudy,
  Subject,
  NtcProgram,
  Language,
  EntranceRequirement,
  EntranceExam,
  AcademicMobility,
  CreateProgramRequest,
  UpdateMyUniversityInfoRequest,
  NtcEditUniversityRequest,
} from "./types";

type UniversityState = {
  universities: UniversityListItem[];
  programs: UniversityProgram[];
  fields: FieldOfStudy[];
  subjects: Subject[];
  ntcPrograms: NtcProgram[];
  isLoading: boolean;
  error: string | null;

  // Uni Admin state
  myUniversity: University | null;
  myPrograms: UniversityProgram[];
  myLanguages: Language[];
  myRequirements: EntranceRequirement[];
  myExams: EntranceExam[];
  myMobility: AcademicMobility[];

  // Actions — public
  fetchUniversities: () => Promise<void>;
  fetchPrograms: () => Promise<void>;
  fetchProgramsByUniversity: (code: string) => Promise<void>;
  fetchProgramDetail: (code: string) => Promise<UniversityProgramDetail>;
  fetchFields: () => Promise<void>;
  fetchSubjects: () => Promise<void>;
  fetchNtcPrograms: () => Promise<void>;

  // Actions — NTC Admin
  ntcEditUniversity: (code: string, data: NtcEditUniversityRequest) => Promise<void>;

  // Actions — Uni Admin
  fetchMyUniversity: () => Promise<void>;
  updateMyUniversityInfo: (data: UpdateMyUniversityInfoRequest) => Promise<void>;

  fetchMyPrograms: () => Promise<void>;
  addMyProgram: (data: CreateProgramRequest) => Promise<void>;
  updateMyProgram: (code: string, data: Partial<CreateProgramRequest>) => Promise<void>;
  deleteMyProgram: (code: string) => Promise<void>;

  fetchMyLanguages: () => Promise<void>;
  addMyLanguage: (languageId: number) => Promise<void>;
  deleteMyLanguage: (id: number) => Promise<void>;

  fetchMyRequirements: () => Promise<void>;
  addMyRequirement: (description: string) => Promise<void>;
  updateMyRequirement: (id: number, description: string) => Promise<void>;
  deleteMyRequirement: (id: number) => Promise<void>;

  fetchMyExams: () => Promise<void>;
  addMyExam: (data: Omit<EntranceExam, "id">) => Promise<void>;
  updateMyExam: (id: number, data: Partial<Omit<EntranceExam, "id">>) => Promise<void>;
  deleteMyExam: (id: number) => Promise<void>;

  fetchMyMobility: () => Promise<void>;
  addMyMobility: (data: Omit<AcademicMobility, "id">) => Promise<void>;
  updateMyMobility: (id: number, data: Partial<Omit<AcademicMobility, "id">>) => Promise<void>;
  deleteMyMobility: (id: number) => Promise<void>;
};

const withLoading = async <T>(
  set: (s: Partial<UniversityState>) => void,
  fn: () => Promise<T>
): Promise<T> => {
  set({ isLoading: true, error: null });
  try {
    return await fn();
  } catch {
    set({ error: "Request failed" });
    throw new Error("Request failed");
  } finally {
    set({ isLoading: false });
  }
};

export const useUniversityStore = create<UniversityState>((set) => ({
  universities: [],
  programs: [],
  fields: [],
  subjects: [],
  ntcPrograms: [],
  isLoading: false,
  error: null,
  myUniversity: null,
  myPrograms: [],
  myLanguages: [],
  myRequirements: [],
  myExams: [],
  myMobility: [],

  // ── Public ──────────────────────────────────────────────────────────────

  fetchUniversities: () =>
    withLoading(set, async () => {
      const res = await universityService.getUniversities();
      set({ universities: res.data });
    }),

  fetchPrograms: () =>
    withLoading(set, async () => {
      const res = await universityService.getUniversityPrograms();
      set({ programs: res.data });
    }),

  fetchProgramsByUniversity: (code) =>
    withLoading(set, async () => {
      const res = await universityService.getUniversityProgramsByUniversity(code);
      set({ programs: res.data });
    }),

  fetchProgramDetail: (code) =>
    withLoading(set, async () => {
      const res = await universityService.getUniversityProgramDetail(code);
      return res.data;
    }),

  fetchFields: () =>
    withLoading(set, async () => {
      const res = await universityService.getFields();
      set({ fields: res.data });
    }),

  fetchSubjects: () =>
    withLoading(set, async () => {
      const res = await universityService.getSubjects();
      set({ subjects: res.data });
    }),

  fetchNtcPrograms: () =>
    withLoading(set, async () => {
      const res = await universityService.getNtcPrograms();
      set({ ntcPrograms: res.data });
    }),

  // ── NTC Admin ────────────────────────────────────────────────────────────

  ntcEditUniversity: (code, data) =>
    withLoading(set, async () => {
      const res = await universityService.ntcEditUniversity(code, data);
      set({ myUniversity: res.data });
    }),

  // ── Uni Admin ────────────────────────────────────────────────────────────

  fetchMyUniversity: () =>
    withLoading(set, async () => {
      const res = await universityService.getMyUniversity();
      set({ myUniversity: res.data });
    }),

  updateMyUniversityInfo: (data) =>
    withLoading(set, async () => {
      const res = await universityService.updateMyUniversityInfo(data);
      set({ myUniversity: res.data });
    }),

  fetchMyPrograms: () =>
    withLoading(set, async () => {
      const res = await universityService.getMyPrograms();
      set({ myPrograms: res.data });
    }),

  addMyProgram: (data) =>
    withLoading(set, async () => {
      const res = await universityService.addMyProgram(data);
      set((s) => ({ myPrograms: [...s.myPrograms, res.data] }));
    }),

  updateMyProgram: (code, data) =>
    withLoading(set, async () => {
      const res = await universityService.updateMyProgram(code, data);
      set((s) => ({
        myPrograms: s.myPrograms.map((p) => (p.code === code ? res.data : p)),
      }));
    }),

  deleteMyProgram: (code) =>
    withLoading(set, async () => {
      await universityService.deleteMyProgram(code);
      set((s) => ({ myPrograms: s.myPrograms.filter((p) => p.code !== code) }));
    }),

  fetchMyLanguages: () =>
    withLoading(set, async () => {
      const res = await universityService.getMyLanguages();
      set({ myLanguages: res.data });
    }),

  addMyLanguage: (languageId) =>
    withLoading(set, async () => {
      const res = await universityService.addMyLanguage(languageId);
      set((s) => ({ myLanguages: [...s.myLanguages, res.data] }));
    }),

  deleteMyLanguage: (id) =>
    withLoading(set, async () => {
      await universityService.deleteMyLanguage(id);
      set((s) => ({ myLanguages: s.myLanguages.filter((l) => l.id !== id) }));
    }),

  fetchMyRequirements: () =>
    withLoading(set, async () => {
      const res = await universityService.getMyRequirements();
      set({ myRequirements: res.data });
    }),

  addMyRequirement: (description) =>
    withLoading(set, async () => {
      const res = await universityService.addMyRequirement(description);
      set((s) => ({ myRequirements: [...s.myRequirements, res.data] }));
    }),

  updateMyRequirement: (id, description) =>
    withLoading(set, async () => {
      const res = await universityService.updateMyRequirement(id, description);
      set((s) => ({
        myRequirements: s.myRequirements.map((r) => (r.id === id ? res.data : r)),
      }));
    }),

  deleteMyRequirement: (id) =>
    withLoading(set, async () => {
      await universityService.deleteMyRequirement(id);
      set((s) => ({ myRequirements: s.myRequirements.filter((r) => r.id !== id) }));
    }),

  fetchMyExams: () =>
    withLoading(set, async () => {
      const res = await universityService.getMyExams();
      set({ myExams: res.data });
    }),

  addMyExam: (data) =>
    withLoading(set, async () => {
      const res = await universityService.addMyExam(data);
      set((s) => ({ myExams: [...s.myExams, res.data] }));
    }),

  updateMyExam: (id, data) =>
    withLoading(set, async () => {
      const res = await universityService.updateMyExam(id, data);
      set((s) => ({ myExams: s.myExams.map((e) => (e.id === id ? res.data : e)) }));
    }),

  deleteMyExam: (id) =>
    withLoading(set, async () => {
      await universityService.deleteMyExam(id);
      set((s) => ({ myExams: s.myExams.filter((e) => e.id !== id) }));
    }),

  fetchMyMobility: () =>
    withLoading(set, async () => {
      const res = await universityService.getMyMobility();
      set({ myMobility: res.data });
    }),

  addMyMobility: (data) =>
    withLoading(set, async () => {
      const res = await universityService.addMyMobility(data);
      set((s) => ({ myMobility: [...s.myMobility, res.data] }));
    }),

  updateMyMobility: (id, data) =>
    withLoading(set, async () => {
      const res = await universityService.updateMyMobility(id, data);
      set((s) => ({
        myMobility: s.myMobility.map((m) => (m.id === id ? res.data : m)),
      }));
    }),

  deleteMyMobility: (id) =>
    withLoading(set, async () => {
      await universityService.deleteMyMobility(id);
      set((s) => ({ myMobility: s.myMobility.filter((m) => m.id !== id) }));
    }),
}));
