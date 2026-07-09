export type PlaceType = "SMOKING_BOOTH" | "SMOKING_AREA" | "IMPLICIT_SMOKING_AREA" | "NON_SMOKING_AREA";

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  latitude: number;
  longitude: number;
  description: string;
  distance: string;
  likes: number;
  dislikes: number;
  commentCount: number;
  latitude: number;
  longitude: number;
  x: number;
  y: number;
  ownedByMe?: boolean;
}
