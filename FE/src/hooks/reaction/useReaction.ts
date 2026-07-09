import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/apis/client/errorMessage";
import { reactPlaceAsGuest, reactPlaceAsMember } from "@/apis/reaction/reaction.api";
import type { ReactionSummaryResponse } from "@/types/api";
import type { Reaction, ToastType } from "@/types/domain";
import { apiReactionToDomain, domainReactionToApi } from "@/utils/mappers/reaction.mapper";

export function useReaction({
  placeId,
  isLoggedIn,
  initialReaction,
  initialLikeCount,
  initialDislikeCount,
  onReact,
  addToast,
}: {
  placeId: number;
  isLoggedIn: boolean;
  initialReaction: Reaction;
  initialLikeCount: number;
  initialDislikeCount: number;
  onReact(r: Reaction): void;
  addToast(t: ToastType, m: string): void;
}) {
  const [currentReaction, setCurrentReaction] = useState<Reaction>(initialReaction);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [dislikeCount, setDislikeCount] = useState(initialDislikeCount);
  const [reactionLoading, setReactionLoading] = useState(false);

  useEffect(() => {
    setCurrentReaction(initialReaction);
  }, [initialReaction, placeId]);

  useEffect(() => {
    setLikeCount(initialLikeCount);
    setDislikeCount(initialDislikeCount);
  }, [placeId, initialLikeCount, initialDislikeCount]);

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
        : await reactPlaceAsGuest(placeId, body);
      applyReactionSummary(response);
    } catch (error) {
      addToast("error", getApiErrorMessage(error, "반응을 저장하지 못했습니다."));
    } finally {
      setReactionLoading(false);
    }
  }

  return {
    currentReaction,
    likeCount,
    dislikeCount,
    reactionLoading,
    handleReact,
  };
}
