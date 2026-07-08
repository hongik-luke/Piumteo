import { NAVER_MAP_CLIENT_ID } from "@/config";

let naverMapPromise: Promise<void> | null = null;

export function loadNaverMapScript() {
  if (window.naver?.maps) {
    return Promise.resolve();
  }

  if (naverMapPromise) {
    return naverMapPromise;
  }

  if (!NAVER_MAP_CLIENT_ID) {
    return Promise.reject(new Error("Naver Map Client ID is missing."));
  }

  naverMapPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_CLIENT_ID}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Naver Map SDK load failed."));
    document.head.appendChild(script);
  });

  return naverMapPromise;
}
