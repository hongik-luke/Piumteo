import { motion } from "motion/react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import type { Reaction } from "@/types/domain";
import { cn } from "@/utils/cn";

export function PlaceReactionBar({
  currentReaction,
  likeCount,
  dislikeCount,
  reactionLoading,
  onReact,
}: {
  currentReaction: Reaction;
  likeCount: number;
  dislikeCount: number;
  reactionLoading: boolean;
  onReact(reaction: Exclude<Reaction, null>): void;
}) {
  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => void onReact("like")}
        disabled={reactionLoading}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border text-[13px] font-bold transition-all disabled:opacity-60",
          currentReaction === "like"
            ? "bg-blue-50 border-blue-300 text-blue-600 shadow-sm"
            : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300",
        )}
        type="button"
      >
        <ThumbsUp size={14} />
        <span>{likeCount}</span>
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => void onReact("dislike")}
        disabled={reactionLoading}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border text-[13px] font-bold transition-all disabled:opacity-60",
          currentReaction === "dislike"
            ? "bg-red-50 border-red-300 text-red-500 shadow-sm"
            : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300",
        )}
        type="button"
      >
        <ThumbsDown size={14} />
        <span>{dislikeCount}</span>
      </motion.button>
    </>
  );
}
