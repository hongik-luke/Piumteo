import { useEffect, useRef } from "react";
import markerImplicitSmokingArea from "@/assets/icons/marker-implicit-smoking-area-bgclean.png";
import markerNonSmokingArea from "@/assets/icons/marker-non-smoking-area-bgclean.png";
import markerSmokingArea from "@/assets/icons/marker-smoking-area-bgclean.png";
import markerSmokingBooth from "@/assets/icons/marker-smoking-booth-bgclean.png";
import { loadNaverMapScript } from "@/lib/naverMapLoader";
import type { PlaceMarkerResponse, PlaceType } from "@/types/api";

export interface MapLatLng {
  lat: number;
  lng: number;
}

const MARKER_IMAGES: Record<PlaceType, string> = {
  SMOKING_BOOTH: markerSmokingBooth,
  SMOKING_AREA: markerSmokingArea,
  IMPLICIT_SMOKING_AREA: markerImplicitSmokingArea,
  NON_SMOKING_AREA: markerNonSmokingArea,
};

function markerIconContent(placeType: PlaceType, selected: boolean) {
  const transform = selected ? "translateY(-5px) scale(1.08)" : "translateY(0) scale(1)";
  const shadowOpacity = selected ? ".26" : ".18";
  const haloOpacity = selected ? ".28" : "0";

  return `
    <style>
      @keyframes piumteo-marker-pop {
        0% { transform: translateY(0) scale(.96); }
        60% { transform: translateY(-7px) scale(1.1); }
        100% { transform: ${transform}; }
      }
      .piumteo-place-marker:hover .piumteo-place-marker-image {
        transform: translateY(-2px) scale(1.035);
        filter: drop-shadow(0 11px 9px rgba(15,23,42,.26)) drop-shadow(0 2px 3px rgba(15,23,42,.2));
      }
    </style>
    <div class="piumteo-place-marker" style="
      width:50px;
      height:58px;
      position:relative;
      display:flex;
      align-items:center;
      justify-content:center;
      pointer-events:auto;
      background:transparent;
      transform:${transform};
      transform-origin:50% 90%;
      transition:transform .22s cubic-bezier(.2,.8,.2,1);
      animation:${selected ? "piumteo-marker-pop .28s cubic-bezier(.2,.8,.2,1)" : "none"};
      cursor:pointer;
    ">
      <span style="
        position:absolute;
        left:50%;
        bottom:1px;
        width:30px;
        height:10px;
        transform:translateX(-50%);
        border-radius:999px;
        background:radial-gradient(ellipse at center, rgba(15,23,42,${shadowOpacity}) 0%, rgba(15,23,42,.11) 42%, rgba(15,23,42,0) 72%);
        filter:blur(2px);
        pointer-events:none;
      "></span>
      <span style="
        position:absolute;
        top:4px;
        left:50%;
        width:42px;
        height:42px;
        transform:translateX(-50%);
        border-radius:999px;
        background:radial-gradient(circle, rgba(37,99,235,${haloOpacity}) 0%, rgba(37,99,235,.14) 42%, rgba(37,99,235,0) 72%);
        opacity:${selected ? "1" : "0"};
        transition:opacity .18s ease;
        pointer-events:none;
      "></span>
      <img
        class="piumteo-place-marker-image"
        src="${MARKER_IMAGES[placeType]}"
        alt=""
        style="
          width:50px;
          height:54px;
          object-fit:contain;
          display:block;
          background:transparent;
          position:relative;
          z-index:1;
          transform-origin:50% 90%;
          transition:transform .2s cubic-bezier(.2,.8,.2,1), filter .2s ease;
          filter:drop-shadow(0 8px 7px rgba(15,23,42,.22)) drop-shadow(0 2px 2px rgba(15,23,42,.16));
        "
      />
    </div>
  `;
}

function positionMarkerContent(kind: "current" | "fallback") {
  const label = kind === "current" ? "내 위치" : "기준 위치";
  const color = kind === "current" ? "#2563EB" : "#64748B";
  const ring = kind === "current" ? "rgba(37,99,235,.18)" : "rgba(100,116,139,.16)";

  return `
    <style>
      @keyframes piumteo-position-pulse {
        0% { transform: scale(.82); opacity:.7; }
        70% { transform: scale(1.45); opacity:.08; }
        100% { transform: scale(1.55); opacity:0; }
      }
    </style>
    <div style="
      position:relative;
      width:62px;
      height:46px;
      display:flex;
      align-items:center;
      justify-content:center;
      background:transparent;
      pointer-events:none;
    ">
      <span style="
        position:absolute;
        width:38px;
        height:38px;
        border-radius:999px;
        background:${ring};
        box-shadow:0 0 0 10px ${ring};
        animation:${kind === "current" ? "piumteo-position-pulse 1.9s ease-out infinite" : "none"};
      "></span>
      <span style="
        position:relative;
        width:20px;
        height:20px;
        border-radius:999px;
        background:${color};
        border:4px solid #fff;
        box-shadow:0 8px 18px rgba(15,23,42,.28),0 0 0 1px rgba(15,23,42,.08),0 0 0 6px rgba(255,255,255,.52);
      "></span>
      <span style="
        position:absolute;
        top:36px;
        left:50%;
        transform:translateX(-50%);
        white-space:nowrap;
        padding:3px 7px;
        border-radius:999px;
        background:rgba(255,255,255,.94);
        color:${color};
        font-size:10px;
        font-weight:800;
        box-shadow:0 6px 14px rgba(15,23,42,.16);
      ">${label}</span>
    </div>
  `;
}

export function NaverMapCanvas({
  center,
  places,
  currentPosition,
  currentPositionKind = "current",
  selectedPlaceId,
  onReady,
  onMapChanged,
  onMarkerClick,
  onError,
}: {
  center: MapLatLng;
  places: PlaceMarkerResponse[];
  currentPosition: MapLatLng | null;
  currentPositionKind?: "current" | "fallback";
  selectedPlaceId?: number | null;
  onReady(map: any): void;
  onMapChanged(): void;
  onMarkerClick(placeId: number): void;
  onError(error: Error): void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const currentMarkerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      try {
        await loadNaverMapScript();
        if (cancelled || !containerRef.current || mapRef.current) return;

        const map = new naver.maps.Map(containerRef.current, {
          center: new naver.maps.LatLng(center.lat, center.lng),
          zoom: 17,
          minZoom: 13,
          scaleControl: false,
          mapDataControl: false,
          logoControlOptions: {
            position: naver.maps.Position.BOTTOM_LEFT,
          },
        });

        mapRef.current = map;
        onReady(map);

        naver.maps.Event.addListener(map, "dragend", onMapChanged);
        naver.maps.Event.addListener(map, "zoom_changed", onMapChanged);
      } catch (error) {
        onError(error instanceof Error ? error : new Error("네이버 지도를 불러오지 못했습니다."));
      }
    }

    initMap();

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.setMap(null));
      currentMarkerRef.current?.setMap(null);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.panTo(new naver.maps.LatLng(center.lat, center.lng));
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = places.map((place) => {
      const selected = selectedPlaceId === place.placeId;
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(place.latitude, place.longitude),
        map: mapRef.current,
        title: place.placeName,
        zIndex: selected ? 200 : 100,
        icon: {
          content: markerIconContent(place.placeType, selected),
          size: new naver.maps.Size(50, 58),
          anchor: new naver.maps.Point(25, 52),
        },
      });

      naver.maps.Event.addListener(marker, "click", () => onMarkerClick(place.placeId));
      return marker;
    });
  }, [places, onMarkerClick, selectedPlaceId]);

  useEffect(() => {
    if (!mapRef.current) return;

    currentMarkerRef.current?.setMap(null);
    currentMarkerRef.current = null;

    if (!currentPosition) return;

    currentMarkerRef.current = new naver.maps.Marker({
      position: new naver.maps.LatLng(currentPosition.lat, currentPosition.lng),
      map: mapRef.current,
      title: currentPositionKind === "current" ? "내 위치" : "기준 위치",
      zIndex: 300,
      icon: {
        content: positionMarkerContent(currentPositionKind),
        size: new naver.maps.Size(62, 46),
        anchor: new naver.maps.Point(31, 23),
      },
    });
  }, [currentPosition?.lat, currentPosition?.lng, currentPositionKind]);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full bg-[#E4EBF3]" />;
}
