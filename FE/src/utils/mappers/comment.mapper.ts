import type { CommentResponse } from "@/types/api";
import type { Comment } from "@/types/domain";

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
