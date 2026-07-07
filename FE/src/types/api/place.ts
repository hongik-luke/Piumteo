import type { Decimal, Id, OptionalGuestKeyHeader } from "./common";
import type { ReactionType } from "./reaction";

export type PlaceType = "SMOKING_BOOTH" | "SMOKING_AREA" | "IMPLICIT_SMOKING_AREA" | "NON_SMOKING_AREA";

export interface GetNearbyPlacesRequest {
  lat: Decimal;
  lng: Decimal;
}

export interface GetPlacesInBoundsRequest {
  minLat: Decimal;
  minLng: Decimal;
  maxLat: Decimal;
  maxLng: Decimal;
}

export interface BoundsRequest {
  minLatitude: Decimal;
  maxLatitude: Decimal;
  minLongitude: Decimal;
  maxLongitude: Decimal;
}

export interface GetPlaceSummaryRequest extends OptionalGuestKeyHeader {
  placeId: Id;
}

export interface DeletePlaceRequest {
  placeId: Id;
}

export interface CreatePlaceRequest {
  placeName: string;
  placeType: PlaceType;
  latitude: Decimal;
  longitude: Decimal;
  locationDescription?: string | null;
}

export interface CreatePlaceResponse {
  placeId: Id;
  placeName: string;
  placeType: PlaceType;
}

export interface PlaceMarkerResponse {
  placeId: Id;
  placeName: string;
  placeType: PlaceType;
  latitude: Decimal;
  longitude: Decimal;
}

export interface PlaceSummaryResponse {
  placeId: Id;
  name: string;
  type: PlaceType;
  latitude: Decimal;
  longitude: Decimal;
}

export interface PlaceDetailResponse {
  placeId: Id;
  placeName: string;
  placeType: PlaceType;
  latitude: Decimal;
  longitude: Decimal;
  locationDescription: string | null;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  viewCount: number;
  myReactionType: ReactionType;
  isOwner: boolean;
}
