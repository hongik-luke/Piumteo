import type { DateTimeString, Id } from "./common";

export type CommentAuthorType = "MEMBER" | "GUEST";

export interface GetCommentsRequest {
  placeId: Id;
  cursorId?: Id;
  size?: number;
}

export interface CreateMemberCommentRequest {
  content: string;
}

export interface CreateGuestCommentRequest {
  displayNickname: string;
  guestPassword: string;
  content: string;
}

export interface UpdateMemberCommentRequest {
  content: string;
}

export interface UpdateGuestCommentRequest {
  guestPassword: string;
  content: string;
}

export interface DeleteGuestCommentRequest {
  guestPassword: string;
}

export interface CommentResponse {
  placeCommentId: Id;
  commentAuthorType: CommentAuthorType;
  displayNickname: string;
  content: string;
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
  isMine: boolean;
}

export interface CommentCursorResponse {
  comments: CommentResponse[];
  nextCursor: Id | null;
  hasNext: boolean;
}

export interface CommentMutationResponse {
  placeCommentId: Id;
  commentAuthorType: CommentAuthorType;
  displayNickname: string;
  content: string;
}

export interface CreateCommentResponse {
  commentId: Id;
}
