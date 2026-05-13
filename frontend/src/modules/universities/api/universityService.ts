import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";
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
} from "../model/types";

export const universityService = {
  // ── Public ──────────────────────────────────────────────────────────────

  getUniversities: () =>
    http.get<UniversityListItem[]>(endpoints.universities.list),

  getUniversityByCode: (code: string) =>
    http.get<University>(endpoints.universities.byCode(code)),

  /** @deprecated use getUniversityByCode */
  getUniversityById: (id: string) =>
    http.get<University>(endpoints.universities.byId(id)),

  getUniversityProgramDetail: (code: string) =>
    http.get<UniversityProgramDetail>(endpoints.universityPrograms.byCode(code)),

  getFields: () =>
    http.get<FieldOfStudy[]>(endpoints.fields.list),

  getSubjects: () =>
    http.get<Subject[]>(endpoints.subjects.list),

  getNtcPrograms: () =>
    http.get<NtcProgram[]>(endpoints.programs.list),

  getUniversityPrograms: () =>
    http.get<UniversityProgram[]>(endpoints.universityPrograms.list),

  getUniversityProgramsByUniversity: (universityCode: string) =>
    http.get<UniversityProgram[]>(endpoints.universityPrograms.list, {
      params: { university: universityCode },
    }),

  /** @deprecated use getUniversityProgramDetail */
  getUniversityProgramById: (id: string) =>
    http.get<UniversityProgramDetail>(endpoints.universityPrograms.byId(id)),

  // ── NTC Admin ────────────────────────────────────────────────────────────

  ntcEditUniversity: (code: string, data: NtcEditUniversityRequest) =>
    http.patch<University>(endpoints.universities.edit(code), data),

  // ── Uni Admin — own university ────────────────────────────────────────────

  getMyUniversity: () =>
    http.get<University>(endpoints.myUniversity.detail),

  updateMyUniversityInfo: (data: UpdateMyUniversityInfoRequest) =>
    http.patch<University>(endpoints.myUniversity.info, data),

  // Programs
  getMyPrograms: () =>
    http.get<UniversityProgram[]>(endpoints.myUniversity.programs),

  addMyProgram: (data: CreateProgramRequest) =>
    http.post<UniversityProgram>(endpoints.myUniversity.programs, data),

  updateMyProgram: (code: string, data: Partial<CreateProgramRequest>) =>
    http.patch<UniversityProgram>(endpoints.myUniversity.programByCode(code), data),

  deleteMyProgram: (code: string) =>
    http.delete(endpoints.myUniversity.programByCode(code)),

  // Teaching languages
  getMyLanguages: () =>
    http.get<Language[]>(endpoints.myUniversity.languages),

  addMyLanguage: (languageId: number) =>
    http.post<Language>(endpoints.myUniversity.languages, { language_id: languageId }),

  deleteMyLanguage: (langId: number) =>
    http.delete(endpoints.myUniversity.languageById(langId)),

  // Entrance requirements
  getMyRequirements: () =>
    http.get<EntranceRequirement[]>(endpoints.myUniversity.requirements),

  addMyRequirement: (description: string) =>
    http.post<EntranceRequirement>(endpoints.myUniversity.requirements, { description }),

  updateMyRequirement: (id: number, description: string) =>
    http.patch<EntranceRequirement>(endpoints.myUniversity.requirementById(id), { description }),

  deleteMyRequirement: (id: number) =>
    http.delete(endpoints.myUniversity.requirementById(id)),

  // Entrance exams
  getMyExams: () =>
    http.get<EntranceExam[]>(endpoints.myUniversity.exams),

  addMyExam: (data: Omit<EntranceExam, "id">) =>
    http.post<EntranceExam>(endpoints.myUniversity.exams, data),

  updateMyExam: (id: number, data: Partial<Omit<EntranceExam, "id">>) =>
    http.patch<EntranceExam>(endpoints.myUniversity.examById(id), data),

  deleteMyExam: (id: number) =>
    http.delete(endpoints.myUniversity.examById(id)),

  // Academic mobility
  getMyMobility: () =>
    http.get<AcademicMobility[]>(endpoints.myUniversity.mobility),

  addMyMobility: (data: Omit<AcademicMobility, "id">) =>
    http.post<AcademicMobility>(endpoints.myUniversity.mobility, data),

  updateMyMobility: (id: number, data: Partial<Omit<AcademicMobility, "id">>) =>
    http.patch<AcademicMobility>(endpoints.myUniversity.mobilityById(id), data),

  deleteMyMobility: (id: number) =>
    http.delete(endpoints.myUniversity.mobilityById(id)),
};
