import type { LastMapView, LocationConsent } from "@/types/domain";
import { readStorageValue, removeStorageValue, writeStorageValue } from "./storage";

const STORAGE_KEYS = {
  authSession: "piumteo.auth.v1",
  guestKey: "piumteo.guestKey.v1",
  locationConsent: "piumteo.locationConsent.v1",
  lastMapView: "piumteo.lastMapView.v1",
} as const;

function createUuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function clearAuthSession() {
  removeStorageValue(STORAGE_KEYS.authSession);
}

export function getStoredGuestKey() {
  return readStorageValue<string | null>(STORAGE_KEYS.guestKey, null);
}

export function getOrCreateGuestKey() {
  const stored = getStoredGuestKey();
  if (stored) return stored;

  const next = createUuid();
  writeStorageValue(STORAGE_KEYS.guestKey, next);
  return next;
}

export function getStoredLocationConsent() {
  return readStorageValue<LocationConsent>(STORAGE_KEYS.locationConsent, "prompt");
}

export function saveLocationConsent(consent: LocationConsent) {
  writeStorageValue(STORAGE_KEYS.locationConsent, consent);
}

export function getStoredLastMapView() {
  return readStorageValue<LastMapView | null>(STORAGE_KEYS.lastMapView, null);
}

export function saveLastMapView(view: LastMapView) {
  writeStorageValue(STORAGE_KEYS.lastMapView, view);
}
