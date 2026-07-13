const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
);
export const NAVER_MAP_CLIENT_ID =
  import.meta.env.VITE_NAVER_MAP_CLIENT_ID || '';
export const NAVER_MAP_APPLICATION_NAME =
  import.meta.env.VITE_NAVER_MAP_APPLICATION_NAME || 'piumteo.site';
