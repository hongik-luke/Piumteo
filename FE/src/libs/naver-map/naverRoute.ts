import { NAVER_MAP_APPLICATION_NAME } from "@/config";

interface OpenWalkRouteParams {
  dlat: number;
  dlng: number;
  dname: string;
  slat?: number;
  slng?: number;
  sname?: string;
}

type NaverRouteDebugWindow = Window & {
  __PIUMTEO_LAST_NAVER_ROUTE_URL__?: string;
};

export function buildNaverWalkRouteUrl(params: OpenWalkRouteParams) {
  const search = new URLSearchParams({
    dlat: String(params.dlat),
    dlng: String(params.dlng),
    dname: params.dname,
    appname: NAVER_MAP_APPLICATION_NAME,
  });

  if (params.slat != null && params.slng != null) {
    search.set("slat", String(params.slat));
    search.set("slng", String(params.slng));
    search.set("sname", params.sname ?? "현재 위치");
  }

  return `nmap://route/walk?${search.toString()}`;
}

export function openNaverWalkRoute(params: OpenWalkRouteParams) {
  const routeUrl = buildNaverWalkRouteUrl(params);

  if (import.meta.env.DEV) {
    (window as NaverRouteDebugWindow).__PIUMTEO_LAST_NAVER_ROUTE_URL__ = routeUrl;
    console.info("[Piumteo] Naver walk route URL", routeUrl, params);
  }

  window.location.href = routeUrl;
}
