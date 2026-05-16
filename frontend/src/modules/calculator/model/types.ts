export type Subject = {
  id: number;
  name: string;
};

export type CalculatorScores = {
  history: number;
  math_literacy: number;
  reading_literacy: number;
  subject_1: number;
  subject_2: number;
};

export type QuotaKey =
  | "rural"
  | "large_family"
  | "incomplete_family"
  | "serpin"
  | "disability"
  | "family_disability"
  | "orphan";

export type CalculatorRequest = {
  scores: CalculatorScores;
  quotas: QuotaKey[];
  subject_1_id?: number;
  subject_2_id?: number;
  ntc_program_code?: string;
};

export type NtcProgramOption = {
  code: string;
  name: string;
  field: string;
};

export type UniversityResult = {
  university_code: string;
  university_name: string;
  university_city: string;
  program_code: string;
  program_name: string;
  grant_score: number | null;
  passing_score: number | null;
  grant_chance: number;
  admission_chance: number;
  language: string;
  data_source:
    | "grant_score"
    | "grant_winners_2025"
    | "grant_winners_2025_university";
};

export type GrantStats2025 = {
  field_code: string;
  min_score: number;
  max_score: number;
  avg_score: number;
  total_winners: number;
  year: number;
};

export type CalculatorFailure = {
  passed_minimum: false;
  message: string;
  total_score: number;
};

export type CalculatorSuccess = {
  passed_minimum: true;
  total_score: number;
  best_grant_chance: number;
  average_grant_chance: number;
  ntc_program: {
    code: string;
    name: string;
    field: string;
    field_code: string;
    grant_code: string;
  };
  grant_stats_2025: GrantStats2025 | null;
  scores_breakdown: CalculatorScores;
  quotas: QuotaKey[];
  universities: UniversityResult[];
  ai_analysis: string;
};

export type CalculatorErrorResponse = { error: string };

export type CalculatorResponse =
  | CalculatorSuccess
  | CalculatorFailure
  | CalculatorErrorResponse;
