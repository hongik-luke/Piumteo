import { apiRequest, type ApiRequestOptions } from "@/apis/client/apiClient";
import { API_ENDPOINTS } from "@/apis/endpoints";
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
  body: ReactPlaceRequest,
  init?: ApiRequestOptions,
) {
  return apiRequest<ReactionSummaryResponse>(API_ENDPOINTS.reactions.guest(placeId), {
    ...init,
    authMode: init?.authMode ?? "guest",
    method: "PUT",
    body: JSON.stringify(body),
  });
}
