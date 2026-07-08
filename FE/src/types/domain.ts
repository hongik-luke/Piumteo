export type Screen = "map" | "login" | "signup" | "register";
export type PlaceType = "SMOKING_BOOTH" | "SMOKING_AREA" | "IMPLICIT_SMOKING_AREA" | "NON_SMOKING_AREA";
export type Reaction = "like" | "dislike" | null;
export type ToastType = "success" | "error" | "warning" | "info";
export type SheetState = "peek" | "full";
export type LocationConsent = "prompt" | "granted" | "denied";

export interface AuthSession {
  userId: number;
  email: string;
  nickname: string;
  role: "MEMBER" | "ADMIN";
  accessToken: string | null;
}

export interface LastMapView {
  center: {
    lat: number;
    lng: number;
  };
  savedAt: number;
}

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  description: string;
  distance: string;
  likes: number;
  dislikes: number;
  commentCount: number;
  x: number;
  y: number;
  ownedByMe?: boolean;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  time: string;
  isMine: boolean;
  isGuest: boolean;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}
