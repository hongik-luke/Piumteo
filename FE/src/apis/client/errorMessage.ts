import { ApiError } from "@/apis/client/ApiError";

const ERROR_MESSAGE_BY_CODE: Record<string, string> = {
  UNAUTHORIZED: "로그인이 필요합니다.",
  INVALID_ACCESS_TOKEN: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
  EXPIRED_ACCESS_TOKEN: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
  ACCESS_DENIED: "요청 권한이 없습니다.",
  INVALID_REQUEST: "요청 형식이 올바르지 않습니다.",
  INVALID_INPUT_VALUE: "입력값을 다시 확인해 주세요.",
  METHOD_NOT_ALLOWED: "지원하지 않는 요청입니다.",
  INTERNAL_SERVER_ERROR: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  USER_NOT_FOUND: "계정을 찾을 수 없습니다.",
  DUPLICATE_EMAIL: "이미 사용 중인 이메일입니다.",
  DUPLICATE_NICKNAME: "이미 사용 중인 닉네임입니다.",
  WITHDRAWN_USER: "탈퇴한 계정입니다.",
  BANNED_USER: "이용이 제한된 계정입니다.",
  PLACE_NOT_FOUND: "장소를 찾을 수 없습니다.",
  INVALID_PLACE_TYPE: "장소 유형을 다시 확인해 주세요.",
  INVALID_PLACE_COORDINATE: "장소 좌표를 다시 확인해 주세요.",
  INVALID_BOUNDS: "지도 검색 범위를 다시 확인해 주세요.",
  UNAUTHORIZED_PLACE_DELETE: "본인이 등록한 장소만 삭제할 수 있습니다.",
  PLACE_ALREADY_DELETED: "이미 삭제된 장소입니다.",
  COMMENT_NOT_FOUND: "댓글을 찾을 수 없습니다.",
  COMMENT_UPDATE_FORBIDDEN: "댓글을 수정할 권한이 없습니다.",
  COMMENT_DELETE_FORBIDDEN: "댓글을 삭제할 권한이 없습니다.",
  COMMENT_PASSWORD_MISMATCH: "비밀번호가 일치하지 않습니다.",
  INVALID_COMMENT_AUTHOR_TYPE: "댓글 작성자 유형이 올바르지 않습니다.",
  INVALID_REACTION_TYPE: "반응 유형을 다시 확인해 주세요.",
  REACTION_TOO_FAST: "잠시 후 다시 반응할 수 있습니다.",
  REACTION_NOT_FOUND: "반응 정보를 찾을 수 없습니다.",
  INVALID_REACTION_AUTHOR_TYPE: "반응 작성자 유형이 올바르지 않습니다.",
  GUEST_KEY_REQUIRED: "비회원 반응에는 게스트 키가 필요합니다.",
};

export function isAuthExpiredError(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.status === 401 || error.code === "INVALID_ACCESS_TOKEN" || error.code === "EXPIRED_ACCESS_TOKEN")
  );
}

export function getApiErrorMessage(error: unknown, fallback = "요청을 처리하지 못했습니다.") {
  if (!(error instanceof ApiError)) return fallback;
  if (error.code && ERROR_MESSAGE_BY_CODE[error.code]) return ERROR_MESSAGE_BY_CODE[error.code];
  return error.message || fallback;
}
