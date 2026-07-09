import { MessageSquare, X } from "lucide-react";
import { PLACE_CFG } from "@/constants/place.constants";
import type { Place } from "@/types/domain";

export function PlaceHeader({
  place,
  commentCount,
  onClose,
}: {
  place: Place;
  commentCount: number;
  onClose(): void;
}) {
  const cfg = PLACE_CFG[place.type];

  return (
    <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
      <div className="flex-1">
        <div
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-1.5 border"
          style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}
        >
          {cfg.label}
        </div>
        <h2 className="text-[15px] font-bold text-gray-900 leading-tight mb-0.5">{place.name}</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{place.distance}</span>
          <span className="text-gray-200">|</span>
          <span className="text-xs text-gray-400 flex items-center gap-0.5">
            <MessageSquare size={10} />
            댓글 {commentCount}개
          </span>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
        type="button"
        aria-label="닫기"
      >
        <X size={15} />
      </button>
    </div>
  );
}
