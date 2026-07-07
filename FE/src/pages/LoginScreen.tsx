import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MapPin, XCircle } from "lucide-react";
import { login } from "@/apis/auth";
import { ApiError } from "@/apis/client";
import { AuthInput } from "@/components/auth/AuthInput";
import { AppLogo } from "@/components/brand/BrandIcons";
import type { AuthSession, Screen } from "@/types/domain";
import { authResponseToSession } from "@/utils/apiMappers";

function toLoginError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "이메일 또는 비밀번호가 올바르지 않습니다.";
    return error.message || "로그인에 실패했습니다.";
  }

  return "로그인 요청 중 문제가 발생했습니다.";
}

export function LoginScreen({ onLogin, onNavigate }: { onLogin(session: AuthSession): void; onNavigate(s: Screen): void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !pw) {
      setError("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await login({ email: trimmedEmail, password: pw });
      const session = authResponseToSession(response);

      if (!session) {
        setError("로그인 응답에 토큰이 없습니다. 다시 시도해 주세요.");
        return;
      }

      onLogin(session);
    } catch (loginError) {
      setError(toLoginError(loginError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="absolute inset-0 bg-[#F7F9FC] flex flex-col overflow-hidden px-5 pt-12 pb-5">
      <div className="flex items-center justify-center gap-2.5 flex-shrink-0">
        <AppLogo size={48} />
        <div>
          <h1 className="text-[25px] font-black text-gray-950 tracking-tight leading-none">피움터</h1>
          <p className="mt-1 text-[11px] font-semibold text-gray-400">Smoking Area Finder</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-gray-500 flex-shrink-0">
        <MapPin size={13} className="text-blue-500" />
        주변 흡연·금연 장소를 빠르게 확인하세요
      </div>

      <div className="mt-6 rounded-[24px] bg-white border border-gray-100 shadow-xl shadow-slate-200/70 px-5 py-5 flex-shrink-0">
        <h2 className="text-[17px] font-black text-gray-950 mb-1">로그인</h2>
        <p className="text-[12px] text-gray-400 mb-4">계정으로 장소 등록과 평가 관리를 이어가세요.</p>

        <div className="space-y-3">
          <AuthInput label="이메일" value={email} onChange={setEmail} placeholder="your@email.com" />
          <AuthInput label="비밀번호" type="password" value={pw} onChange={setPw} placeholder="비밀번호 입력" />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-2 p-3 rounded-2xl bg-red-50 border border-red-200"
            >
              <XCircle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-4 w-full h-12 rounded-2xl bg-blue-600 text-[13px] font-black text-white hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-md shadow-blue-200"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              로그인 중...
            </span>
          ) : (
            "로그인"
          )}
        </button>

        <button
          onClick={() => onNavigate("map")}
          className="mt-2.5 w-full h-11 rounded-2xl border border-gray-200 text-[13px] text-gray-600 font-bold hover:bg-gray-50 transition-colors"
        >
          비회원으로 계속하기
        </button>
      </div>

      <div className="mt-4 text-center text-[13px] text-gray-500 flex-shrink-0">
        아직 계정이 없으신가요?{" "}
        <button onClick={() => onNavigate("signup")} className="font-black text-blue-600 hover:underline">
          회원가입
        </button>
      </div>
    </div>
  );
}
