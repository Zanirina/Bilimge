export type Language = {
  id: number;
  name: string;
};

export type Subject = {
  id: number;
  name: string;
};

export type FieldOfStudy = {
  code: string;
  name: string;
};

export type NtcProgram = {
  code: string;
  name: string;
  field_of_study: string;
  subject_1: number;
  subject_2: number;
};

// Compact representation used in university list and programs_by_field
export type UniversityProgramShort = {
  code: string;
  local_name: string;
  cost: number;
  passing_score: number;
  grant_score: number;
  language_name: string;
};

// Full program detail from /unipage/api/university-programs/{code}/
export type UniversityProgramDetail = {
  code: string;
  local_name: string;
  university_name: string;
  field_of_study_name: string;
  description: string;
  passing_score: number;
  grant_score: number;
  cost: number;
  language_name: string;
  subject_1: string;
  subject_2: string;
  future_professions: string;
};

// Programs grouped by field (used in university detail page)
export type ProgramsByField = {
  code: string;
  name: string;
  programs: UniversityProgramShort[];
};

export type EntranceRequirement = {
  id: number;
  description: string;
};

export type EntranceExam = {
  id: number;
  name: string;
  description: string;
};

export type AcademicMobility = {
  id: number;
  partner_university_name: string;
  country: string;
};

// University list item (compact)
export type UniversityListItem = {
  code: string;
  name: string;
  city: string;
  passing_score: number;
};

// Full university detail from /unipage/api/universities/{code}/
export type University = {
  code: string;
  name: string;
  city: string;
  address: string;
  website: string;
  year_established: number;
  email: string;
  phone: string;
  passing_score: number;
  history: string;
  has_dormitory: boolean;
  has_military_department: boolean;
  teaching_languages: string[];
  programs_by_field: ProgramsByField[];
  entrance_requirements: EntranceRequirement[];
  entrance_exams: EntranceExam[];
  academic_mobility: AcademicMobility[];
};

// Admin program shape used in my-university programs CRUD
export type UniversityProgram = {
  code: string;
  local_name: string;
  cost: number;
  passing_score: number;
  grant_score: number;
  language_name: string;
  description: string;
  future_professions: string;
};

export type CreateProgramRequest = {
  code: string;
  ntc_program: string;
  local_name: string;
  cost: number;
  language: number;
  description: string;
  passing_score: number;
  grant_score: number;
  future_professions: string;
};

export type UpdateMyUniversityInfoRequest = {
  history?: string;
  website?: string;
  has_dormitory?: boolean;
  has_military_department?: boolean;
  passing_score?: number;
};

export type NtcEditUniversityRequest = {
  name?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
};
