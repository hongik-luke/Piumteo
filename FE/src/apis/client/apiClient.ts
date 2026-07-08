import { API_BASE_URL } from "@/config";
import type { ApiResponse } from "@/types/api";
import { notifyAuthExpired } from "@/app/authEvents";
import { clearAuthSession, getOrCreateGuestKey, getStoredAccessToken } from "@/utils/storage/clientState";

export type ApiAuthMode = "none" | "member" | "guest" | "auto";

export interface ApiRequestOptions extends RequestInit {
  accessToken?: string | null;
  guestKey?: string | null;
  authMode?: ApiAuthMode;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, init: ApiRequestOptions = {}): Promise<T> {
  const { accessToken, guestKey, authMode = "none", headers, ...requestInit } = init;
  const resolvedAccessToken =
    authMode === "member" || authMode === "auto"
      ? accessToken ?? getStoredAccessToken()
      : null;
  const resolvedGuestKey =
    authMode === "guest" || (authMode === "auto" && !resolvedAccessToken)
      ? guestKey ?? getOrCreateGuestKey()
      : guestKey;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestInit,
    headers: {
      "Content-Type": "application/json",
      ...(resolvedAccessToken ? { Authorization: `Bearer ${resolvedAccessToken}` } : {}),
      ...(resolvedGuestKey ? { "X-Guest-Key": resolvedGuestKey } : {}),
      ...headers,
    },
  });
  const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !body) {
    if (response.status === 401 && resolvedAccessToken) {
      clearAuthSession();
      notifyAuthExpired();
    }
    throw new ApiError(body?.message ?? "API request failed.", response.status, body?.code);
  }

  return body.result;
}
