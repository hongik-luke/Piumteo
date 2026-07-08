import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Info, MapPin, Trash2, X, XCircle } from "lucide-react";
import type { ToastItem } from "@/types/domain";
import { cn } from "@/utils/cn";

export function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: string) => void }) {
  const meta = {
    success: { icon: <CheckCircle2 size={15} />, cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    error: { icon: <XCircle size={15} />, cls: "text-red-700 bg-red-50 border-red-200" },
    warning: { icon: <AlertCircle size={15} />, cls: "text-amber-700 bg-amber-50 border-amber-200" },
    info: { icon: <Info size={15} />, cls: "text-blue-700 bg-blue-50 border-blue-200" },
  };

  return (
    <div className="absolute top-[72px] inset-x-0 z-[80] flex flex-col items-center gap-2 px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const { icon, cls } = meta[toast.type];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-2xl border shadow-xl text-[13px] font-semibold pointer-events-auto max-w-xs w-full",
                cls,
              )}
            >
              {icon}
              <span className="flex-1">{toast.message}</span>
              <button
                onClick={() => onRemove(toast.id)}
                className="opacity-50 hover:opacity-80 ml-1"
                type="button"
                aria-label="토스트 닫기"
              >
                <X size={13} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function Modal({ onClose, children }: { onClose?: () => void; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/55 z-[70] flex items-center justify-center px-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 12 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function LocationModal({ onAllow, onDeny }: { onAllow(): void; onDeny(): void }) {
  return (
    <Modal>
      <div className="p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <MapPin size={28} className="text-blue-500" />
        </div>
        <h2 className="text-[15px] font-bold text-gray-900 mb-2">내 위치를 사용해도 될까요?</h2>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-1">
          현재 위치를 기준으로 가까운 흡연 장소를 보여드릴게요.
          <br />
          위치 정보는 브라우저 권한으로만 확인합니다.
        </p>
        <p className="text-xs text-gray-400 mb-6">선택은 이 기기에 저장되며, 나중에 다시 바꿀 수 있습니다.</p>
        <div className="flex gap-2.5">
          <button
            onClick={onDeny}
            className="flex-1 py-3 rounded-2xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            type="button"
          >
            나중에
          </button>
          <button
            onClick={onAllow}
            className="flex-1 py-3 rounded-2xl bg-blue-600 text-[13px] font-semibold text-white hover:bg-blue-700 transition-colors"
            type="button"
          >
            위치 허용
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function LoginRequiredModal({ onLogin, onCancel }: { onLogin(): void; onCancel(): void }) {
  return (
    <Modal onClose={onCancel}>
      <div className="p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <Info size={28} className="text-amber-500" />
        </div>
        <h2 className="text-[15px] font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
          장소 등록과 일부 작업은 회원만 이용할 수 있어요.
          <br />
          로그인한 뒤 다시 시도해 주세요.
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            type="button"
          >
            취소
          </button>
          <button
            onClick={onLogin}
            className="flex-1 py-3 rounded-2xl bg-blue-600 text-[13px] font-semibold text-white hover:bg-blue-700 transition-colors"
            type="button"
          >
            로그인하기
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function PasswordModal({
  onConfirm,
  onCancel,
  error,
  loading,
}: {
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
        <h2 className="text-[15px] font-bold text-gray-900 mb-1">비밀번호 확인</h2>
        <p className="text-[13px] text-gray-500 mb-4">비회원 댓글을 수정하거나 삭제하려면 비밀번호가 필요합니다.</p>
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
            {loading ? "확인 중" : "확인"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function PlaceDeleteModal({ onConfirm, onCancel }: { onConfirm(): void; onCancel(): void }) {
  return (
    <Modal onClose={onCancel}>
      <div className="p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={26} className="text-red-500" />
        </div>
        <h2 className="text-[15px] font-bold text-gray-900 mb-2">정말 삭제할까요?</h2>
        <p className="text-[13px] text-gray-500 mb-6">삭제한 장소는 되돌릴 수 없습니다.</p>
        <div className="flex gap-2.5">
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
      </div>
    </Modal>
  );
}
