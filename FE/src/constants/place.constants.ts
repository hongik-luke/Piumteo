import type { PlaceType } from "@/types/domain";

export const PLACE_CFG: Record<PlaceType, { label: string; color: string; bg: string; border: string; hex: string }> = {
  SMOKING_BOOTH: { label: "흡연부스", color: "#1E40AF", bg: "#EFF6FF", border: "#60A5FA", hex: "#2563EB" },
  SMOKING_AREA: { label: "흡연구역", color: "#14532D", bg: "#F0FDF4", border: "#22C55E", hex: "#16A34A" },
  IMPLICIT_SMOKING_AREA: {
    label: "암묵적 흡연구역",
    color: "#78350F",
    bg: "#FEFCE8",
    border: "#FCD34D",
    hex: "#FACC15",
  },
  NON_SMOKING_AREA: { label: "금연구역", color: "#7F1D1D", bg: "#FEF2F2", border: "#EF4444", hex: "#DC2626" },
};
