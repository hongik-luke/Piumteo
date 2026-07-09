import { motion } from "motion/react";
import { AlertCircle } from "lucide-react";
import type { Comment } from "@/types/domain";

export function CommentEditModal({
  comment,
  text,
  onTextChange,
  guestPassword,
  onGuestPasswordChange,
  error,
  loading,
  onCancel,
  onSubmit,
}: {
  comment: Comment;
  text: string;
  onTextChange(value: string): void;
  guestPassword: string;
  onGuestPasswordChange(value: string): void;
  error: string;
  loading: boolean;
  onCancel(): void;
  onSubmit(): void;
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
        <h2 className="text-[15px] font-bold text-gray-900 mb-3">
          {comment.isGuest ? "비회원 댓글 수정" : "댓글 수정"}
        </h2>
        <textarea
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          className="w-full h-24 resize-none px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
        />
        {comment.isGuest && (
          <input
            type="password"
            value={guestPassword}
            onChange={(event) => onGuestPasswordChange(event.target.value)}
            placeholder="비회원 댓글 비밀번호"
            className="mt-2 w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
          />
        )}
        {error && (
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
            <AlertCircle size={11} />
            {error}
          </p>
        )}
        <div className="flex gap-2.5 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            type="button"
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            disabled={loading || !text.trim()}
            className="flex-1 py-3 rounded-2xl bg-blue-600 text-[13px] font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            type="button"
          >
            {loading ? "저장 중" : "저장"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
