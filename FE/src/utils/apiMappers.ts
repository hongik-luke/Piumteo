import type {
  AuthResponse,
  CommentResponse,
  PlaceDetailResponse,
  PlaceMarkerResponse,
  ReactionType,
} from "@/types/api";
import type { AuthSession, Comment, Place, Reaction } from "@/types/domain";

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

export function apiReactionToDomain(reactionType: ReactionType): Reaction {
  if (reactionType === "LIKE") return "like";
  if (reactionType === "DISLIKE") return "dislike";
  return null;
}

export function domainReactionToApi(reaction: Exclude<Reaction, null>): ReactionType {
  return reaction === "like" ? "LIKE" : "DISLIKE";
}

export function toggleReaction(current: Reaction, next: Exclude<Reaction, null>): ReactionType {
  return current === next ? "CANCELED" : domainReactionToApi(next);
}

export function markerToPlace(marker: PlaceMarkerResponse, fallback?: Place): Place {
  return {
    id: String(marker.placeId),
    name: marker.placeName,
    type: marker.placeType,
    description: fallback?.description ?? "장소 상세 정보를 불러오는 중입니다.",
    distance: fallback?.distance ?? "지도 기준",
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
    description: detail.locationDescription ?? "등록된 위치 설명이 없습니다.",
    distance: fallback?.distance ?? "지도 기준",
    likes: detail.likeCount,
    dislikes: detail.dislikeCount,
    commentCount: detail.commentCount,
    x: fallback?.x ?? 50,
    y: fallback?.y ?? 50,
    ownedByMe: detail.isOwner,
  };
}

export function commentResponseToDomain(comment: CommentResponse): Comment {
  return {
    id: String(comment.placeCommentId),
    author: comment.displayNickname,
    content: comment.content,
    time: formatCommentTime(comment.createdAt),
    isMine: comment.isMine,
    isGuest: comment.commentAuthorType === "GUEST",
  };
}

function formatCommentTime(createdAt: string) {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return "";

  const diffMs = Date.now() - created;
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}
