# 결정사항과 남은 확인사항

> 현재 기준 문서는 `DECISIONS.md`다. 이 문서는 과거 결정과 남은 확인사항을 함께 담은 historical 문서이며, 충돌 시 `DECISIONS.md`와 현재 코드를 우선한다.

## 확정 결정

### Auth

- 인증은 JWT Access Token 기반 stateless 방식이다.
- 회원가입 API 경로는 `/api/auth/signup`이다.
- 로그인 API 경로는 `/api/auth/login`이다.
- 로그인 성공 시 Access Token은 HttpOnly Cookie로 발급한다.
- 현재 사용자 조회 API 경로는 `/api/auth/me`이다.
- 로그아웃 API 경로는 `/api/auth/logout`이며 accessToken Cookie를 만료시킨다.
- 잘못된 또는 만료된 accessToken Cookie는 인증 요청에서 401로 응답한다.

### Place

- 장소 등록 요청/응답 필드는 `placeName`, `placeType`을 사용한다.
- 장소 등록은 지도 중앙 고정 핀 좌표를 사용한다.
- `GET /api/places/nearby`는 현재 내 위치 기준 1km 반경을 조회한다.
- nearby는 `lat`, `lng`만 받고 `radius`는 받지 않는다.
- nearby는 최대 100개를 거리 가까운 순으로 응답한다.
- `GET /api/places/bounds`는 현재 지도 화면 bounds 안의 장소를 조회한다.
- bounds query 이름은 `minLat`, `minLng`, `maxLat`, `maxLng`다.
- bounds는 최대 100개를 최신 등록순으로 응답한다.
- nearby/bounds 응답은 마커용 기본 정보만 포함한다.
- 마커 클릭 시 `GET /api/places/{placeId}/summary`를 호출한다.
- summary 조회 성공 시 `viewCount`를 1 증가시킨다.
- 장소 삭제는 등록자 본인만 가능하다.
- 장소 삭제 시 장소, 해당 장소의 댓글, 해당 장소의 반응을 모두 hard delete한다.

### Comment

- 댓글 수정 API는 포함한다.
- 댓글 API는 회원/비회원 경로를 분리한다.
- 회원 댓글은 `/comments/member` 경로와 HttpOnly Cookie 인증을 사용한다.
- 비회원 댓글은 `/comments/guest` 경로와 `guestPassword`를 사용한다.
- 개별 댓글 삭제는 soft delete다.

### Reaction

- 반응 API는 회원/비회원 경로를 분리한다.
- 회원 반응은 `/reaction/member` 경로와 HttpOnly Cookie 인증을 사용한다.
- 비회원 반응은 `/reaction/guest` 경로와 `X-Guest-Key`를 사용한다.
- `X-Guest-Key`는 프론트엔드가 생성하고 서버는 SHA-256 해시만 저장한다.
- 반응 상태는 `LIKE`, `DISLIKE`, `CANCELED`만 사용한다.
- `NONE`은 사용하지 않는다.
- `myReactionType`은 현재 시간대 내 사용자의 반응 상태다.
- `reactionHourKey`는 현재 시간대 row를 찾기 위한 key다.
- 같은 시간대에 반응 변경/취소는 허용한다.
- 같은 시간대에 새 row 중복 생성은 허용하지 않는다.
- 다음 시간대에는 새 row 생성이 가능하다.
- `CANCELED`는 좋아요/싫어요 집계에서 제외한다.

## 현재 구현된 API 수

현재 합의 기준 구현 API는 18개다.

- Auth: 6개
- Place: 5개
- Comment: 7개
- Reaction: 2개

## 남은 확인사항

- Swagger 화면에서 설명 깨짐이 남아 있는지 확인한다.
- 실제 DB에서 PostGIS extension 활성화 여부를 확인한다.
- nearby/bounds native query가 운영 DB에서 정상 실행되는지 Swagger로 확인한다.
- 장소 삭제 hard delete 시 FK 제약 오류가 없는지 실제 DB로 확인한다.
- 기존 DB row의 `places.location` 컬럼을 계속 유지할지, 추후 엔티티 매핑할지 결정한다.

## 후순위 후보

- refresh token 도입
- 서버 측 로그아웃/토큰 블랙리스트
- 장소 수정 API
- 신고/관리자 API
- 마커 클러스터링
- 검색어 기반 장소 검색
