import { Trash2 } from "lucide-react";
import type { Comment } from "@/types/domain";

export function CommentItem({ comment, onDelete }: { comment: Comment; onDelete(): void }) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="4.5" r="2.5" fill="#9CA3AF" />
          <path d="M1.5 13 C1.5 10 3.8 8 7 8 C10.2 8 12.5 10 12.5 13" fill="#9CA3AF" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-800">{comment.author}</span>
            {comment.isGuest && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">비회원</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400">{comment.time}</span>
            {comment.isMine && (
              <button onClick={onDelete} className="text-gray-300 hover:text-red-400 transition-colors p-0.5">
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
        <p className="text-[13px] text-gray-700 leading-relaxed">{comment.content}</p>
      </div>
    </div>
  );
}
