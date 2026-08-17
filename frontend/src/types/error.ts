export type FieldErrors = Record<string, string[]>;

export interface ApiError {
  message: string;
  status: number;
  fieldErrors?: FieldErrors;
}