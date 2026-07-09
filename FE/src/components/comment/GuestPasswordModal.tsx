import { useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Modal } from "@/components/feedback/Overlays";
import { cn } from "@/utils/cn";

export function GuestPasswordModal({
  title = "비밀번호 확인",
  description = "비회원 댓글을 삭제하려면 댓글 비밀번호가 필요합니다.",
  confirmLabel = "확인",
  onConfirm,
  onCancel,
  error,
  loading,
}: {
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm(pw: string): void;
  onCancel(): void;
  error: boolean;
  loading: boolean;
}) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);

  return (
    <Modal onClose={onCancel}>
      <div className="p-6">
        <h2 className="text-[15px] font-bold text-gray-900 mb-1">{title}</h2>
        <p className="text-[13px] text-gray-500 mb-4">{description}</p>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={pw}
            onChange={(event) => setPw(event.target.value)}
            placeholder="댓글 비밀번호"
            className={cn(
              "w-full px-4 py-3 pr-11 rounded-2xl border text-[13px] bg-gray-50 focus:outline-none focus:ring-2 transition-all",
              error ? "border-red-300 focus:ring-red-200 bg-red-50" : "border-gray-200 focus:ring-blue-200 focus:border-blue-400",
            )}
          />
          <button
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            onClick={() => setShow((prev) => !prev)}
            type="button"
            aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
            <AlertCircle size={11} />
            비밀번호가 일치하지 않습니다.
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
            onClick={() => onConfirm(pw)}
            disabled={loading || !pw}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-[13px] font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            type="button"
          >
            {loading ? "확인 중" : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
