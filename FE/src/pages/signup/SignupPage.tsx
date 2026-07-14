import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, XCircle } from "lucide-react";
import { checkEmail as checkEmailApi, checkNickname as checkNicknameApi, signup } from "@/apis/auth/auth.api";
import { getApiErrorMessage } from "@/apis/client/errorMessage";
import type { Screen } from "@/app/screen";
import { AuthInput } from "@/components/auth/AuthInput";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9]{2,12}$/;

function toSignupError(error: unknown) {
  return getApiErrorMessage(error, "잠시 후 다시 시도해 주세요.");
}

export function SignupScreen({ onSuccess, onNavigate }: { onSuccess(): void; onNavigate(s: Screen): void }) {
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"ok" | "error" | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailBlurred, setEmailBlurred] = useState(false);
  const [nick, setNick] = useState("");
  const [nickStatus, setNickStatus] = useState<"ok" | "error" | null>(null);
  const [nickChecking, setNickChecking] = useState(false);
  const [nickBlurred, setNickBlurred] = useState(false);
  const [pw, setPw] = useState("");
  const [pwBlurred, setPwBlurred] = useState(false);
  const [pw2, setPw2] = useState("");
  const [pw2Blurred, setPw2Blurred] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const trimmedEmail = email.trim();
  const trimmedNick = nick.trim();
  const emailFormatOk = EMAIL_PATTERN.test(trimmedEmail);
  const nickFormatOk = NICKNAME_PATTERN.test(trimmedNick);
  const emailCanCheck = emailFormatOk && emailStatus !== "ok" && !emailChecking && !loading;
  const nickCanCheck = nickFormatOk && nickStatus !== "ok" && !nickChecking && !loading;
  const pwLengthOk = pw.length >= 8;
  const pwOk = !!(pw && pw2 && pw === pw2);
  const pwBad = !!(pw && pw2 && pw !== pw2);
  const showEmailFormatError = (emailBlurred || submitted) && email.length > 0 && !emailFormatOk;
  const showEmailRequiredError = submitted && !email.trim();
  const showNickFormatError = (nickBlurred || submitted) && nick.length > 0 && !nickFormatOk;
  const showNickRequiredError = submitted && !nick.trim();
  const showPwLengthError = (pwBlurred || submitted) && pw.length > 0 && !pwLengthOk;
  const showPwRequiredError = submitted && !pw;
  const showPwConfirmError = (pw2Blurred || submitted) && pwBad;
  const showPwConfirmRequiredError = submitted && !pw2;
  const canSignup =
    emailStatus === "ok" &&
    nickStatus === "ok" &&
    pwLengthOk &&
    pwOk &&
    !loading &&
    !emailChecking &&
    !nickChecking;

  async function checkEmail() {
    setEmailBlurred(true);
    if (!emailCanCheck) return;

    setEmailChecking(true);
    setError("");

    try {
      const response = await checkEmailApi({ email: trimmedEmail });
      setEmailStatus(response.duplicated ? "error" : "ok");
    } catch (checkError) {
      setEmailStatus("error");
      setError(toSignupError(checkError));
    } finally {
      setEmailChecking(false);
    }
  }

  async function checkNick() {
    setNickBlurred(true);
    if (!nickCanCheck) return;

    setNickChecking(true);
    setError("");

    try {
      const response = await checkNicknameApi({ nickname: trimmedNick });
      setNickStatus(response.duplicated ? "error" : "ok");
    } catch (checkError) {
      setNickStatus("error");
      setError(toSignupError(checkError));
    } finally {
      setNickChecking(false);
    }
  }

  async function handleSignup() {
    setSubmitted(true);

    if (!canSignup) {
      setError("입력값과 중복확인을 모두 완료해 주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signup({
        email: trimmedEmail,
        password: pw,
        nickname: trimmedNick,
      });
      onSuccess();
    } catch (signupError) {
      setError(toSignupError(signupError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="absolute inset-0 bg-white flex flex-col">
      <div className="flex items-center gap-3 px-5 pt-14 pb-4 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={() => onNavigate("login")}
          className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          aria-label="로그인으로 돌아가기"
          type="button"
        >
          <ArrowLeft size={17} className="text-gray-700" />
        </button>
        <h1 className="text-[15px] font-black text-gray-900">회원가입</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-8 space-y-4">
        <AuthInput
          label="이메일"
          value={email}
          onChange={(value) => {
            setEmail(value);
            setEmailStatus(null);
            setError("");
          }}
          onBlur={() => setEmailBlurred(true)}
          placeholder="your@email.com"
          action="중복확인"
          onAction={checkEmail}
          actionDisabled={!emailCanCheck}
          actionLoading={emailChecking}
          status={emailStatus}
          error={
            showEmailRequiredError
              ? "이메일을 입력해 주세요."
              : showEmailFormatError
                ? "이메일 형식에 맞게 입력해 주세요."
                : emailStatus === "error"
                  ? "이미 사용 중인 이메일입니다."
                  : undefined
          }
        />

        <AuthInput
          label="닉네임"
          value={nick}
          onChange={(value) => {
            setNick(value);
            setNickStatus(null);
            setError("");
          }}
          onBlur={() => setNickBlurred(true)}
          placeholder="한글/영문/숫자 2~12자"
          action="중복확인"
          onAction={checkNick}
          actionDisabled={!nickCanCheck}
          actionLoading={nickChecking}
          status={nickStatus}
          error={
            showNickRequiredError
              ? "닉네임을 입력해 주세요."
              : showNickFormatError
                ? "닉네임은 한글, 영문, 숫자 2~12자로 입력해 주세요."
                : nickStatus === "error"
                  ? "이미 사용 중인 닉네임입니다."
                  : undefined
          }
        />

        <AuthInput
          label="비밀번호"
          type="password"
          value={pw}
          onChange={(value) => {
            setPw(value);
            setError("");
          }}
          onBlur={() => setPwBlurred(true)}
          placeholder="8자 이상"
          error={
            showPwRequiredError
              ? "비밀번호를 입력해 주세요."
              : showPwLengthError
                ? "비밀번호는 8자 이상이어야 합니다."
                : undefined
          }
        />

        <AuthInput
          label="비밀번호 확인"
          type="password"
          value={pw2}
          onChange={(value) => {
            setPw2(value);
            setError("");
          }}
          onBlur={() => setPw2Blurred(true)}
          placeholder="비밀번호 재입력"
          error={
            showPwConfirmRequiredError
              ? "비밀번호 확인을 입력해 주세요."
              : showPwConfirmError
                ? "비밀번호가 일치하지 않습니다."
                : undefined
          }
        />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-50 border border-red-200"
            >
              <XCircle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleSignup}
          disabled={!canSignup}
          className="w-full py-3.5 rounded-2xl bg-blue-600 text-[13px] font-black text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none transition-colors shadow-md shadow-blue-200 mt-2"
          type="button"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              가입 중
            </span>
          ) : (
            "회원가입"
          )}
        </button>

        <div className="text-center text-[13px] text-gray-500">
          이미 계정이 있나요?{" "}
          <button onClick={() => onNavigate("login")} className="font-black text-blue-600 hover:underline" type="button">
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}
