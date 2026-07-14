# 프로젝트 메모

## 서비스 개요

피움터는 지도 기반으로 흡연 가능 장소, 암묵적 흡연 구역, 금연 구역 정보를 제공하는 서비스다. 사용자는 지도에서 마커를 보고, 장소 요약 바텀시트에서 좋아요/싫어요, 댓글, 조회수 등을 확인한다.

## 현재 백엔드 기준

- Spring Boot 3 기반 REST API 서버다.
- 인증은 JWT Access Token 기반 stateless 구조다.
- 서버는 로그인 세션을 저장하지 않는다.
- 로그아웃은 `POST /api/auth/logout`에서 HttpOnly accessToken Cookie를 만료시킨다.
- Swagger/OpenAPI 문서를 사용한다.
- PostgreSQL과 PostGIS를 사용한다.

## 주요 확정 결정

- 회원가입 경로는 `/api/auth/signup`이다.
- 로그인 경로는 `/api/auth/login`이다.
- 댓글 API는 회원/비회원 경로를 분리한다.
- 반응 API도 회원/비회원 경로를 분리한다.
- 비회원 반응 식별자는 프론트엔드가 생성한 `X-Guest-Key`다.
- 서버는 `X-Guest-Key` 원문을 저장하지 않고 SHA-256 해시만 저장한다.
- 반응 값은 `LIKE`, `DISLIKE`, `CANCELED`만 사용한다.
- 같은 시간대의 반응은 기존 row를 수정하고, 다음 시간대에는 새 row를 만들 수 있다.
- 장소 삭제는 장소, 해당 장소의 댓글, 해당 장소의 반응을 모두 hard delete한다.
- 개별 댓글 삭제는 soft delete다.

## 지도 조회 결정

- 앱 첫 진입 또는 내 위치 버튼: `GET /api/places/nearby`
- 지도 이동/줌 후 idle 이벤트: `GET /api/places/bounds`
- 마커 클릭 또는 바텀시트 열기: `GET /api/places/{placeId}/summary`
- nearby는 현재 위치 기준 1km, 최대 100개, 거리순이다.
- bounds는 현재 지도 화면 영역 기준, 최대 100개, 최신 등록순이다.
