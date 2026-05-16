import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";
import type {
  CalculatorRequest,
  CalculatorResponse,
  NtcProgramOption,
  Subject,
} from "../model/types";

export const calculatorService = {
  listSubjects: () =>
    http.get<Subject[]>(endpoints.subjects.list).then((r) => r.data),

  getPrograms: (subject1Id: number, subject2Id: number) =>
    http
      .get<NtcProgramOption[]>(endpoints.calculator.programs, {
        params: { subject_1: subject1Id, subject_2: subject2Id },
      })
      .then((r) => r.data),

  calculate: (payload: CalculatorRequest) =>
    http
      .post<CalculatorResponse>(endpoints.calculator.chances, payload)
      .then((r) => r.data),
};
