import { useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, ArrowLeft, MapPin } from "lucide-react";
import { createPlace } from "@/apis/places";
import { ApiError } from "@/apis/client";
import { MapBackground } from "@/components/map/MapPrimitives";
import type { MapLatLng } from "@/components/map/NaverMapCanvas";
import { PLACE_CFG } from "@/mocks/placeData";
import type { Place, PlaceType, ToastType } from "@/types/domain";
import { cn } from "@/utils/common";

function toRegisterError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "로그인이 만료되었습니다. 다시 로그인해 주세요.";
    if (error.status === 403) return "장소를 등록할 권한이 없습니다.";
    return error.message || "장소 등록에 실패했습니다.";
  }

  return "장소 등록 요청 중 문제가 발생했습니다.";
}

export function RegisterScreen({
  targetCenter,
  onBack,
  addToast,
  onAddPlace,
}: {
  targetCenter: MapLatLng;
  onBack(): void;
  addToast(t: ToastType, m: string): void;
  onAddPlace(p: Place): void;
}) {
  const types: PlaceType[] = ["SMOKING_BOOTH", "SMOKING_AREA", "IMPLICIT_SMOKING_AREA", "NON_SMOKING_AREA"];
  const [name, setName] = useState("");
  const [type, setType] = useState<PlaceType | null>(null);
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    const trimmedName = name.trim();
    const trimmedDesc = desc.trim();

    if (!trimmedName) nextErrors.name = "장소명을 입력해 주세요.";
    if (trimmedName.length > 100) nextErrors.name = "장소명은 100자 이하로 입력해 주세요.";
    if (!type) nextErrors.type = "장소 타입을 선택해 주세요.";
    if (trimmedDesc.length > 255) nextErrors.desc = "설명은 255자 이하로 입력해 주세요.";

    setErrors(nextErrors);
    setSubmitError("");
    if (Object.keys(nextErrors).length > 0 || !type) return;

    setLoading(true);

    try {
      const response = await createPlace({
        placeName: trimmedName,
        placeType: type,
        latitude: targetCenter.lat,
        longitude: targetCenter.lng,
        locationDescription: trimmedDesc || null,
      });

      onAddPlace({
        id: String(response.placeId),
        name: response.placeName,
        type: response.placeType,
        description: trimmedDesc || "설명 없음.",
        distance: "0m",
        likes: 0,
        dislikes: 0,
        commentCount: 0,
        x: 50,
        y: 50,
        ownedByMe: true,
      });
      addToast("success", "장소가 등록되었습니다.");
      onBack();
    } catch (error) {
      setSubmitError(toRegisterError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      <div className="relative flex-1 overflow-hidden">
        <MapBackground />
        <div className="absolute inset-0 bg-black/5" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: "56%" }}>
          <div className="flex flex-col items-center drop-shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-blue-600 border-[3px] border-white flex items-center justify-center shadow-2xl">
              <MapPin size={22} className="text-white" />
            </div>
            <div className="w-0 h-0 -mt-0.5" style={{ borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "12px solid #2563EB" }} />
            <div className="w-4 h-1.5 rounded-full bg-black/20 blur-[3px] mt-0.5" />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: "56%" }}>
          <div className="w-24 h-24 rounded-full border-2 border-blue-500/20" />
        </div>
        <div className="absolute top-0 left-0 right-0 flex items-center gap-3 px-4 pt-12 pb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center border border-white/40 hover:bg-white transition-colors"
            aria-label="지도 화면으로 돌아가기"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div className="flex-1 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-lg border border-white/40">
            <p className="text-xs font-black text-gray-800">장소 위치 선택</p>
            <p className="text-[11px] text-gray-500 mt-0.5">지도 중앙 핀 좌표로 등록됩니다.</p>
          </div>
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-3.5 py-1.5">
          <p className="text-[11px] text-white/80 font-mono tracking-wide">
            {targetCenter.lat.toFixed(6)}, {targetCenter.lng.toFixed(6)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-t-[28px] shadow-2xl flex-shrink-0">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="overflow-y-auto px-5 pb-8 pt-2 space-y-4" style={{ maxHeight: "58svh", scrollbarWidth: "none" }}>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              장소명<span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSubmitError("");
              }}
              placeholder="예: 홍대입구 2번 출구 흡연부스"
              className={cn(
                "w-full px-4 py-3 rounded-2xl border text-[13px] bg-gray-50 focus:outline-none focus:ring-2 transition-all",
                errors.name ? "border-red-300 focus:ring-red-200 bg-red-50" : "border-gray-200 focus:ring-blue-200 focus:border-blue-400",
              )}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.name}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">
              장소 타입<span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {types.map((placeType) => {
                const cfg = PLACE_CFG[placeType];
                const selected = type === placeType;
                return (
                  <motion.button
                    key={placeType}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      setType(placeType);
                      setSubmitError("");
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all",
                      selected ? "text-white shadow-sm border-transparent" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300",
                    )}
                    style={selected ? { backgroundColor: cfg.hex } : {}}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selected ? "rgba(255,255,255,0.6)" : cfg.hex }} />
                    {cfg.label}
                  </motion.button>
                );
              })}
            </div>
            {errors.type && (
              <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.type}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              설명 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <textarea
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value);
                setSubmitError("");
              }}
              placeholder="장소에 대한 간단한 설명을 적어 주세요."
              rows={3}
              className={cn(
                "w-full px-4 py-3 rounded-2xl border bg-gray-50 text-[13px] focus:outline-none focus:ring-2 transition-all resize-none",
                errors.desc ? "border-red-300 focus:ring-red-200 bg-red-50" : "border-gray-200 focus:ring-blue-200 focus:border-blue-400",
              )}
            />
            {errors.desc && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.desc}
              </p>
            )}
          </div>

          {submitError && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 border border-red-200">
              <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">{submitError}</p>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-blue-600 text-[14px] font-black text-white hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-lg shadow-blue-200"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                등록 중...
              </span>
            ) : (
              "현재 위치로 등록"
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
