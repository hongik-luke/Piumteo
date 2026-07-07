import { apiRequest } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type {
  AuthResponse,
  CheckEmailRequest,
  CheckNicknameRequest,
  DuplicateCheckResponse,
  LoginRequest,
  SignupRequest,
} from "@/types/api";

export function signup(body: SignupRequest) {
  return apiRequest<AuthResponse>(API_ENDPOINTS.auth.signup, {
    authMode: "none",
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function login(body: LoginRequest) {
  return apiRequest<AuthResponse>(API_ENDPOINTS.auth.login, {
    authMode: "none",
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function checkEmail({ email }: CheckEmailRequest) {
  return apiRequest<DuplicateCheckResponse>(API_ENDPOINTS.auth.checkEmail(email), {
    authMode: "none",
  });
}

export function checkNickname({ nickname }: CheckNicknameRequest) {
  return apiRequest<DuplicateCheckResponse>(API_ENDPOINTS.auth.checkNickname(nickname), {
    authMode: "none",
  });
}
