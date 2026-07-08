import piumteoLogo from "@/assets/logos/app-logo.png";

export function AppLogo({ size = 32 }: { size?: number }) {
  return (
    <img
      src={piumteoLogo}
      alt="피움터 로고"
      style={{ width: size, height: size, flexShrink: 0 }}
      className="object-contain drop-shadow-sm"
    />
  );
}

export function GuestIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="5.5" r="2.8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path
        d="M3.5 15.5 C3.5 12 6 10 9 10 C10.4 10 11.7 10.5 12.6 11.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M13 12.5 L16.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M14.5 10.5 L16.5 12.5 L14.5 14.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function MemberIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" fill="white" opacity="0.2" />
      <circle cx="9" cy="7" r="2.8" fill="white" />
      <path d="M3.5 15.5 C3.5 12 6 10 9 10 C12 10 14.5 12 14.5 15.5" fill="white" />
      <circle cx="14" cy="14" r="3.5" fill="#22C55E" />
      <path
        d="M12.2 14 L13.4 15.2 L15.8 12.8"
        stroke="white"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
