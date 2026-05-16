export type UserRole =
  | "applicant"
  | "uni_admin"
  | "ntc_admin"
  | "super_admin"
  | string;

export type User = {
  id: number;
  email: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  birth_date: string | null;
  unt_score: number | null;
  target_speciality: string | null;
  target_speciality_name: string | null;
  favorites_count: number;
  university_name?: string | null;
  university_code?: string | null;
};

export type RegisterRequest = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  access: string;
  refresh: string;
};

export type RefreshResponse = {
  access: string;
};

export type UpdateProfileRequest = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  birth_date?: string;
  unt_score?: number;
  target_speciality?: string;
};

export type UpdateMeRequest = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
};

export type ChangePasswordRequest = {
  current_password: string;
  new_password: string;
};

export type ResetPasswordRequest = {
  email: string;
};

export type ResetPasswordConfirmRequest = {
  token: string;
  password: string;
};

export type FavoriteItem = {
  id: number;
  program: string;
  program_name: string;
  university_name: string;
  university_code: string;
  created_at: string;
};

export type AddFavoriteRequest = {
  program: string;
};
