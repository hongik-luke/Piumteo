import { API_BASE_URL } from "@/config";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import { notifyAuthExpired } from "@/app/authEvents";
import { ApiError } from "@/apis/client/ApiError";
import { getApiErrorMessage, isAuthExpiredError } from "@/apis/client/errorMessage";
import {
  clearAuthSession,
  getOrCreateGuestKey,
  getStoredGuestKey,
} from "@/utils/storage/clientState";

export type ApiAuthMode = "none" | "member" | "guest" | "optional";

export interface ApiRequestOptions extends RequestInit {
  guestKey?: string | null;
  authMode?: ApiAuthMode;
  notifyOnAuthError?: boolean;
}

export async function apiRequest<T>(path: string, init: ApiRequestOptions = {}): Promise<T> {
  const { guestKey, authMode = "none", headers, notifyOnAuthError = true, ...requestInit } = init;
  let resolvedGuestKey: string | null = null;

  if (authMode === "guest") {
    resolvedGuestKey = guestKey ?? getOrCreateGuestKey();
  }

  if (authMode === "optional") {
    resolvedGuestKey = guestKey ?? getStoredGuestKey();
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestInit,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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

    if (notifyOnAuthError && authMode === "member" && isAuthExpiredError(error)) {
      clearAuthSession();
      notifyAuthExpired();
    }

    throw error;
  }

  return (body as ApiResponse<T>).result;
}
