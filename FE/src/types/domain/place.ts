export type PlaceType = "SMOKING_BOOTH" | "SMOKING_AREA" | "IMPLICIT_SMOKING_AREA" | "NON_SMOKING_AREA";

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
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
