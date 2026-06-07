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
  UpdateNtcProgramRequest,
  Language,
  EntranceRequirement,
  EntranceExam,
  AcademicMobility,
  Accreditation,
  CreateProgramRequest,
  UpdateMyUniversityInfoRequest,
  NtcEditUniversityRequest,
  UniApplicant,
} from "../model/types";

export const universityService = {
  // ── Public ──────────────────────────────────────────────────────────────

  getLanguages: () =>
    http.get<Language[]>(endpoints.languages.list),

  getUniversities: () =>
    http.get<UniversityListItem[]>(endpoints.universities.list),

  getUniversityByCode: (code: string) =>
    http.get<University>(endpoints.universities.byCode(code)),

  compareUniversitiesAI: (codes: string[], language: string) =>
    http.post<{ ai_analysis: string }>(endpoints.universities.compareAi, {
      codes,
      language,
    }),

  /** @deprecated use getUniversityByCode */
  getUniversityById: (id: string) =>
    http.get<University>(endpoints.universities.byCode(id)),

  getUniversityProgramDetail: (code: string) =>
    http.get<UniversityProgramDetail>(endpoints.universityPrograms.byCode(code)),

  getFields: () =>
    http.get<FieldOfStudy[]>(endpoints.fields.list),

  getSubjects: () =>
    http.get<Subject[]>(endpoints.subjects.list),

  getNtcPrograms: () =>
    http.get<NtcProgram[]>(endpoints.programs.list),

  updateNtcProgram: (code: string, data: UpdateNtcProgramRequest) =>
    http.patch<NtcProgram>(endpoints.programs.byCode(code), data),

  deleteNtcProgram: (code: string) =>
    http.delete(endpoints.programs.byCode(code)),

  getUniversityPrograms: () =>
    http.get<UniversityProgram[]>(endpoints.universityPrograms.list),

  getUniversityProgramsByUniversity: (universityCode: string) =>
    http.get<UniversityProgram[]>(endpoints.universityPrograms.list, {
      params: { university: universityCode },
    }),

  /** @deprecated use getUniversityProgramDetail */
  getUniversityProgramById: (id: string) =>
    http.get<UniversityProgramDetail>(endpoints.universityPrograms.byCode(id)),

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

  // Applicants who favourited this university
  getMyApplicants: () =>
    http.get<UniApplicant[]>(endpoints.myUniversity.applicants),

  // Accreditations
  getMyAccreditations: () =>
    http.get<Accreditation[]>(endpoints.myUniversity.accreditations),

  addMyAccreditation: (data: Omit<Accreditation, "id">) =>
    http.post<Accreditation>(endpoints.myUniversity.accreditations, data),

  updateMyAccreditation: (id: number, data: Partial<Omit<Accreditation, "id">>) =>
    http.patch<Accreditation>(endpoints.myUniversity.accreditationById(id), data),

  deleteMyAccreditation: (id: number) =>
    http.delete(endpoints.myUniversity.accreditationById(id)),

  // Logo / cover upload
  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append("logo", file);
    return http.post<{ logo_url: string }>(endpoints.myUniversity.uploadLogo, form, {
      headers: { "Content-Type": undefined },
    });
  },

  uploadCover: (file: File) => {
    const form = new FormData();
    form.append("cover", file);
    return http.post<{ cover_url: string }>(endpoints.myUniversity.uploadCover, form, {
      headers: { "Content-Type": undefined },
    });
  },
};
