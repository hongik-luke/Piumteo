import { useCallback, useEffect, useRef, useState, type UIEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  MessageSquare,
  Pencil,
  Route,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import {
  createGuestComment,
  createMemberComment,
  deleteGuestComment,
  deleteMemberComment,
  getComments,
  updateGuestComment,
  updateMemberComment,
} from "@/apis/comments";
import { ApiError } from "@/apis/client";
import { reactPlaceAsGuest, reactPlaceAsMember } from "@/apis/reactions";
import { PasswordModal, PlaceDeleteModal } from "@/components/feedback/Overlays";
import { BottomSheetSkeleton } from "@/components/skeletons/LoadingSkeletons";
import { PLACE_CFG } from "@/mocks/placeData";
import type { CommentMutationResponse, ReactionSummaryResponse } from "@/types/api";
import type { Comment, Place, Reaction, SheetState, ToastType } from "@/types/domain";
import { apiReactionToDomain, commentResponseToDomain, domainReactionToApi } from "@/utils/apiMappers";
import { cn } from "@/utils/common";

const COMMENTS_PAGE_SIZE = 10;

function apiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.message || fallback;
  return fallback;
}

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

function canEditComment(comment: Comment) {
  return comment.isMine || comment.isGuest;
}

export function PlaceDetailSheet({
  place,
  onClose,
  isLoggedIn,
  guestKey,
  reaction,
  onReact,
  addToast,
  onDeletePlace,
}: {
  place: Place;
  onClose(): void;
  isLoggedIn: boolean;
  guestKey: string;
  reaction: Reaction;
  onReact(r: Reaction): void;
  addToast(t: ToastType, m: string): void;
  onDeletePlace(): void;
}) {
  const placeId = Number(place.id);
  const cfg = PLACE_CFG[place.type];
  const loadingMoreRef = useRef(false);

  const [sheetState, setSheetState] = useState<SheetState>("peek");
  const [loading, setLoading] = useState(true);
  const [showPlaceDelete, setShowPlaceDelete] = useState(false);

  const [currentReaction, setCurrentReaction] = useState<Reaction>(reaction);
  const [likeCount, setLikeCount] = useState(place.likes);
  const [dislikeCount, setDislikeCount] = useState(place.dislikes);
  const [reactionLoading, setReactionLoading] = useState(false);

  const [commentItems, setCommentItems] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(place.commentCount);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [text, setText] = useState("");
  const [guestNick, setGuestNick] = useState("");
  const [guestPw, setGuestPw] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [pwError, setPwError] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editText, setEditText] = useState("");
  const [editPw, setEditPw] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, [place.id]);

  useEffect(() => {
    setCurrentReaction(reaction);
  }, [reaction, place.id]);

  useEffect(() => {
    setLikeCount(place.likes);
    setDislikeCount(place.dislikes);
    setCommentCount(place.commentCount);
  }, [place.id, place.likes, place.dislikes, place.commentCount]);

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
        addToast("error", apiErrorMessage(error, "댓글을 불러오지 못했습니다."));
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

  function handleCommentScroll(event: UIEvent<HTMLDivElement>) {
    const target = event.currentTarget;
    const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (distanceToBottom < 96 && hasNext && nextCursor && !commentsLoading) {
      void loadComments(nextCursor, true);
    }
  }

  function applyReactionSummary(summary: ReactionSummaryResponse) {
    const nextReaction = apiReactionToDomain(summary.myReactionType);
    setLikeCount(summary.likeCount);
    setDislikeCount(summary.dislikeCount);
    setCurrentReaction(nextReaction);
    onReact(nextReaction);
  }

  async function handleReact(next: Exclude<Reaction, null>) {
    if (reactionLoading) return;
    setReactionLoading(true);

    try {
      const body = { reactionType: domainReactionToApi(next) };
      const response = isLoggedIn
        ? await reactPlaceAsMember(placeId, body)
        : await reactPlaceAsGuest(placeId, guestKey, body);
      applyReactionSummary(response);

    } catch (error) {
      addToast("error", apiErrorMessage(error, "반응을 저장하지 못했습니다."));
    } finally {
      setReactionLoading(false);
    }
  }

  async function handleSubmit() {
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
      addToast("error", apiErrorMessage(error, "댓글 등록에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(comment: Comment) {
    setEditingComment(comment);
    setEditText(comment.content);
    setEditPw("");
    setEditError("");
  }

  async function handleEditSubmit() {
    if (!editingComment || !editText.trim() || editLoading) return;
    if (editingComment.isGuest && !editPw.trim()) {
      setEditError("비밀번호를 입력해 주세요.");
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
      setEditingComment(null);
      addToast("success", "댓글을 수정했습니다.");
    } catch (error) {
      setEditError(apiErrorMessage(error, "댓글 수정에 실패했습니다."));
    } finally {
      setEditLoading(false);
    }
  }

  async function handleMemberDelete(comment: Comment) {
    try {
      await deleteMemberComment(placeId, Number(comment.id));
      setCommentItems((prev) => prev.filter((item) => item.id !== comment.id));
      setCommentCount((prev) => Math.max(0, prev - 1));
      addToast("success", "댓글을 삭제했습니다.");
    } catch (error) {
      addToast("error", apiErrorMessage(error, "댓글 삭제에 실패했습니다."));
    }
  }

  async function handleGuestDelete(password: string) {
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

  return (
    <>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 370, damping: 34 }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[28px] shadow-2xl z-40 flex flex-col"
        style={{ maxHeight: sheetState === "full" ? "88%" : "52%" }}
      >
        <button
          className="flex flex-col items-center pt-3 pb-1.5 w-full flex-shrink-0"
          onClick={() => setSheetState((state) => (state === "peek" ? "full" : "peek"))}
          aria-label={sheetState === "peek" ? "자세히 보기" : "접기"}
        >
          <div className="w-10 h-1 rounded-full bg-gray-200 mb-1" />
          <span className="text-[10px] text-gray-300 font-medium flex items-center gap-0.5">
            {sheetState === "peek" ? (
              <>
                <ChevronUp size={10} />
                자세히 보기
              </>
            ) : (
              <>
                <ChevronDown size={10} />
                접기
              </>
            )}
          </span>
        </button>

        {loading ? (
          <BottomSheetSkeleton />
        ) : (
          <div
            className="overflow-y-auto flex-1 px-5"
            style={{ scrollbarWidth: "none" }}
            onScroll={handleCommentScroll}
          >
            <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
              <div className="flex-1">
                <div
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-1.5 border"
                  style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}
                >
                  {cfg.label}
                </div>
                <h2 className="text-[15px] font-bold text-gray-900 leading-tight mb-0.5">{place.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">현재 위치에서 {place.distance}</span>
                  <span className="text-gray-200">·</span>
                  <span className="text-xs text-gray-400 flex items-center gap-0.5">
                    <MessageSquare size={10} />
                    {commentCount}개
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X size={15} />
                </button>
                {isLoggedIn && place.ownedByMe && (
                  <button
                    onClick={() => setShowPlaceDelete(true)}
                    className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            <p className="text-[13px] text-gray-600 leading-relaxed py-4 border-b border-gray-100">
              {place.description}
            </p>

            <div className="flex gap-2 py-4 border-b border-gray-100">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => void handleReact("like")}
                disabled={reactionLoading}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border text-[13px] font-bold transition-all disabled:opacity-60",
                  currentReaction === "like"
                    ? "bg-blue-50 border-blue-300 text-blue-600 shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300",
                )}
              >
                <ThumbsUp size={14} />
                <span>{likeCount}</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => void handleReact("dislike")}
                disabled={reactionLoading}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border text-[13px] font-bold transition-all disabled:opacity-60",
                  currentReaction === "dislike"
                    ? "bg-red-50 border-red-300 text-red-500 shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300",
                )}
              >
                <ThumbsDown size={14} />
                <span>{dislikeCount}</span>
              </motion.button>
              <button
                onClick={() => addToast("info", "길찾기 연결은 다음 단계에서 붙이겠습니다.")}
                className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-[13px] font-bold text-gray-600 hover:border-gray-300 transition-all whitespace-nowrap"
              >
                <Route size={14} />
                길찾기
              </button>
            </div>

            {sheetState === "full" && (
              <div className="pt-4 pb-4">
                <h3 className="text-[13px] font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-gray-400" />
                  댓글
                </h3>

                {commentItems.length === 0 && !commentsLoading ? (
                  <div className="text-center py-6">
                    <MessageSquare size={22} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">첫 댓글을 남겨보세요.</p>
                  </div>
                ) : (
                  commentItems.map((comment) => (
                    <div key={comment.id} className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-gray-400">
                          {comment.author.slice(0, 1).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-800">{comment.author}</span>
                            {comment.isGuest && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                                비회원
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-400">{comment.time}</span>
                            {canEditComment(comment) && (
                              <>
                                <button
                                  onClick={() => openEdit(comment)}
                                  className="text-gray-300 hover:text-blue-500 transition-colors p-0.5"
                                  aria-label="댓글 수정"
                                >
                                  <Pencil size={12} />
                                </button>
                                <button
                                  onClick={() =>
                                    comment.isGuest ? setDeleteTarget(comment) : void handleMemberDelete(comment)
                                  }
                                  className="text-gray-300 hover:text-red-400 transition-colors p-0.5"
                                  aria-label="댓글 삭제"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {commentsLoading && (
                  <div className="py-4 flex justify-center">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
                  </div>
                )}
              </div>
            )}

            {sheetState === "full" && (
              <div className="pt-3 pb-6 border-t border-gray-100">
                {!isLoggedIn && (
                  <>
                    <div className="flex gap-2 mb-2">
                      <input
                        value={guestNick}
                        onChange={(event) => setGuestNick(event.target.value)}
                        placeholder="닉네임"
                        className="flex-1 px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                      />
                      <input
                        type="password"
                        value={guestPw}
                        onChange={(event) => setGuestPw(event.target.value)}
                        placeholder="비밀번호"
                        className="flex-1 px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mb-2 flex items-center gap-1">
                      <Lock size={9} />
                      비밀번호는 비회원 댓글 수정/삭제에 사용합니다.
                    </p>
                  </>
                )}
                <div className="flex gap-2">
                  <input
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder={isLoggedIn ? "댓글을 입력하세요." : "댓글 내용"}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void handleSubmit();
                      }
                    }}
                    className="flex-1 px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  />
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => void handleSubmit()}
                    disabled={submitting || !text.trim() || (!isLoggedIn && (!guestNick.trim() || !guestPw.trim()))}
                    className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-blue-700 transition-colors flex-shrink-0"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {deleteTarget && (
          <PasswordModal
            onConfirm={(password) => void handleGuestDelete(password)}
            onCancel={() => {
              setDeleteTarget(null);
              setPwError(false);
            }}
            error={pwError}
            loading={pwLoading}
          />
        )}
        {editingComment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/45 z-[75] flex items-center justify-center px-5"
            onClick={() => setEditingComment(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              className="w-full bg-white rounded-3xl shadow-2xl p-5"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 className="text-[15px] font-bold text-gray-900 mb-3">댓글 수정</h2>
              <textarea
                value={editText}
                onChange={(event) => setEditText(event.target.value)}
                className="w-full h-24 resize-none px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              />
              {editingComment.isGuest && (
                <input
                  type="password"
                  value={editPw}
                  onChange={(event) => setEditPw(event.target.value)}
                  placeholder="작성 시 입력한 비밀번호"
                  className="mt-2 w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                />
              )}
              {editError && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {editError}
                </p>
              )}
              <div className="flex gap-2.5 mt-5">
                <button
                  onClick={() => setEditingComment(null)}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => void handleEditSubmit()}
                  disabled={editLoading || !editText.trim()}
                  className="flex-1 py-3 rounded-2xl bg-blue-600 text-[13px] font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {editLoading ? "수정 중..." : "수정"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showPlaceDelete && (
          <PlaceDeleteModal
            onConfirm={() => {
              setShowPlaceDelete(false);
              onDeletePlace();
            }}
            onCancel={() => setShowPlaceDelete(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
