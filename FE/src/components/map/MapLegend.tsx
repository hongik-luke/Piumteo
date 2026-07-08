import { PLACE_CFG } from "@/constants/place.constants";
import type { PlaceType } from "@/types/domain";

export function MapLegend() {
  return (
    <div className="bg-white/88 backdrop-blur-md rounded-2xl p-2.5 shadow-lg border border-white/50 space-y-1.5 min-w-[120px]">
      {(Object.entries(PLACE_CFG) as [PlaceType, typeof PLACE_CFG[PlaceType]][]).map(([type, cfg]) => (
        <div key={type} className="flex items-center gap-2">
          <div
            className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white/50"
            style={{ backgroundColor: cfg.hex }}
          />
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
