import { useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, XCircle } from "lucide-react";
import { cn } from "@/utils/common";

export function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  hint,
  action,
  onAction,
  actionDisabled = false,
  actionLoading = false,
  status,
}: {
  label: string;
  type?: string;
  value: string;
  onChange(v: string): void;
  onBlur?(): void;
  placeholder?: string;
  error?: string;
  hint?: string;
  action?: string;
  onAction?(): void;
  actionDisabled?: boolean;
  actionLoading?: boolean;
  status?: "ok" | "error" | null;
}) {
  const [show, setShow] = useState(false);
  const isPw = type === "password";

  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={isPw && !show ? "password" : "text"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            className={cn(
              "w-full px-4 py-3 rounded-2xl border bg-gray-50 text-[13px] focus:outline-none focus:ring-2 transition-all",
              isPw ? "pr-11" : status === "ok" ? "pr-10" : "",
              error ? "border-red-300 focus:ring-red-200 bg-red-50" : "border-gray-200 focus:ring-blue-200 focus:border-blue-400",
            )}
          />
          {isPw && (
            <button
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setShow(!show)}
              type="button"
              aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          )}
          {!isPw && status === "ok" && <CheckCircle2 size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />}
          {!isPw && status === "error" && <XCircle size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-400" />}
        </div>
        {action && onAction && (
          <button
            type="button"
            onClick={onAction}
            disabled={actionDisabled || actionLoading}
            className="px-3 py-2 rounded-2xl border border-blue-200 bg-blue-50 text-xs font-bold text-blue-600 hover:bg-blue-100 whitespace-nowrap transition-colors flex-shrink-0 disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {actionLoading ? "확인 중" : action}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle size={10} />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
          <CheckCircle2 size={10} />
          {hint}
        </p>
      )}
    </div>
  );
}
