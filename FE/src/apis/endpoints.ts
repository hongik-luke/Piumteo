type QueryValue = boolean | number | string | null | undefined;

export function withQuery(path: string, params: Record<string, QueryValue>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

export const API_ENDPOINTS = {
  auth: {
    signup: "/api/auth/signup",
    login: "/api/auth/login",
    checkEmail: (email: string) => withQuery("/api/auth/check-email", { email }),
    checkNickname: (nickname: string) => withQuery("/api/auth/check-nickname", { nickname }),
  },
  places: {
    create: "/api/places",
    delete: (placeId: number) => `/api/places/${placeId}`,
    nearby: (lat: number, lng: number) => withQuery("/api/places/nearby", { lat, lng }),
    bounds: (minLat: number, minLng: number, maxLat: number, maxLng: number) =>
      withQuery("/api/places/bounds", { minLat, minLng, maxLat, maxLng }),
    summary: (placeId: number) => `/api/places/${placeId}/summary`,
  },
  comments: {
    list: (placeId: number, cursorId?: number, size?: number) =>
      withQuery(`/api/places/${placeId}/comments`, { cursorId, size }),
    createMember: (placeId: number) => `/api/places/${placeId}/comments/member`,
    createGuest: (placeId: number) => `/api/places/${placeId}/comments/guest`,
    updateMember: (placeId: number, commentId: number) => `/api/places/${placeId}/comments/member/${commentId}`,
    updateGuest: (placeId: number, commentId: number) => `/api/places/${placeId}/comments/guest/${commentId}`,
    deleteMember: (placeId: number, commentId: number) => `/api/places/${placeId}/comments/member/${commentId}`,
    deleteGuest: (placeId: number, commentId: number) => `/api/places/${placeId}/comments/guest/${commentId}`,
  },
  reactions: {
    member: (placeId: number) => `/api/places/${placeId}/reaction/member`,
    guest: (placeId: number) => `/api/places/${placeId}/reaction/guest`,
  },
} as const;
