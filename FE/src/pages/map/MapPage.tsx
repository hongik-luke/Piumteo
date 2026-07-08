import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LogOut, Navigation2, Plus, Search } from "lucide-react";
import { deletePlace, getNearbyPlaces, getPlaceSummary, getPlacesInBounds } from "@/apis/place/place.api";
import type { Screen } from "@/app/screen";
import { AppLogo, GuestIcon, MemberIcon } from "@/components/common/BrandIcons";
import { LocationModal, LoginRequiredModal } from "@/components/feedback/Overlays";
import { MapLegend } from "@/components/map/MapLegend";
import { NaverMapCanvas, type MapLatLng } from "@/components/map/NaverMapCanvas";
import { PlaceDetailSheet } from "@/components/place/PlaceDetailSheet";
import { PlaceRegisterSheet } from "@/components/place/PlaceRegisterSheet";
import { useDebouncedCallback } from "@/hooks/common/useDebouncedCallback";
import type { PlaceDetailResponse, PlaceMarkerResponse } from "@/types/api";
import type { AuthSession, Place, Reaction, ToastType } from "@/types/domain";
import { apiReactionToDomain } from "@/utils/mappers/apiMappers";
import { getStoredLastMapView, saveLastMapView } from "@/utils/storage/clientState";

const HONGIK: MapLatLng = {
  lat: 37.5512345,
  lng: 126.9234567,
};

function markerToPlace(marker: PlaceMarkerResponse): Place {
  return {
    id: String(marker.placeId),
    name: marker.placeName,
    type: marker.placeType,
    description: "장소 정보를 불러오는 중입니다.",
    distance: "거리 계산 중",
    likes: 0,
    dislikes: 0,
    commentCount: 0,
    latitude: marker.latitude,
    longitude: marker.longitude,
    x: 50,
    y: 50,
  };
}

function detailToPlace(detail: PlaceDetailResponse): Place {
  return {
    id: String(detail.placeId),
    name: detail.placeName,
    type: detail.placeType,
    description: detail.locationDescription ?? "등록된 위치 설명이 없습니다.",
    distance: "거리 계산 중",
    likes: detail.likeCount,
    dislikes: detail.dislikeCount,
    commentCount: detail.commentCount,
    latitude: detail.latitude,
    longitude: detail.longitude,
    x: 50,
    y: 50,
    ownedByMe: detail.isOwner,
  };
}

function getMapCenter(map: any, fallback: MapLatLng): MapLatLng {
  const center = map?.getCenter?.();
  if (!center) return fallback;
  return { lat: center.lat(), lng: center.lng() };
}

export function MapScreen({
  isLoggedIn,
  authSession,
  guestKey,
  onNavigate,
  addToast,
  locationAsked,
  locationGranted,
  onLocationDecision,
  onLogout,
}: {
  isLoggedIn: boolean;
  authSession: AuthSession | null;
  guestKey: string;
  onNavigate(s: Screen): void;
  addToast(t: ToastType, m: string): void;
  locationAsked: boolean;
  locationGranted: boolean;
  onLocationDecision(granted: boolean): void;
  onLogout(): void;
}) {
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showRegisterSheet, setShowRegisterSheet] = useState(false);
  const [registerTarget, setRegisterTarget] = useState<MapLatLng>(() => getStoredLastMapView()?.center ?? HONGIK);
  const [selected, setSelected] = useState<Place | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searching, setSearching] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [mapCenter, setMapCenter] = useState<MapLatLng>(() => getStoredLastMapView()?.center ?? HONGIK);
  const [currentPosition, setCurrentPosition] = useState<MapLatLng | null>(null);
  const [currentPositionKind, setCurrentPositionKind] = useState<"current" | "fallback">("fallback");
  const [placeMarkers, setPlaceMarkers] = useState<PlaceMarkerResponse[]>([]);
  const [reactions, setReactions] = useState<Record<string, Reaction>>({});

  const mapRef = useRef<any>(null);
  const lastMarkerQueryKeyRef = useRef<string | null>(null);

  const loadNearby = useCallback(
    async (center: MapLatLng, force = false) => {
      const queryKey = `nearby:${center.lat.toFixed(6)}:${center.lng.toFixed(6)}`;
      if (!force && lastMarkerQueryKeyRef.current === queryKey) return;

      lastMarkerQueryKeyRef.current = queryKey;
      try {
        const response = await getNearbyPlaces({ lat: center.lat, lng: center.lng });
        setPlaceMarkers(response);
      } catch {
        lastMarkerQueryKeyRef.current = null;
        setPlaceMarkers([]);
        addToast("error", "장소 목록을 불러오지 못했습니다.");
      }
    },
    [addToast],
  );

  const moveToCurrentPosition = useCallback(
    (showSuccessToast = true) => {
      if (!navigator.geolocation) {
        setCurrentPosition(null);
        addToast("warning", "이 브라우저에서는 위치 정보를 사용할 수 없습니다.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const next = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentPosition(next);
          setCurrentPositionKind("current");
          setMapCenter(next);
          setShowSearch(false);
          void loadNearby(next, true);
          onLocationDecision(true);
          if (showSuccessToast) addToast("success", "현재 위치로 이동했습니다.");
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            onLocationDecision(false);
            setCurrentPosition(HONGIK);
            setCurrentPositionKind("fallback");
            setMapCenter(HONGIK);
            void loadNearby(HONGIK, true);
            addToast("warning", "위치 권한이 거부되어 기본 위치로 이동합니다.");
            return;
          }

          addToast("warning", "현재 위치를 가져오지 못했습니다. 브라우저 위치 권한을 확인해 주세요.");
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
      );
    },
    [addToast, loadNearby, onLocationDecision],
  );

  useEffect(() => {
    if (!mapReady) return;

    if (!locationAsked) {
      void loadNearby(mapCenter, true);
      return;
    }

    if (locationGranted) {
      if (currentPosition && currentPositionKind === "current") {
        void loadNearby(currentPosition);
        return;
      }

      moveToCurrentPosition(false);
      return;
    }

    setCurrentPosition(HONGIK);
    setCurrentPositionKind("fallback");
    setMapCenter(HONGIK);
    void loadNearby(HONGIK, true);
  }, [currentPosition, currentPositionKind, loadNearby, locationAsked, locationGranted, mapReady, mapCenter, moveToCurrentPosition]);

  const handleMarkerClick = useCallback(
    async (placeId: number) => {
      const marker = placeMarkers.find((item) => item.placeId === placeId);
      const memberToken = authSession?.accessToken ?? null;

      if (marker) setSelected(markerToPlace(marker));
      setShowSearch(false);
      setShowRegisterSheet(false);

      try {
        const detail = await getPlaceSummary(
          { placeId, "X-Guest-Key": memberToken ? undefined : guestKey },
          {
            accessToken: memberToken,
            authMode: memberToken ? "member" : "guest",
          },
        );
        setSelected(detailToPlace(detail));
        setReactions((prev) => ({
          ...prev,
          [String(placeId)]: apiReactionToDomain(detail.myReactionType),
        }));
      } catch {
        addToast("warning", "장소 상세 정보를 불러오지 못했습니다.");
      }
    },
    [addToast, authSession, guestKey, placeMarkers],
  );

  const rememberCurrentMapView = useCallback(() => {
    const center = getMapCenter(mapRef.current, mapCenter);
    saveLastMapView({ center, savedAt: Date.now() });
  }, [mapCenter]);

  const showSearchAfterMapChanged = useDebouncedCallback(() => {
    if (!selected && !showLoginRequired && !showRegisterSheet) setShowSearch(true);
  }, 350);

  async function handleSearchArea() {
    const map = mapRef.current;
    if (!map) return;

    const bounds = map.getBounds();
    const sw = bounds.getSW();
    const ne = bounds.getNE();
    const queryKey = [
      "bounds",
      sw.lat().toFixed(6),
      sw.lng().toFixed(6),
      ne.lat().toFixed(6),
      ne.lng().toFixed(6),
    ].join(":");

    if (lastMarkerQueryKeyRef.current === queryKey) {
      setShowSearch(false);
      return;
    }

    setSearching(true);
    setShowSearch(false);
    lastMarkerQueryKeyRef.current = queryKey;
    try {
      const response = await getPlacesInBounds({
        minLat: sw.lat(),
        minLng: sw.lng(),
        maxLat: ne.lat(),
        maxLng: ne.lng(),
      });
      setPlaceMarkers(response);
      addToast("success", "이 지역의 장소를 다시 불러왔습니다.");
    } catch {
      lastMarkerQueryKeyRef.current = null;
      setPlaceMarkers([]);
      addToast("error", "장소 목록을 불러오지 못했습니다.");
    } finally {
      setSearching(false);
    }
  }

  function handleMoveToCurrentPosition() {
    moveToCurrentPosition(true);
  }

  function handleOpenRegister() {
    if (!isLoggedIn) {
      setShowLoginRequired(true);
      return;
    }

    const center = getMapCenter(mapRef.current, mapCenter);
    setRegisterTarget(center);
    setSelected(null);
    setShowSearch(false);
    setShowRegisterSheet(true);
  }

  function handlePlaceCreated(place: PlaceMarkerResponse) {
    setPlaceMarkers((prev) => {
      const withoutDuplicate = prev.filter((item) => item.placeId !== place.placeId);
      return [...withoutDuplicate, place];
    });
    setMapCenter({ lat: place.latitude, lng: place.longitude });
    lastMarkerQueryKeyRef.current = null;
  }

  function handleCloseRegisterSheet() {
    setShowRegisterSheet(false);
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <NaverMapCanvas
        center={mapCenter}
        places={placeMarkers}
        currentPosition={currentPosition}
        currentPositionKind={currentPositionKind}
        selectedPlaceId={selected ? Number(selected.id) : null}
        onReady={(map) => {
          mapRef.current = map;
          setMapLoading(false);
          setMapReady(true);
        }}
        onMapChanged={() => {
          rememberCurrentMapView();
          showSearchAfterMapChanged();
        }}
        onMarkerClick={handleMarkerClick}
        onError={() => {
          setMapLoading(false);
          setPlaceMarkers([]);
          addToast("error", "지도를 불러오지 못했습니다. 네이버 지도 설정과 URL 등록을 확인해 주세요.");
        }}
      />

      <AnimatePresence>
        {mapLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-[#E4EBF3] z-30 flex flex-col items-center justify-center gap-4"
          >
            <AppLogo size={64} />
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              <span className="text-[13px] font-semibold text-gray-600">지도를 불러오는 중</span>
            </div>
            <p className="text-[11px] text-gray-400">Naver Maps SDK</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-3.5 shadow-xl flex items-center gap-3 border border-white/50">
              <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              <span className="text-[13px] font-semibold text-gray-700">장소를 검색하는 중</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-center justify-between px-4 pt-12 pb-2 pointer-events-auto">
          <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md rounded-2xl px-3 py-2 shadow-lg border border-white/40">
            <AppLogo size={30} />
            <span className="text-[15px] font-black text-gray-900 tracking-tight">피움터</span>
          </div>

          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu((state) => !state)}
                className="bg-blue-600 rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                type="button"
              >
                <MemberIcon size={20} />
                <span className="text-xs font-bold text-white">내 계정</span>
              </button>

              <AnimatePresence>
                {showAccountMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAccountMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.16 }}
                      className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3.5 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900 truncate">{authSession?.nickname ?? "회원"}</p>
                        <p className="mt-0.5 text-[11px] text-gray-500 truncate">{authSession?.email ?? ""}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-3 flex items-center gap-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors text-left"
                        type="button"
                      >
                        <LogOut size={14} className="flex-shrink-0" />
                        로그아웃
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => onNavigate("login")}
              className="bg-white/90 backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-lg border border-white/40 flex items-center gap-2 hover:bg-white/95 transition-colors"
              type="button"
            >
              <div className="text-gray-600">
                <GuestIcon size={18} />
              </div>
              <span className="text-xs font-bold text-gray-700">로그인</span>
            </button>
          )}
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.94 }}
              className="flex justify-center pb-1 pointer-events-auto"
            >
              <button
                onClick={() => void handleSearchArea()}
                className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm shadow-xl border border-white/50 rounded-full px-5 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-white active:scale-95 transition-all"
                type="button"
              >
                <Search size={13} className="text-blue-500" />이 지역에서 검색
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute right-4 bottom-8 z-20 flex flex-col items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleMoveToCurrentPosition}
          className="w-12 h-12 bg-white rounded-2xl shadow-lg border border-gray-100/80 flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="내 위치로 이동"
          type="button"
        >
          <Navigation2 size={20} className="text-blue-600" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleOpenRegister}
          className="w-14 h-14 bg-blue-600 rounded-[18px] shadow-xl flex items-center justify-center hover:bg-blue-700 active:bg-blue-800 transition-colors"
          aria-label="장소 등록"
          type="button"
        >
          <Plus size={24} className="text-white" strokeWidth={2.5} />
        </motion.button>
      </div>

      <div className="absolute left-3 bottom-8 z-10">
        <MapLegend />
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30"
              onClick={() => setSelected(null)}
            />
            <PlaceDetailSheet
              place={selected}
              onClose={() => setSelected(null)}
              isLoggedIn={isLoggedIn}
              guestKey={guestKey}
              reaction={reactions[selected.id] ?? null}
              onReact={(reaction) => setReactions((prev) => ({ ...prev, [selected.id]: reaction }))}
              addToast={addToast}
              onDeletePlace={() => {
                const placeId = Number(selected.id);
                deletePlace(placeId)
                  .then(() => {
                    setPlaceMarkers((prev) => prev.filter((place) => place.placeId !== placeId));
                    setSelected(null);
                    addToast("success", "장소가 삭제되었습니다.");
                  })
                  .catch(() => {
                    addToast("error", "장소를 삭제하지 못했습니다.");
                  });
              }}
            />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRegisterSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-black/10"
              onClick={handleCloseRegisterSheet}
            />
            <PlaceRegisterSheet
              targetCenter={registerTarget}
              onClose={handleCloseRegisterSheet}
              onCreated={handlePlaceCreated}
              addToast={addToast}
            />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!locationAsked && (
          <LocationModal
            onAllow={() => moveToCurrentPosition()}
            onDeny={() => {
              onLocationDecision(false);
              setCurrentPosition(HONGIK);
              setCurrentPositionKind("fallback");
              setMapCenter(HONGIK);
              void loadNearby(HONGIK, true);
              addToast("info", "기본 위치 기준으로 장소를 불러옵니다.");
            }}
          />
        )}
        {showLoginRequired && (
          <LoginRequiredModal
            onLogin={() => {
              setShowLoginRequired(false);
              onNavigate("login");
            }}
            onCancel={() => setShowLoginRequired(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
