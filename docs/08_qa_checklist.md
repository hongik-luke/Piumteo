# QA 체크리스트

## 공통

- Swagger UI에서 모든 endpoint가 표시되는지 확인
- 인증 필요 API에 토큰 없이 요청하면 401인지 확인
- 잘못된 또는 만료된 accessToken Cookie가 있으면 비회원 처리하지 않고 401인지 확인
- validation 실패 시 400 응답인지 확인
- 존재하지 않는 리소스 조회 시 404 응답인지 확인

## Auth

- `AUTH-001` 회원가입 성공
- `AUTH-002` 이메일 형식 오류로 회원가입 실패
- `AUTH-003` 중복 이메일 회원가입 실패
- `AUTH-004` 중복 닉네임 회원가입 실패
- `AUTH-005` 로그인 성공 후 HttpOnly accessToken Cookie 발급
- `AUTH-006` 잘못된 비밀번호 로그인 실패
- `AUTH-007` 이메일 중복 확인 성공
- `AUTH-008` 닉네임 중복 확인 성공
- `AUTH-009` 로그아웃은 서버 API에서 accessToken Cookie를 만료시키는지 확인

## Place Marker

- `MAP-001` nearby 성공: `lat`, `lng` 기준 1km 내 장소 조회
- `MAP-002` nearby 응답이 최대 100개인지 확인
- `MAP-003` nearby 응답이 거리 가까운 순인지 확인
- `MAP-004` nearby가 `radius` 없이 동작하는지 확인
- `MAP-005` nearby 위도 범위 오류 실패
- `MAP-006` nearby 경도 범위 오류 실패
- `MAP-007` bounds 성공: `minLat`, `minLng`, `maxLat`, `maxLng` 기준 장소 조회
- `MAP-008` bounds 응답이 최대 100개인지 확인
- `MAP-009` bounds 응답이 최신 등록순인지 확인
- `MAP-010` bounds `minLat > maxLat` 실패
- `MAP-011` bounds `minLng > maxLng` 실패
- `MAP-012` nearby/bounds 응답이 마커용 필드만 포함하는지 확인
- `MAP-013` 삭제된 장소가 nearby/bounds에서 제외되는지 확인

## Place Summary

- `PLACE-001` 장소 상세 요약 조회 성공
- `PLACE-002` summary 조회 성공 시 viewCount 1 증가
- `PLACE-003` 회원 조회 시 isOwner 계산 확인
- `PLACE-004` 비회원 조회 시 isOwner false 확인
- `PLACE-005` 회원 조회 시 myReactionType 계산 확인
- `PLACE-006` 비회원 X-Guest-Key 조회 시 myReactionType 계산 확인
- `PLACE-007` 존재하지 않는 장소 summary 실패

## Place Mutation

- `PLACE-101` 회원 장소 등록 성공
- `PLACE-102` 비회원 장소 등록 실패
- `PLACE-103` 잘못된 좌표로 장소 등록 실패
- `PLACE-104` 잘못된 placeType으로 장소 등록 실패
- `PLACE-105` 등록자 장소 삭제 성공
- `PLACE-106` 비회원 장소 삭제 실패
- `PLACE-107` 타인이 등록한 장소 삭제 실패
- `PLACE-108` 장소 삭제 시 장소 hard delete 확인
- `PLACE-109` 장소 삭제 시 해당 댓글 hard delete 확인
- `PLACE-110` 장소 삭제 시 해당 반응 hard delete 확인
- `PLACE-111` hard delete 이후 같은 장소 재삭제 시 404 확인

## Comment

- `COMMENT-001` 댓글 목록 조회 성공
- `COMMENT-002` cursor 없이 첫 페이지 조회 성공
- `COMMENT-003` cursor 기반 다음 페이지 조회 성공
- `COMMENT-004` 회원 댓글 작성 성공
- `COMMENT-005` 비회원 댓글 작성 성공
- `COMMENT-006` 회원 댓글 수정 성공
- `COMMENT-007` 타 회원 댓글 수정 실패
- `COMMENT-008` 비회원 댓글 수정 성공
- `COMMENT-009` 비회원 댓글 비밀번호 불일치 수정 실패
- `COMMENT-010` 회원 댓글 삭제 성공
- `COMMENT-011` 타 회원 댓글 삭제 실패
- `COMMENT-012` 비회원 댓글 삭제 성공
- `COMMENT-013` 비회원 댓글 비밀번호 불일치 삭제 실패
- `COMMENT-014` 개별 댓글 삭제 후 목록에서 제외 확인

## Reaction

- `REACTION-001` 회원 좋아요 성공
- `REACTION-002` 회원 싫어요 성공
- `REACTION-003` 회원 같은 반응 재요청 시 CANCELED 변경
- `REACTION-004` 회원 LIKE에서 DISLIKE 변경
- `REACTION-005` 회원 DISLIKE에서 LIKE 변경
- `REACTION-006` 비회원 좋아요 성공
- `REACTION-007` 비회원 싫어요 성공
- `REACTION-008` 비회원 같은 반응 재요청 시 CANCELED 변경
- `REACTION-009` 비회원 X-Guest-Key 누락 실패
- `REACTION-010` guestKey 원문이 DB에 저장되지 않는지 확인
- `REACTION-011` CANCELED가 likeCount에서 제외되는지 확인
- `REACTION-012` CANCELED가 dislikeCount에서 제외되는지 확인
- `REACTION-013` 같은 시간대에는 기존 row를 update하는지 확인
- `REACTION-014` 다음 시간대에는 새 row 생성 가능 여부 확인
- `REACTION-015` 존재하지 않는 장소에 반응 실패
- `REACTION-016` 삭제된 장소에 반응 실패

## DB / 운영 전제

- PostgreSQL에 PostGIS extension이 활성화되어 있는지 확인
- `place_reactions` 회원/비회원 시간대 unique index 확인
- 장소 삭제 hard delete 후 FK 제약 오류가 없는지 확인
