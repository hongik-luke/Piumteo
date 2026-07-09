import type { PlaceDetailResponse, PlaceMarkerResponse } from "@/types/api";
import type { Place } from "@/types/domain";

export function markerToPlace(marker: PlaceMarkerResponse, fallback?: Place): Place {
  return {
    id: String(marker.placeId),
    name: marker.placeName,
    type: marker.placeType,
    latitude: marker.latitude,
    longitude: marker.longitude,
    description: fallback?.description ?? "장소 정보를 불러오는 중입니다.",
    distance: fallback?.distance ?? "거리 계산 중",
    likes: fallback?.likes ?? 0,
    dislikes: fallback?.dislikes ?? 0,
    commentCount: fallback?.commentCount ?? 0,
    x: fallback?.x ?? 50,
    y: fallback?.y ?? 50,
    ownedByMe: fallback?.ownedByMe,
  };
}

export function detailToPlace(detail: PlaceDetailResponse, fallback?: Place): Place {
  return {
    id: String(detail.placeId),
    name: detail.placeName,
    type: detail.placeType,
    latitude: detail.latitude,
    longitude: detail.longitude,
    description: detail.locationDescription ?? "등록된 위치 설명이 없습니다.",
    distance: fallback?.distance ?? "거리 계산 중",
    likes: detail.likeCount,
    dislikes: detail.dislikeCount,
    commentCount: detail.commentCount,
    x: fallback?.x ?? 50,
    y: fallback?.y ?? 50,
    ownedByMe: detail.isOwner,
  };
}
