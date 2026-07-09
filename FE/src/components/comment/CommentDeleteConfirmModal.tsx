import { motion } from "motion/react";
import { Trash2 } from "lucide-react";
import type { Comment } from "@/types/domain";

export function CommentDeleteConfirmModal({
  comment,
  onCancel,
  onConfirm,
}: {
  comment: Comment;
  onCancel(): void;
  onConfirm(): void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/45 z-[75] flex items-center justify-center px-5"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 12 }}
        className="w-full bg-white rounded-3xl shadow-2xl p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h2 className="text-[15px] font-bold text-gray-900 text-center mb-2">댓글을 삭제할까요?</h2>
        <p className="text-[13px] text-gray-500 text-center leading-relaxed">
          {comment.isGuest ? "비회원 댓글은 비밀번호 확인 후 삭제됩니다." : "삭제한 댓글은 되돌릴 수 없습니다."}
        </p>
        <div className="flex gap-2.5 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            type="button"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-[13px] font-semibold text-white hover:bg-red-600 transition-colors"
            type="button"
          >
            삭제
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
