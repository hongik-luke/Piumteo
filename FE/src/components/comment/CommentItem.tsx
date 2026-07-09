import { Pencil, Trash2 } from "lucide-react";
import type { Comment } from "@/types/domain";

function canShowActions(comment: Comment) {
  return comment.isMine || comment.isGuest;
}

export function CommentItem({
  comment,
  onEdit,
  onDelete,
}: {
  comment: Comment;
  onEdit(comment: Comment): void;
  onDelete(comment: Comment): void;
}) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
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
            {canShowActions(comment) && (
              comment.isGuest && !comment.isMine ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(comment)}
                    className="px-2 py-1 rounded-full bg-gray-50 text-[10px] font-semibold text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                    type="button"
                  >
                    비밀번호로 수정
                  </button>
                  <button
                    onClick={() => onDelete(comment)}
                    className="px-2 py-1 rounded-full bg-gray-50 text-[10px] font-semibold text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                    type="button"
                  >
                    비밀번호로 삭제
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onEdit(comment)}
                    className="text-gray-300 hover:text-blue-500 transition-colors p-0.5"
                    aria-label="댓글 수정"
                    type="button"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => onDelete(comment)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-0.5"
                    aria-label="댓글 삭제"
                    type="button"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )
            )}
          </div>
        </div>
        <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
