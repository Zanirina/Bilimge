import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";
import type { University, UniversityProgram, FieldOfStudy, Subject } from "../model/types";

export const universityService = {
  getUniversities: () =>
    http.get<University[]>(endpoints.universities.list),

  getUniversityById: (id: string) =>
    http.get<University>(endpoints.universities.byId(id)),

  getFields: () =>
    http.get<FieldOfStudy[]>(endpoints.fields.list),

  getSubjects: () =>
    http.get<Subject[]>(endpoints.subjects.list),

  getUniversityPrograms: () =>
    http.get<UniversityProgram[]>(endpoints.universityPrograms.list),

  getUniversityProgramsByUniversity: (universityCode: string) =>
    http.get<UniversityProgram[]>(endpoints.universityPrograms.list, {
      params: { university: universityCode },
    }),

  getUniversityProgramById: (id: string) =>
    http.get<UniversityProgram>(endpoints.universityPrograms.byId(id)),

  // My university (UNI_ADMIN only)
  getMyUniversity: () =>
    http.get<University>(endpoints.myUniversity.detail),

  getMyPrograms: () =>
    http.get<UniversityProgram[]>(endpoints.myUniversity.programs),

  addMyProgram: (data: Partial<UniversityProgram>) =>
    http.post<UniversityProgram>(endpoints.myUniversity.programs, data),

  updateMyProgram: (code: string, data: Partial<UniversityProgram>) =>
    http.patch<UniversityProgram>(endpoints.myUniversity.programById(code), data),

  deleteMyProgram: (code: string) =>
    http.delete(endpoints.myUniversity.programById(code)),
};