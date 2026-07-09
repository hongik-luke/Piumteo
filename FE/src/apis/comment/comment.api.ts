import { apiRequest, type ApiRequestOptions } from "@/apis/client/apiClient";
import { API_ENDPOINTS } from "@/apis/endpoints";
import type {
  CommentCursorResponse,
  CommentMutationResponse,
  CreateGuestCommentRequest,
  CreateMemberCommentRequest,
  DeleteGuestCommentRequest,
  GetCommentsRequest,
  UpdateGuestCommentRequest,
  UpdateMemberCommentRequest,
} from "@/types/api";

export function getComments({ placeId, cursorId, size }: GetCommentsRequest, init?: ApiRequestOptions) {
  return apiRequest<CommentCursorResponse>(API_ENDPOINTS.comments.list(placeId, cursorId, size), {
    ...init,
    authMode: init?.authMode ?? "optional",
  });
}

export function createMemberComment(placeId: number, body: CreateMemberCommentRequest, init?: ApiRequestOptions) {
  return apiRequest<CommentMutationResponse>(API_ENDPOINTS.comments.createMember(placeId), {
    ...init,
    authMode: init?.authMode ?? "member",
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function createGuestComment(placeId: number, body: CreateGuestCommentRequest, init?: ApiRequestOptions) {
  return apiRequest<CommentMutationResponse>(API_ENDPOINTS.comments.createGuest(placeId), {
    ...init,
    authMode: init?.authMode ?? "none",
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateMemberComment(
  placeId: number,
  commentId: number,
  body: UpdateMemberCommentRequest,
  init?: ApiRequestOptions,
) {
  return apiRequest<CommentMutationResponse>(API_ENDPOINTS.comments.updateMember(placeId, commentId), {
    ...init,
    authMode: init?.authMode ?? "member",
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function updateGuestComment(
  placeId: number,
  commentId: number,
  body: UpdateGuestCommentRequest,
  init?: ApiRequestOptions,
) {
  return apiRequest<CommentMutationResponse>(API_ENDPOINTS.comments.updateGuest(placeId, commentId), {
    ...init,
    authMode: init?.authMode ?? "none",
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteMemberComment(placeId: number, commentId: number, init?: ApiRequestOptions) {
  return apiRequest<null>(API_ENDPOINTS.comments.deleteMember(placeId, commentId), {
    ...init,
    authMode: init?.authMode ?? "member",
    method: "DELETE",
  });
}

export function deleteGuestComment(
  placeId: number,
  commentId: number,
  body: DeleteGuestCommentRequest,
  init?: ApiRequestOptions,
) {
  return apiRequest<null>(API_ENDPOINTS.comments.deleteGuest(placeId, commentId), {
    ...init,
    authMode: init?.authMode ?? "none",
    method: "DELETE",
    body: JSON.stringify(body),
  });
}
