import { apiRequest, type ApiRequestOptions } from "@/apis/client/apiClient";
import { API_ENDPOINTS } from "@/apis/endpoints";
import type {
  CreatePlaceRequest,
  CreatePlaceResponse,
  GetNearbyPlacesRequest,
  GetPlaceSummaryRequest,
  GetPlacesInBoundsRequest,
  PlaceDetailResponse,
  PlaceMarkerResponse,
} from "@/types/api";

export function getNearbyPlaces({ lat, lng }: GetNearbyPlacesRequest, init?: ApiRequestOptions) {
  return apiRequest<PlaceMarkerResponse[]>(API_ENDPOINTS.places.nearby(lat, lng), init);
}

export function getPlacesInBounds(
  { minLat, minLng, maxLat, maxLng }: GetPlacesInBoundsRequest,
  init?: ApiRequestOptions,
) {
  return apiRequest<PlaceMarkerResponse[]>(API_ENDPOINTS.places.bounds(minLat, minLng, maxLat, maxLng), init);
}

export function getPlaceSummary({ placeId, "X-Guest-Key": guestKey }: GetPlaceSummaryRequest, init?: ApiRequestOptions) {
  return apiRequest<PlaceDetailResponse>(API_ENDPOINTS.places.summary(placeId), {
    ...init,
    authMode: init?.authMode ?? "auto",
    guestKey,
  });
}

export function createPlace(body: CreatePlaceRequest, init?: ApiRequestOptions) {
  return apiRequest<CreatePlaceResponse>(API_ENDPOINTS.places.create, {
    ...init,
    authMode: init?.authMode ?? "member",
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function deletePlace(placeId: number, init?: ApiRequestOptions) {
  return apiRequest<null>(API_ENDPOINTS.places.delete(placeId), {
    ...init,
    authMode: init?.authMode ?? "member",
    method: "DELETE",
  });
}
