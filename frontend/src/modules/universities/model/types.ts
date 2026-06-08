export type Language = {
  id: number;
  name: string;
};

export type Subject = {
  id: number;
  name: string;
  name_ru?: string;
  name_kk?: string;
  name_localized?: string;
};

export type FieldOfStudy = {
  code: string;
  name: string;
  name_ru?: string;
  name_kk?: string;
  name_localized?: string;
};

export type UpdateNtcProgramRequest = {
  name?: string;
  name_ru?: string;
  name_kk?: string;
  field_of_study?: string;
  subject_1?: number;
  subject_2?: number;
  minimum_score?: number;
};

export type NtcProgram = {
  code: string;
  name: string;
  name_ru?: string;
  name_kk?: string;
  name_localized?: string;
  field_of_study: string;
  field_of_study_name: string;
  field_of_study_name_localized?: string;
  subject_1: number;
  subject_1_name: string;
  subject_1_name_localized?: string;
  subject_2: number;
  subject_2_name: string;
  subject_2_name_localized?: string;
  minimum_score: number;
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
  university: string;
  university_name: string;
  field_of_study_code: string;
  field_of_study_name: string;
  ntc_program: string;
  ntc_program_name: string;
  description: string;
  passing_score: number;
  grant_score: number;
  cost: number;
  degree: ProgramDegree;
  years_of_study: number | null;
  study_type: ProgramStudyType;
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
  description_ru: string;
  description_kk: string;
};

export type EntranceRequirementInput = {
  description: string;
  description_ru?: string;
  description_kk?: string;
};

export type EntranceExam = {
  id: number;
  name: string;
  name_ru: string;
  name_kk: string;
  description: string;
  description_ru: string;
  description_kk: string;
};

export type AcademicMobility = {
  id: number;
  partner_university_name: string;
  country: string;
};

export type Accreditation = {
  id: number;
  name: string;
  issued_by: string;
  valid_until: string | null;
};

// University list item (compact)
export type UniversityListItem = {
  code: string;
  name: string;
  short_name: string;
  city: string;
  passing_score: number;
  cover_url?: string;
  logo_url?: string;
  tuition_cost?: number | null;
};

// Full university detail from /unipage/api/universities/{code}/
export type University = {
  code: string;
  name: string;
  name_ru: string;
  name_kk: string;
  short_name: string;
  city: string;
  city_ru: string;
  city_kk: string;
  address: string;
  address_ru: string;
  address_kk: string;
  website: string;
  year_established: number;
  email: string;
  phone: string;
  passing_score: number;
  history: string;
  history_ru: string;
  history_kk: string;
  logo_url: string;
  cover_url: string;
  has_dormitory: boolean;
  has_military_department: boolean;
  telegram_url: string;
  instagram_url: string;
  tuition_cost: number | null;
  teaching_languages: string[];
  programs_by_field: ProgramsByField[];
  entrance_requirements: EntranceRequirement[];
  entrance_exams: EntranceExam[];
  academic_mobility: AcademicMobility[];
  accreditations: Accreditation[];
};

export type ProgramDegree = "college" | "bachelor" | "master" | "phd";
export type ProgramStudyType = "full_time" | "part_time" | "distance" | "evening";

// Admin program shape used in my-university programs CRUD
export type UniversityProgram = {
  code: string;
  university: string;
  university_name: string;
  ntc_program: string;
  ntc_program_name: string;
  local_name: string;
  local_name_ru: string;
  local_name_kk: string;
  cost: number;
  passing_score: number;
  grant_score: number;
  language: number | null;
  language_name: string;
  degree: ProgramDegree;
  years_of_study: number | null;
  study_type: ProgramStudyType;
  subject_1_name: string;
  subject_2_name: string;
  description: string;
  description_ru: string;
  description_kk: string;
  future_professions: string;
  future_professions_ru: string;
  future_professions_kk: string;
};

export type CreateProgramRequest = {
  code: string;
  ntc_program: string;
  local_name: string;
  local_name_ru?: string;
  local_name_kk?: string;
  cost: number;
  language: number;
  degree: ProgramDegree;
  years_of_study: number | null;
  study_type: ProgramStudyType;
  description: string;
  description_ru?: string;
  description_kk?: string;
  passing_score: number;
  grant_score: number;
  future_professions: string;
  future_professions_ru?: string;
  future_professions_kk?: string;
};

export type UpdateMyUniversityInfoRequest = {
  name?: string;
  name_ru?: string;
  name_kk?: string;
  short_name?: string;
  city?: string;
  city_ru?: string;
  city_kk?: string;
  address?: string;
  address_ru?: string;
  address_kk?: string;
  year_established?: number;
  email?: string;
  phone?: string;
  history?: string;
  history_ru?: string;
  history_kk?: string;
  website?: string;
  telegram_url?: string;
  instagram_url?: string;
  tuition_cost?: number | null;
  has_dormitory?: boolean;
  has_military_department?: boolean;
  passing_score?: number;
};

export type NtcEditUniversityRequest = {
  name?: string;
  short_name?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
};

export type ApplicantFavoritedProgram = {
  code: string;
  local_name: string;
  favorited_at: string;
};

export type UniApplicant = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  unt_score: number | null;
  favorited_programs: ApplicantFavoritedProgram[];
  first_favorited_at: string;
};
