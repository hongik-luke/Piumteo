export type LocationConsent = "prompt" | "granted" | "denied";

export interface LastMapView {
  center: {
    lat: number;
    lng: number;
  };
  savedAt: number;
}
