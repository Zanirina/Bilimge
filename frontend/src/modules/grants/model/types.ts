export type GrantResult = {
  full_name: string;
  score: number;
  field_code: string;
  field_name: string;
  university_code: string;
  year: number;
};

export type GrantCheckResponse =
  | { found: true; results: GrantResult[] }
  | { found: false; message: string };
