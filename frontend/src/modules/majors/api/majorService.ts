import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";
import type { NtcProgram, FieldOfStudy, Subject } from "../../universities/model/types";

export const majorService = {
  getNtcPrograms: () =>
    http.get<NtcProgram[]>(endpoints.programs.list),

  getFields: () =>
    http.get<FieldOfStudy[]>(endpoints.fields.list),

  getSubjects: () =>
    http.get<Subject[]>(endpoints.subjects.list),
};
