# Architecture

## 기술 스택

- Java 17
- Spring Boot 3
- Spring Web
- Spring Security
- Spring Data JPA
- PostgreSQL
- PostGIS
- springdoc-openapi Swagger UI
- JWT

## 패키지 구조

```text
com.piumteo.server
  domain
    auth
    user
    place
    comment
    reaction
  global
    exception
    response
    security
    util
```

## 계층 책임

| 계층 | 책임 |
| --- | --- |
| Controller | HTTP 요청/응답, validation, Swagger 설명 |
| Service | 비즈니스 정책, 권한 검증, 트랜잭션 |
| Repository | JPA 및 native query |
| Entity | 도메인 상태와 최소 행위 |
| DTO | API 요청/응답 구조 |
| global.security | JWT 검증, SecurityContext 구성, 인증/인가 정책 |

## 인증 구조

- 로그인 성공 시 JWT Access Token을 발급한다.
- 이후 회원 API는 `Authorization: Bearer {accessToken}`을 사용한다.
- 서버는 세션을 저장하지 않는다.
- 로그아웃은 프론트엔드 accessToken 삭제로 처리한다.
- 잘못된 Bearer token은 401로 처리한다.

## 장소 조회 구조

- `GET /api/places/nearby`
  - 현재 위치 기준 1km
  - 최대 100개
  - 거리 가까운 순
  - PostGIS 거리 검색
- `GET /api/places/bounds`
  - 현재 지도 화면 bounds 기준
  - 최대 100개
  - 최신 등록순
  - PostGIS 영역 검색
- `GET /api/places/{placeId}/summary`
  - 바텀시트용 상세 요약
  - 조회 성공 시 view count 증가

## 댓글 구조

- Controller endpoint는 회원/비회원으로 분리한다.
- Service는 작성자 타입에 따라 권한을 검증한다.
- 회원 댓글은 JWT 사용자 ID로 작성자 여부를 판단한다.
- 비회원 댓글은 비밀번호 검증으로 수정/삭제 권한을 판단한다.
- 개별 댓글 삭제는 soft delete다.

## 반응 구조

- Controller endpoint는 회원/비회원으로 분리한다.
- Service는 회원/비회원 처리 메서드를 분리하되 내부 반응 적용 규칙은 공통화한다.
- 회원은 `member_user_id`로 식별한다.
- 비회원은 `X-Guest-Key`를 SHA-256 해시한 `guest_key_hash`로 식별한다.
- 같은 시간대 row가 있으면 새 row를 만들지 않고 `reaction_type`을 갱신한다.
- 다음 시간대에는 새 row를 생성할 수 있다.

## 삭제 구조

- 장소 삭제는 Service에서 명시적으로 cascade 처리한다.
- 순서:
  1. 해당 장소 댓글 hard delete
  2. 해당 장소 반응 hard delete
  3. 장소 hard delete
- 개별 댓글 삭제는 해당 댓글만 soft delete한다.

## 응답 구조

성공 응답은 `ApiResponse<T>`를 사용한다.

```json
{
  "status": 200,
  "code": "PLACE_200_003",
  "message": "장소 마커 조회에 성공했습니다.",
  "result": []
}
```

실패 응답은 공통 ErrorResponse 형식을 사용한다.
