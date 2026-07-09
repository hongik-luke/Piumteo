import { MessageSquare } from "lucide-react";
import type { Comment } from "@/types/domain";
import { CommentItem } from "./CommentItem";

export function CommentList({
  comments,
  loading,
  onEdit,
  onDelete,
}: {
  comments: Comment[];
  loading: boolean;
  onEdit(comment: Comment): void;
  onDelete(comment: Comment): void;
}) {
  return (
    <div className="pt-4 pb-4">
      <h3 className="text-[13px] font-bold text-gray-800 mb-3 flex items-center gap-1.5">
        <MessageSquare size={13} className="text-gray-400" />
        댓글
      </h3>

      {comments.length === 0 && !loading ? (
        <div className="text-center py-6">
          <MessageSquare size={22} className="text-gray-200 mx-auto mb-2" />
          <p className="text-xs text-gray-400">아직 등록된 댓글이 없습니다.</p>
        </div>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}

      {loading && (
        <div className="py-4 flex justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
        </div>
      )}
    </div>
  );
}
