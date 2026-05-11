export type University = {
  code: string;
  name: string;
  city: string;
  address: string;
  year_established: number;
  email: string;
  phone: string;
  passing_score: number;
};

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
  field_of_study: FieldOfStudy;
  subject_1: Subject;
  subject_2: Subject;
};

export type UniversityProgram = {
  code: string;
  local_name: string;
  cost: number;
  language: Language | null;
  university: University;
  ntc_program: NtcProgram;
};