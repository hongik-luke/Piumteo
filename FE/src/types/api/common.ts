export type Id = number;
export type Decimal = number;
export type DateTimeString = string;

export interface ApiResponse<T> {
  status: number;
  code: string;
  message: string;
  result: T;
}

export type ApiVoidResponse = ApiResponse<null>;

export interface ErrorResponse {
  status: number;
  code: string;
  message: string;
  result: unknown | null;
}

export interface PathPlaceIdRequest {
  placeId: Id;
}

export interface PathCommentIdRequest extends PathPlaceIdRequest {
  commentId: Id;
}

export interface GuestKeyHeader {
  "X-Guest-Key": string;
}

export interface OptionalGuestKeyHeader {
  "X-Guest-Key"?: string;
}
