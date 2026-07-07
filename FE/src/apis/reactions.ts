import { apiRequest, type ApiRequestOptions } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type { ReactPlaceRequest, ReactionSummaryResponse } from "@/types/api";

export function reactPlaceAsMember(placeId: number, body: ReactPlaceRequest, init?: ApiRequestOptions) {
  return apiRequest<ReactionSummaryResponse>(API_ENDPOINTS.reactions.member(placeId), {
    ...init,
    authMode: init?.authMode ?? "member",
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function reactPlaceAsGuest(
  placeId: number,
  guestKey: string,
  body: ReactPlaceRequest,
  init?: ApiRequestOptions,
) {
  return apiRequest<ReactionSummaryResponse>(API_ENDPOINTS.reactions.guest(placeId), {
    ...init,
    authMode: init?.authMode ?? "guest",
    guestKey,
    method: "PUT",
    body: JSON.stringify(body),
  });
}
