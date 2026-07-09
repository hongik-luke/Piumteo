import { API_BASE_URL } from "@/config";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import { notifyAuthExpired } from "@/app/authEvents";
import { ApiError } from "@/apis/client/ApiError";
import { getApiErrorMessage, isAuthExpiredError } from "@/apis/client/errorMessage";
import {
  clearAuthSession,
  getOrCreateGuestKey,
  getStoredAccessToken,
  getStoredGuestKey,
} from "@/utils/storage/clientState";

export type ApiAuthMode = "none" | "member" | "guest" | "optional";

export interface ApiRequestOptions extends RequestInit {
  accessToken?: string | null;
  guestKey?: string | null;
  authMode?: ApiAuthMode;
}

export async function apiRequest<T>(path: string, init: ApiRequestOptions = {}): Promise<T> {
  const { accessToken, guestKey, authMode = "none", headers, ...requestInit } = init;
  let resolvedAccessToken: string | null = null;
  let resolvedGuestKey: string | null = null;

  if (authMode === "member") {
    resolvedAccessToken = accessToken ?? getStoredAccessToken();
    if (!resolvedAccessToken) {
      throw new ApiError("로그인이 필요합니다.", 401, "UNAUTHORIZED");
    }
  }

  if (authMode === "guest") {
    resolvedGuestKey = guestKey ?? getOrCreateGuestKey();
  }

  if (authMode === "optional") {
    resolvedAccessToken = accessToken ?? getStoredAccessToken();
    resolvedGuestKey = resolvedAccessToken ? null : guestKey ?? getStoredGuestKey();
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestInit,
    headers: {
      "Content-Type": "application/json",
      ...(resolvedAccessToken ? { Authorization: `Bearer ${resolvedAccessToken}` } : {}),
      ...(resolvedGuestKey ? { "X-Guest-Key": resolvedGuestKey } : {}),
      ...headers,
    },
  });
  const body = (await response.json().catch(() => null)) as ApiResponse<T> | ErrorResponse | null;

  if (!response.ok || !body) {
    const error = new ApiError(
      getApiErrorMessage(
        new ApiError(body?.message ?? "API request failed.", response.status, body?.code, body),
        body?.message ?? "API request failed.",
      ),
      response.status,
      body?.code,
      body,
    );

    if (resolvedAccessToken && isAuthExpiredError(error)) {
      clearAuthSession();
      notifyAuthExpired();
    }

    throw error;
  }

  return (body as ApiResponse<T>).result;
}
