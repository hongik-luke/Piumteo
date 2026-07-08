import { PLACE_CFG } from "@/mocks/placeData";
import type { PlaceType } from "@/types/domain";

export function MapBackground() {
  return (
    <svg viewBox="0 0 390 740" className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="390" height="740" fill="#E4EBF3" />
      <rect x="8" y="390" width="95" height="72" rx="6" fill="#BDD9A4" />
      <rect x="245" y="495" width="65" height="54" rx="5" fill="#C1DCA8" />
      <rect x="145" y="72" width="52" height="44" rx="4" fill="#C5DDB0" />
      <rect x="310" y="210" width="72" height="44" rx="4" fill="#BEDDA5" />
      {([[30, 410], [55, 430], [80, 415], [260, 510], [285, 525]] as [number, number][]).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill="#A8CC8C" opacity="0.7" />
      ))}
      <path d="M0 295 L90 275 L200 268 L295 262 L390 255"
        stroke="#4D7CC9" strokeWidth="5" fill="none" opacity="0.35" />
      <path d="M0 295 L90 275 L200 268 L295 262 L390 255"
        stroke="white" strokeWidth="2" fill="none" opacity="0.6" strokeDasharray="12 8" />
      <rect x="0" y="115" width="390" height="18" fill="#FFFFFF" opacity="0.96" />
      <rect x="0" y="268" width="390" height="22" fill="#FFFFFF" opacity="0.96" />
      <rect x="0" y="448" width="390" height="16" fill="#FFFFFF" opacity="0.92" />
      <rect x="0" y="586" width="390" height="12" fill="#FFFFFF" opacity="0.88" />
      <rect x="0" y="192" width="390" height="9" fill="#FFFFFF" opacity="0.72" />
      <rect x="0" y="350" width="390" height="9" fill="#FFFFFF" opacity="0.72" />
      <rect x="0" y="518" width="390" height="8" fill="#FFFFFF" opacity="0.68" />
      <rect x="0" y="650" width="390" height="8" fill="#FFFFFF" opacity="0.65" />
      <rect x="76" y="0" width="12" height="740" fill="#FFFFFF" opacity="0.92" />
      <rect x="186" y="0" width="20" height="740" fill="#FFFFFF" opacity="0.96" />
      <rect x="308" y="0" width="12" height="740" fill="#FFFFFF" opacity="0.92" />
      <rect x="28" y="0" width="7" height="740" fill="#FFFFFF" opacity="0.66" />
      <rect x="132" y="0" width="7" height="740" fill="#FFFFFF" opacity="0.62" />
      <rect x="248" y="0" width="7" height="740" fill="#FFFFFF" opacity="0.62" />
      <rect x="356" y="0" width="7" height="740" fill="#FFFFFF" opacity="0.62" />
      {([
        [92, 10, 35, 98], [135, 20, 45, 88], [206, 14, 35, 94], [249, 8, 52, 100], [328, 18, 54, 90], [10, 12, 60, 96],
        [92, 140, 34, 45], [135, 140, 45, 45], [206, 140, 35, 45], [249, 140, 52, 45], [328, 140, 54, 45], [10, 140, 60, 45],
        [92, 208, 34, 52], [135, 208, 45, 52], [206, 208, 35, 52], [249, 208, 52, 52], [328, 208, 54, 52], [10, 208, 60, 52],
        [92, 297, 34, 46], [135, 297, 45, 46], [206, 297, 35, 46], [249, 297, 52, 46], [328, 297, 54, 46], [10, 297, 60, 46],
        [92, 366, 34, 75], [135, 366, 45, 75], [206, 366, 35, 75], [249, 366, 52, 75], [328, 366, 54, 75],
        [92, 466, 34, 45], [135, 466, 45, 45], [206, 466, 35, 45], [249, 466, 52, 45], [328, 466, 54, 45], [10, 466, 60, 45],
        [92, 534, 34, 46], [135, 534, 45, 46], [206, 534, 35, 46], [249, 534, 52, 46], [328, 534, 54, 46], [10, 534, 60, 46],
        [92, 602, 34, 55], [206, 602, 88, 55], [328, 602, 54, 55], [10, 602, 60, 55],
      ] as [number, number, number, number][]).map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="2"
          fill={i % 3 === 0 ? "#CAD5E3" : i % 3 === 1 ? "#CFD9E8" : "#C8D4E2"} />
      ))}
      <rect x="168" y="253" width="60" height="18" rx="3" fill="#1A4FC4" opacity="0.88" />
      <text x="198" y="265" textAnchor="middle" fill="#FFFFFF" fontSize="7.5"
        fontFamily="Noto Sans KR, sans-serif" fontWeight="600">홍대입구역</text>
      <text x="11" y="110" fill="#94A8BE" fontSize="7" fontFamily="Noto Sans KR, sans-serif">와우산로</text>
      <text x="11" y="264" fill="#94A8BE" fontSize="7" fontFamily="Noto Sans KR, sans-serif">양화로</text>
      <text x="11" y="445" fill="#94A8BE" fontSize="7" fontFamily="Noto Sans KR, sans-serif">서교로</text>
    </svg>
  );
}

export function MapLegend() {
  return (
    <div className="bg-white/88 backdrop-blur-md rounded-2xl p-2.5 shadow-lg border border-white/50 space-y-1.5 min-w-[120px]">
      {(Object.entries(PLACE_CFG) as [PlaceType, typeof PLACE_CFG[PlaceType]][]).map(([type, cfg]) => (
        <div key={type} className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white/50"
            style={{ backgroundColor: cfg.hex }} />
          <span className="text-[10px] text-gray-600 font-medium leading-none">{cfg.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-0.5 border-t border-gray-100">
        <div className="relative flex items-center justify-center w-3.5 h-3.5 flex-shrink-0">
          <div className="absolute w-3.5 h-3.5 rounded-full bg-blue-400/25" />
          <div
            className="w-2.5 h-2.5 rounded-full bg-blue-600 border-[1.5px] border-white"
            style={{ boxShadow: "0 1px 4px rgba(37,99,235,0.45)" }}
          />
        </div>
        <span className="text-[10px] text-gray-600 font-medium leading-none">내 위치</span>
      </div>
    </div>
  );
}
