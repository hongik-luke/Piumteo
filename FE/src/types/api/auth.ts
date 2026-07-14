import type { Id } from "./common";

export type UserRole = "MEMBER" | "ADMIN";

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CheckEmailRequest {
  email: string;
}

export interface CheckNicknameRequest {
  nickname: string;
}

export interface AuthResponse {
  userId: Id;
  email: string;
  nickname: string;
  role: UserRole;
}

export interface CurrentUserResponse {
  userId: Id;
  nickname: string;
  userRole: UserRole;
}

export interface DuplicateCheckResponse {
  duplicated: boolean;
}
