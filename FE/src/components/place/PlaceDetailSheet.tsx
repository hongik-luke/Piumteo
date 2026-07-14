import { useEffect, useState, type UIEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BottomSheetSkeleton } from "@/components/common/LoadingSkeletons";
import { CommentDeleteConfirmModal } from "@/components/comment/CommentDeleteConfirmModal";
import { CommentEditModal } from "@/components/comment/CommentEditModal";
import { CommentForm } from "@/components/comment/CommentForm";
import { CommentList } from "@/components/comment/CommentList";
import { GuestPasswordModal } from "@/components/comment/GuestPasswordModal";
import { PlaceActionBar } from "@/components/place/PlaceActionBar";
import { PlaceDeleteModal } from "@/components/place/PlaceDeleteModal";
import { PlaceHeader } from "@/components/place/PlaceHeader";
import { PlaceReactionBar } from "@/components/place/PlaceReactionBar";
import { useComments } from "@/hooks/comment/useComments";
import { useReaction } from "@/hooks/reaction/useReaction";
import { openNaverWalkRoute } from "@/libs/naver-map/naverRoute";
import type { MapLatLng } from "@/components/map/NaverMapCanvas";
import type { Place, Reaction, SheetState, ToastType } from "@/types/domain";

export function PlaceDetailSheet({
  place,
  onClose,
  isLoggedIn,
  currentPosition,
  reaction,
  onReact,
  addToast,
  onDeletePlace,
}: {
  place: Place;
  onClose(): void;
  isLoggedIn: boolean;
  currentPosition: MapLatLng | null;
  reaction: Reaction;
  onReact(r: Reaction): void;
  addToast(t: ToastType, m: string): void;
  onDeletePlace(): void;
}) {
  const placeId = Number(place.id);
  const [sheetState, setSheetState] = useState<SheetState>("peek");
  const [loading, setLoading] = useState(true);
  const [showPlaceDelete, setShowPlaceDelete] = useState(false);

  const comments = useComments({
    placeId,
    isLoggedIn,
    initialCommentCount: place.commentCount,
    addToast,
  });

  const {
    currentReaction,
    likeCount,
    dislikeCount,
    reactionLoading,
    handleReact,
  } = useReaction({
    placeId,
    isLoggedIn,
    initialReaction: reaction,
    initialLikeCount: place.likes,
    initialDislikeCount: place.dislikes,
    onReact,
    addToast,
  });

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, [place.id]);

  function handleCommentScroll(event: UIEvent<HTMLDivElement>) {
    const target = event.currentTarget;
    comments.loadMoreIfNeeded(target.scrollHeight, target.scrollTop, target.clientHeight);
  }

  function handleOpenWalkRoute() {
    if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) {
      addToast("error", "장소 좌표가 없어 길찾기를 열 수 없습니다.");
      return;
    }

    addToast("info", "네이버 지도 앱으로 도보 길찾기를 엽니다.");
    openNaverWalkRoute({
      dlat: place.latitude,
      dlng: place.longitude,
      dname: place.name,
      slat: currentPosition?.lat,
      slng: currentPosition?.lng,
      sname: currentPosition ? "현재 위치" : undefined,
    });
  }

  function handleConfirmPlaceDelete() {
    setShowPlaceDelete(false);
    onDeletePlace();
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
          aria-label={sheetState === "peek" ? "시트 펼치기" : "시트 접기"}
          type="button"
        >
          <div className="w-10 h-1 rounded-full bg-gray-200 mb-1" />
          <span className="text-[10px] text-gray-300 font-medium flex items-center gap-0.5">
            {sheetState === "peek" ? (
              <>
                <ChevronUp size={10} />
                펼치기
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
            <PlaceHeader place={place} commentCount={comments.commentCount} onClose={onClose} />

            <p className="text-[13px] text-gray-600 leading-relaxed py-4 border-b border-gray-100">
              {place.description}
            </p>

            <div className="flex gap-2 py-4 border-b border-gray-100">
              <PlaceReactionBar
                currentReaction={currentReaction}
                likeCount={likeCount}
                dislikeCount={dislikeCount}
                reactionLoading={reactionLoading}
                onReact={handleReact}
              />
              <PlaceActionBar
                canDelete={isLoggedIn && Boolean(place.ownedByMe)}
                onOpenWalkRoute={handleOpenWalkRoute}
                onDeletePlace={() => setShowPlaceDelete(true)}
              />
            </div>

            {sheetState === "full" && (
              <>
                <CommentList
                  comments={comments.commentItems}
                  loading={comments.commentsLoading}
                  onEdit={comments.beginEdit}
                  onDelete={comments.requestDelete}
                />
                <CommentForm
                  isLoggedIn={isLoggedIn}
                  text={comments.text}
                  onTextChange={comments.setText}
                  guestNick={comments.guestNick}
                  onGuestNickChange={comments.setGuestNick}
                  guestPw={comments.guestPw}
                  onGuestPwChange={comments.setGuestPw}
                  submitting={comments.submitting}
                  onSubmit={() => void comments.submitComment()}
                />
              </>
            )}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {comments.confirmDeleteTarget && (
          <CommentDeleteConfirmModal
            comment={comments.confirmDeleteTarget}
            onCancel={comments.cancelDeleteConfirm}
            onConfirm={() => void comments.confirmDelete()}
          />
        )}
        {comments.deleteTarget && (
          <GuestPasswordModal
            title="비회원 댓글 삭제"
            description="비회원 댓글을 삭제하려면 댓글 비밀번호가 필요합니다."
            confirmLabel="삭제"
            onConfirm={(password) => void comments.deleteGuestWithPassword(password)}
            onCancel={comments.cancelGuestPassword}
            error={comments.pwError}
            loading={comments.pwLoading}
          />
        )}
        {comments.editingComment && (
          <CommentEditModal
            comment={comments.editingComment}
            text={comments.editText}
            onTextChange={comments.setEditText}
            guestPassword={comments.editPw}
            onGuestPasswordChange={comments.setEditPw}
            error={comments.editError}
            loading={comments.editLoading}
            onCancel={comments.cancelEdit}
            onSubmit={() => void comments.submitEdit()}
          />
        )}
        {showPlaceDelete && (
          <PlaceDeleteModal onConfirm={handleConfirmPlaceDelete} onCancel={() => setShowPlaceDelete(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
