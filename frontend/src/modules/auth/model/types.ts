export type UserRole =
  | "APPLICANT"
  | "UNI_ADMIN"
  | "NTC_ADMIN"
  | "SUPER_ADMIN"
  | string;

export type User = {
  id: number;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone: string | null;
  created_at: string;
};

export type Applicant = {
  id: number;
  user: User;
  birth_date: string | null;
  unt_score: number;
  target_speciality: string | null; // NtcProgram code
};

export type RegisterRequest = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  access: string; 
  refresh: string;
};