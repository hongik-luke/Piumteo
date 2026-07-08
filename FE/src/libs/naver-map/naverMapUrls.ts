import { NAVER_MAP_APPLICATION_NAME } from "@/config";

interface NaverWalkRouteParams {
  destinationLat: number;
  destinationLng: number;
  destinationName: string;
}

export function buildNaverWalkRouteUrl({
  destinationLat,
  destinationLng,
  destinationName,
}: NaverWalkRouteParams) {
  const params = new URLSearchParams({
    dlat: String(destinationLat),
    dlng: String(destinationLng),
    dname: destinationName,
    appname: NAVER_MAP_APPLICATION_NAME,
  });

  return `nmap://route/walk?${params.toString()}`;
}
