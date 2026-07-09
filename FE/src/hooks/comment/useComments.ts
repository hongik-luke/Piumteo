import { useCallback, useEffect, useRef, useState } from "react";
import {
  createGuestComment,
  createMemberComment,
  deleteGuestComment,
  deleteMemberComment,
  getComments,
  updateGuestComment,
  updateMemberComment,
} from "@/apis/comment/comment.api";
import { getApiErrorMessage } from "@/apis/client/errorMessage";
import type { CommentMutationResponse } from "@/types/api";
import type { Comment, ToastType } from "@/types/domain";
import { commentResponseToDomain } from "@/utils/mappers/comment.mapper";

const COMMENTS_PAGE_SIZE = 10;

function mutationToComment(response: CommentMutationResponse, isMine: boolean): Comment {
  return {
    id: String(response.placeCommentId),
    author: response.displayNickname,
    content: response.content,
    time: "방금 전",
    isMine,
    isGuest: response.commentAuthorType === "GUEST",
  };
}

export function useComments({
  placeId,
  isLoggedIn,
  initialCommentCount,
  addToast,
}: {
  placeId: number;
  isLoggedIn: boolean;
  initialCommentCount: number;
  addToast(t: ToastType, m: string): void;
}) {
  const loadingMoreRef = useRef(false);

  const [commentItems, setCommentItems] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [text, setText] = useState("");
  const [guestNick, setGuestNick] = useState("");
  const [guestPw, setGuestPw] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<Comment | null>(null);
  const [pwError, setPwError] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editText, setEditText] = useState("");
  const [editPw, setEditPw] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    setCommentCount(initialCommentCount);
  }, [placeId, initialCommentCount]);

  const loadComments = useCallback(
    async (cursorId: number | null = null, append = false) => {
      if (loadingMoreRef.current) return;
      loadingMoreRef.current = true;
      setCommentsLoading(true);

      try {
        const response = await getComments(
          { placeId, cursorId: cursorId ?? undefined, size: COMMENTS_PAGE_SIZE },
          { authMode: isLoggedIn ? "member" : "none" },
        );
        const nextComments = response.comments.map(commentResponseToDomain);
        setCommentItems((prev) => (append ? [...prev, ...nextComments] : nextComments));
        setNextCursor(response.nextCursor);
        setHasNext(response.hasNext);
      } catch (error) {
        addToast("error", getApiErrorMessage(error, "댓글을 불러오지 못했습니다."));
      } finally {
        loadingMoreRef.current = false;
        setCommentsLoading(false);
      }
    },
    [addToast, isLoggedIn, placeId],
  );

  useEffect(() => {
    setCommentItems([]);
    setNextCursor(null);
    setHasNext(false);
    void loadComments(null, false);
  }, [loadComments]);

  function loadMoreIfNeeded(scrollHeight: number, scrollTop: number, clientHeight: number) {
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    if (distanceToBottom < 96 && hasNext && nextCursor && !commentsLoading) {
      void loadComments(nextCursor, true);
    }
  }

  async function submitComment() {
    const content = text.trim();
    if (!content || submitting) return;
    if (!isLoggedIn && (!guestNick.trim() || !guestPw.trim())) return;

    setSubmitting(true);
    try {
      const response = isLoggedIn
        ? await createMemberComment(placeId, { content })
        : await createGuestComment(placeId, {
            displayNickname: guestNick.trim(),
            guestPassword: guestPw,
            content,
          });

      setCommentItems((prev) => [mutationToComment(response, true), ...prev]);
      setCommentCount((prev) => prev + 1);
      setText("");
      setGuestNick("");
      setGuestPw("");
      addToast("success", "댓글을 등록했습니다.");
    } catch (error) {
      addToast("error", getApiErrorMessage(error, "댓글을 등록하지 못했습니다."));
    } finally {
      setSubmitting(false);
    }
  }

  function beginEdit(comment: Comment) {
    setEditingComment(comment);
    setEditText(comment.content);
    setEditPw("");
    setEditError("");
  }

  function cancelEdit() {
    setEditingComment(null);
    setEditText("");
    setEditPw("");
    setEditError("");
  }

  async function submitEdit() {
    if (!editingComment || !editText.trim() || editLoading) return;
    if (editingComment.isGuest && !editPw.trim()) {
      setEditError("비회원 댓글 비밀번호를 입력해 주세요.");
      return;
    }

    setEditLoading(true);
    setEditError("");
    try {
      const commentId = Number(editingComment.id);
      const response = editingComment.isGuest
        ? await updateGuestComment(placeId, commentId, {
            guestPassword: editPw,
            content: editText.trim(),
          })
        : await updateMemberComment(placeId, commentId, { content: editText.trim() });

      const nextComment = mutationToComment(response, editingComment.isMine);
      setCommentItems((prev) =>
        prev.map((comment) =>
          comment.id === editingComment.id
            ? { ...comment, content: nextComment.content, time: nextComment.time }
            : comment,
        ),
      );
      cancelEdit();
      addToast("success", "댓글을 수정했습니다.");
    } catch (error) {
      setEditError(getApiErrorMessage(error, "댓글을 수정하지 못했습니다."));
    } finally {
      setEditLoading(false);
    }
  }

  function requestDelete(comment: Comment) {
    setConfirmDeleteTarget(comment);
  }

  function cancelDeleteConfirm() {
    setConfirmDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!confirmDeleteTarget) return;

    const target = confirmDeleteTarget;
    setConfirmDeleteTarget(null);

    if (target.isGuest) {
      setDeleteTarget(target);
      return;
    }

    try {
      await deleteMemberComment(placeId, Number(target.id));
      setCommentItems((prev) => prev.filter((item) => item.id !== target.id));
      setCommentCount((prev) => Math.max(0, prev - 1));
      addToast("success", "댓글을 삭제했습니다.");
    } catch (error) {
      addToast("error", getApiErrorMessage(error, "댓글을 삭제하지 못했습니다."));
    }
  }

  function cancelGuestPassword() {
    setDeleteTarget(null);
    setPwError(false);
  }

  async function deleteGuestWithPassword(password: string) {
    if (!deleteTarget) return;
    setPwLoading(true);
    setPwError(false);

    try {
      await deleteGuestComment(placeId, Number(deleteTarget.id), { guestPassword: password });
      setCommentItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setCommentCount((prev) => Math.max(0, prev - 1));
      setDeleteTarget(null);
      addToast("success", "댓글을 삭제했습니다.");
    } catch {
      setPwError(true);
    } finally {
      setPwLoading(false);
    }
  }

  return {
    commentItems,
    commentCount,
    commentsLoading,
    text,
    setText,
    guestNick,
    setGuestNick,
    guestPw,
    setGuestPw,
    submitting,
    submitComment,
    loadMoreIfNeeded,
    editingComment,
    editText,
    setEditText,
    editPw,
    setEditPw,
    editError,
    editLoading,
    beginEdit,
    cancelEdit,
    submitEdit,
    confirmDeleteTarget,
    requestDelete,
    cancelDeleteConfirm,
    confirmDelete,
    deleteTarget,
    pwError,
    pwLoading,
    cancelGuestPassword,
    deleteGuestWithPassword,
  };
}
