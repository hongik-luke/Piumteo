import type { PropsWithChildren } from "react";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex items-start justify-center min-h-svh bg-slate-400 sm:py-8">
      <div
        className="relative w-full sm:w-[390px] bg-[#E4EBF3] overflow-hidden"
        style={{
          height: "100svh",
          maxHeight: "100svh",
          fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {children}
      </div>
    </div>
  );
}
