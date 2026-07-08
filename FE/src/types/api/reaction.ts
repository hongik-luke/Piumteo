import type { DateTimeString, Id } from "./common";

export type ReactionType = "LIKE" | "DISLIKE" | "CANCELED";

export interface ReactPlaceRequest {
  reactionType: ReactionType;
}

export interface ReactPlaceAsMemberRequest extends ReactPlaceRequest {
  placeId: Id;
}

export interface ReactPlaceAsGuestRequest extends ReactPlaceRequest {
  placeId: Id;
  guestKey: string;
}

export interface ReactionSummaryResponse {
  placeId: Id;
  likeCount: number;
  dislikeCount: number;
  myReactionType: ReactionType;
  reactionHourKey: number;
  nextReactionAvailableAt: DateTimeString;
}
