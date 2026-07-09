import type { AuthResponse } from "@/types/api";
import type { AuthSession } from "@/types/domain";

export function authResponseToSession(response: AuthResponse): AuthSession | null {
  if (!response.accessToken) return null;

  return {
    userId: response.userId,
    email: response.email,
    nickname: response.nickname,
    role: response.role,
    accessToken: response.accessToken,
  };
}
