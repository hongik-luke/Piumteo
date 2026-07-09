import { motion } from "motion/react";
import { Lock, Send } from "lucide-react";

export function CommentForm({
  isLoggedIn,
  text,
  onTextChange,
  guestNick,
  onGuestNickChange,
  guestPw,
  onGuestPwChange,
  submitting,
  onSubmit,
}: {
  isLoggedIn: boolean;
  text: string;
  onTextChange(value: string): void;
  guestNick: string;
  onGuestNickChange(value: string): void;
  guestPw: string;
  onGuestPwChange(value: string): void;
  submitting: boolean;
  onSubmit(): void;
}) {
  const disabled = submitting || !text.trim() || (!isLoggedIn && (!guestNick.trim() || !guestPw.trim()));

  return (
    <div className="pt-3 pb-6 border-t border-gray-100">
      {!isLoggedIn && (
        <>
          <div className="grid grid-cols-2 gap-2 mb-2 min-w-0">
            <input
              value={guestNick}
              onChange={(event) => onGuestNickChange(event.target.value)}
              placeholder="닉네임"
              className="min-w-0 w-full px-3 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            />
            <input
              type="password"
              value={guestPw}
              onChange={(event) => onGuestPwChange(event.target.value)}
              placeholder="비밀번호"
              className="min-w-0 w-full px-3 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            />
          </div>
          <p className="text-[10px] text-gray-400 mb-2 flex items-center gap-1">
            <Lock size={9} />
            비회원 댓글 수정/삭제에 필요합니다.
          </p>
        </>
      )}
      <div className="flex gap-2 min-w-0">
        <input
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder={isLoggedIn ? "댓글을 입력하세요" : "비회원 댓글 입력"}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmit();
            }
          }}
          className="min-w-0 flex-1 px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
        />
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onSubmit}
          disabled={disabled}
          className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-blue-700 transition-colors flex-shrink-0"
          type="button"
        >
          {submitting ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <Send size={14} />
          )}
        </motion.button>
      </div>
    </div>
  );
}
