import type { ReactionType } from "@/types/api";
import type { Reaction } from "@/types/domain";

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
