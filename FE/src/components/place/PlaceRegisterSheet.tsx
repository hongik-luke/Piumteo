import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, MapPin, Send, X } from "lucide-react";
import { createPlace } from "@/apis/place/place.api";
import { ApiError } from "@/apis/client/apiClient";
import { PLACE_CFG } from "@/constants/place.constants";
import type { MapLatLng } from "@/components/map/NaverMapCanvas";
import type { PlaceMarkerResponse } from "@/types/api";
import type { PlaceType, ToastType } from "@/types/domain";
import { cn } from "@/utils/cn";

const PLACE_TYPES: PlaceType[] = [
  "SMOKING_BOOTH",
  "SMOKING_AREA",
  "IMPLICIT_SMOKING_AREA",
  "NON_SMOKING_AREA",
];

function registerErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "로그인이 만료되었습니다. 다시 로그인해 주세요.";
    if (error.status === 403) return "장소를 등록할 권한이 없습니다.";
    return error.message || "장소 등록에 실패했습니다.";
  }

  return "장소 등록 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}

export function PlaceRegisterSheet({
  targetCenter,
  onClose,
  onCreated,
  addToast,
}: {
  targetCenter: MapLatLng;
  onClose(): void;
  onCreated(place: PlaceMarkerResponse): void;
  addToast(t: ToastType, m: string): void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<PlaceType | null>(null);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSubmitError("");
  }, [targetCenter.lat, targetCenter.lng]);

  async function handleSubmit() {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const nextErrors: Record<string, string> = {};

    if (!trimmedName) nextErrors.name = "장소 이름을 입력해 주세요.";
    if (trimmedName.length > 100) nextErrors.name = "장소 이름은 100자 이하로 입력해 주세요.";
    if (!type) nextErrors.type = "장소 유형을 선택해 주세요.";
    if (trimmedDescription.length > 255) nextErrors.description = "설명은 255자 이하로 입력해 주세요.";

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
        locationDescription: trimmedDescription || null,
      });

      onCreated({
        placeId: response.placeId,
        placeName: response.placeName,
        placeType: response.placeType,
        latitude: targetCenter.lat,
        longitude: targetCenter.lng,
      });
      addToast("success", "장소가 등록되었습니다.");
      onClose();
    } catch (error) {
      setSubmitError(registerErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="absolute inset-x-0 top-0 bottom-[430px] z-30 pointer-events-none flex items-center justify-center">
        <div className="flex flex-col items-center drop-shadow-xl">
          <div className="w-12 h-12 rounded-full bg-blue-600 border-[3px] border-white flex items-center justify-center shadow-2xl">
            <MapPin size={22} className="text-white" />
          </div>
          <div
            className="w-0 h-0 -mt-0.5"
            style={{ borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "12px solid #2563EB" }}
          />
          <div className="w-4 h-1.5 rounded-full bg-black/20 blur-[3px] mt-0.5" />
        </div>
      </div>

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 370, damping: 34 }}
        className="absolute bottom-0 left-0 right-0 z-40 bg-white rounded-t-[28px] shadow-2xl"
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pb-8 pt-2 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-black text-gray-900">장소 등록</h2>
              <p className="mt-1 text-[11px] text-gray-500">현재 지도 중심 위치에 흡연 장소를 등록합니다.</p>
              <p className="mt-1 text-[10px] text-gray-400 font-mono">
                {targetCenter.lat.toFixed(6)}, {targetCenter.lng.toFixed(6)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              aria-label="닫기"
              type="button"
            >
              <X size={15} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              장소 이름 <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSubmitError("");
              }}
              placeholder="예: 홍대입구 흡연부스"
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
              장소 유형 <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PLACE_TYPES.map((placeType) => {
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
                    type="button"
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
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setSubmitError("");
              }}
              placeholder="위치 설명을 짧게 입력해 주세요."
              rows={3}
              className={cn(
                "w-full px-4 py-3 rounded-2xl border bg-gray-50 text-[13px] focus:outline-none focus:ring-2 transition-all resize-none",
                errors.description ? "border-red-300 focus:ring-red-200 bg-red-50" : "border-gray-200 focus:ring-blue-200 focus:border-blue-400",
              )}
            />
            {errors.description && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.description}
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
            onClick={() => void handleSubmit()}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-blue-600 text-[14px] font-black text-white hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            type="button"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                등록 중
              </>
            ) : (
              <>
                <Send size={15} />이 장소 등록
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
