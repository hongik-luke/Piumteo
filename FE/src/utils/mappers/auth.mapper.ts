import type { AuthResponse, CurrentUserResponse } from "@/types/api";
import type { AuthSession } from "@/types/domain";

export function authResponseToSession(response: AuthResponse): AuthSession {
  return {
    userId: response.userId,
    email: response.email,
    nickname: response.nickname,
    role: response.role,
  };
}

export function currentUserResponseToSession(response: CurrentUserResponse): AuthSession {
  return {
    userId: response.userId,
    nickname: response.nickname,
    role: response.userRole,
  };
}
