import { create } from "zustand";
import { universityService } from "../api/universityService";
import { localizeData } from "../../../shared/lib/i18n/localizeData";
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
  EntranceRequirementInput,
  EntranceExam,
  AcademicMobility,
  Accreditation,
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
  currentUniversity: University | null;
  currentProgram: UniversityProgramDetail | null;
  isLoading: boolean;
  error: string | null;

  // Uni Admin state
  myUniversity: University | null;
  myPrograms: UniversityProgram[];
  myLanguages: Language[];
  myRequirements: EntranceRequirement[];
  myExams: EntranceExam[];
  myMobility: AcademicMobility[];
  myAccreditations: Accreditation[];

  // Actions — public
  fetchUniversities: () => Promise<void>;
  fetchUniversityDetail: (code: string) => Promise<void>;
  fetchPrograms: () => Promise<void>;
  fetchProgramsByUniversity: (code: string) => Promise<void>;
  fetchProgramDetail: (code: string) => Promise<UniversityProgramDetail>;
  fetchProgramDetailIntoStore: (code: string) => Promise<void>;
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
  addMyRequirement: (data: EntranceRequirementInput) => Promise<void>;
  updateMyRequirement: (id: number, data: EntranceRequirementInput) => Promise<void>;
  deleteMyRequirement: (id: number) => Promise<void>;

  fetchMyExams: () => Promise<void>;
  addMyExam: (data: Omit<EntranceExam, "id">) => Promise<void>;
  updateMyExam: (id: number, data: Partial<Omit<EntranceExam, "id">>) => Promise<void>;
  deleteMyExam: (id: number) => Promise<void>;

  fetchMyMobility: () => Promise<void>;
  addMyMobility: (data: Omit<AcademicMobility, "id">) => Promise<void>;
  updateMyMobility: (id: number, data: Partial<Omit<AcademicMobility, "id">>) => Promise<void>;
  deleteMyMobility: (id: number) => Promise<void>;

  fetchMyAccreditations: () => Promise<void>;
  addMyAccreditation: (data: Omit<Accreditation, "id">) => Promise<void>;
  updateMyAccreditation: (id: number, data: Partial<Omit<Accreditation, "id">>) => Promise<void>;
  deleteMyAccreditation: (id: number) => Promise<void>;

  uploadLogo: (file: File) => Promise<void>;
  uploadCover: (file: File) => Promise<void>;
};

const withLoading = async <T>(
  set: (s: Partial<UniversityState>) => void,
  fn: () => Promise<T>
): Promise<T> => {
  set({ isLoading: true, error: null });
  try {
    return await fn();
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { error?: string; trace?: string } }; message?: string };
    const msg = axiosErr?.response?.data?.error ?? axiosErr?.message ?? "Request failed";
    if (axiosErr?.response?.data?.trace) console.error("[API 500]", axiosErr.response.data.trace);
    set({ error: msg });
    throw new Error(msg);
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
  currentUniversity: null,
  currentProgram: null,
  isLoading: false,
  error: null,
  myUniversity: null,
  myPrograms: [],
  myLanguages: [],
  myRequirements: [],
  myExams: [],
  myMobility: [],
  myAccreditations: [],

  // ── Public ──────────────────────────────────────────────────────────────

  fetchUniversities: () =>
    withLoading(set, async () => {
      const res = await universityService.getUniversities();
      set({ universities: localizeData(res.data) });
    }),

  fetchUniversityDetail: (code) =>
    withLoading(set, async () => {
      const res = await universityService.getUniversityByCode(code);
      set({ currentUniversity: localizeData(res.data) });
    }),

  fetchProgramDetailIntoStore: (code) =>
    withLoading(set, async () => {
      const res = await universityService.getUniversityProgramDetail(code);
      set({ currentProgram: localizeData(res.data) });
    }),

  fetchPrograms: () =>
    withLoading(set, async () => {
      const res = await universityService.getUniversityPrograms();
      set({ programs: localizeData(res.data) });
    }),

  fetchProgramsByUniversity: (code) =>
    withLoading(set, async () => {
      const res = await universityService.getUniversityProgramsByUniversity(code);
      set({ programs: localizeData(res.data) });
    }),

  fetchProgramDetail: (code) =>
    withLoading(set, async () => {
      const res = await universityService.getUniversityProgramDetail(code);
      return localizeData(res.data);
    }),

  fetchFields: () =>
    withLoading(set, async () => {
      const res = await universityService.getFields();
      set({ fields: localizeData(res.data) });
    }),

  fetchSubjects: () =>
    withLoading(set, async () => {
      const res = await universityService.getSubjects();
      set({ subjects: localizeData(res.data) });
    }),

  fetchNtcPrograms: () =>
    withLoading(set, async () => {
      const res = await universityService.getNtcPrograms();
      set({ ntcPrograms: localizeData(res.data) });
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
      // PATCH returns only the editable fields — merge so logo/cover/code stay intact.
      set((s) => ({ myUniversity: { ...s.myUniversity, ...res.data } as University }));
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

  addMyRequirement: (data) =>
    withLoading(set, async () => {
      const res = await universityService.addMyRequirement(data);
      set((s) => ({ myRequirements: [...s.myRequirements, res.data] }));
    }),

  updateMyRequirement: (id, data) =>
    withLoading(set, async () => {
      const res = await universityService.updateMyRequirement(id, data);
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

  fetchMyAccreditations: () =>
    withLoading(set, async () => {
      const res = await universityService.getMyAccreditations();
      set({ myAccreditations: res.data });
    }),

  addMyAccreditation: (data) =>
    withLoading(set, async () => {
      const res = await universityService.addMyAccreditation(data);
      set((s) => ({ myAccreditations: [...s.myAccreditations, res.data] }));
    }),

  updateMyAccreditation: (id, data) =>
    withLoading(set, async () => {
      const res = await universityService.updateMyAccreditation(id, data);
      set((s) => ({
        myAccreditations: s.myAccreditations.map((a) => (a.id === id ? res.data : a)),
      }));
    }),

  deleteMyAccreditation: (id) =>
    withLoading(set, async () => {
      await universityService.deleteMyAccreditation(id);
      set((s) => ({ myAccreditations: s.myAccreditations.filter((a) => a.id !== id) }));
    }),

  uploadLogo: (file) =>
    withLoading(set, async () => {
      const res = await universityService.uploadLogo(file);
      set((s) => s.myUniversity ? { myUniversity: { ...s.myUniversity, logo_url: res.data.logo_url } } : {});
    }),

  uploadCover: (file) =>
    withLoading(set, async () => {
      const res = await universityService.uploadCover(file);
      set((s) => s.myUniversity ? { myUniversity: { ...s.myUniversity, cover_url: res.data.cover_url } } : {});
    }),
}));
