# Piumteo MVP Decisions

이 문서는 현재 코드 기준의 MVP 정책을 정리한 기준 문서다. 오래된 기획 문서나 추출 문서와 충돌할 경우 이 문서와 현재 코드를 우선한다.

## 현재 MVP 정책

- FE는 Vercel에서 `https://piumteo.site`, `https://www.piumteo.site`로 제공한다.
- BE는 AWS ECS Fargate에서 `https://api.piumteo.site`로 제공한다.
- DB는 RDS PostgreSQL + PostGIS를 사용한다.
- Refresh Token은 사용하지 않는다.
- 지도 마커 조회, 병합, 렌더링 정책은 현재 구현을 유지한다.

## 인증 방식

- 인증은 JWT Access Token 하나만 사용한다.
- 로그인 성공 시 Access Token은 응답 body가 아니라 `accessToken` HttpOnly Cookie로 발급한다.
- FE JavaScript는 Access Token 값을 읽거나 저장하지 않는다.
- 인증 API 요청은 Cookie를 자동 포함하도록 `credentials: "include"`를 사용한다.
- 페이지 새로고침 후 로그인 상태는 `GET /api/auth/me`로 복원한다.
- 로그아웃은 `POST /api/auth/logout`으로 Cookie를 만료시킨다.
- Cookie는 `HttpOnly`, `Path=/`, `SameSite=Lax`를 사용한다.
- 운영 profile에서는 Cookie `Secure=true`, local profile에서는 HTTP 개발을 위해 `Secure=false`를 사용한다.
- 특별한 이유가 생기기 전까지 Cookie `Domain`은 설정하지 않고 `api.piumteo.site` host-only Cookie로 둔다.

## CORS와 CSRF

- 운영 CORS 허용 origin은 `https://piumteo.site`, `https://www.piumteo.site`이다.
- local 개발 origin은 `http://localhost:5173`을 허용한다.
- Cookie 인증을 위해 CORS `allowCredentials=true`를 사용한다.
- `"*"` origin과 credentials 허용을 같이 사용하지 않는다.
- Spring Security CSRF 토큰 저장소는 사용하지 않는다.
- 현재 JSON API 구조에서는 `SameSite=Lax`, 명시 origin CORS, unsafe method Origin 검증으로 CSRF 위험을 줄인다.
- Origin 헤더가 있는 `POST`, `PUT`, `PATCH`, `DELETE` 요청은 허용 origin과 일치해야 한다.

## 장소 정책

- `GET /api/places/nearby`는 현재 위치 기준 1km 반경, 최대 100개, 거리순으로 조회한다.
- `GET /api/places/bounds`는 현재 지도 화면 bounds 기준, 최대 100개, 최신 등록순으로 조회한다.
- 장소 등록은 로그인 회원만 가능하다.
- 장소 삭제는 등록자 본인만 가능하다.
- 장소 삭제는 장소, 해당 장소의 댓글, 해당 장소의 반응을 모두 hard delete한다.

## 댓글 정책

- 댓글 목록은 cursor 기반으로 조회한다.
- 회원 댓글과 비회원 댓글은 API 경로를 분리한다.
- 회원 댓글은 HttpOnly accessToken Cookie 인증을 사용한다.
- 비회원 댓글은 작성 시 입력한 `guestPassword`로 수정과 삭제 권한을 검증한다.
- 개별 댓글 삭제는 soft delete다.
- 댓글 수정 API는 회원과 비회원 모두 제공한다.

## 반응 처리 정책

- 반응은 `LIKE`, `DISLIKE`, `CANCELED`만 사용한다.
- 회원 반응은 HttpOnly accessToken Cookie 인증을 사용한다.
- 비회원 반응은 `X-Guest-Key` 헤더를 사용한다.
- 서버는 `X-Guest-Key` 원문을 저장하지 않고 SHA-256 해시만 저장한다.
- 같은 시간대에 같은 반응을 다시 보내면 `CANCELED`로 변경한다.
- 같은 시간대에 다른 반응을 보내면 요청한 반응으로 변경한다.
- `CANCELED`는 좋아요/싫어요 집계에서 제외한다.
- 다음 시간대에는 같은 사용자도 새 반응 row를 만들 수 있다.

## Swagger와 운영 환경

- local profile에서는 Swagger UI와 OpenAPI 문서를 사용할 수 있다.
- prod profile에서는 `springdoc.api-docs.enabled=false`, `springdoc.swagger-ui.enabled=false`로 Swagger UI와 OpenAPI 문서를 생성하지 않는다.
- 운영에서 외부 노출이 필요한 Actuator endpoint는 `health`만 허용한다.

## 확인 필요

- 운영 배포 후 `Set-Cookie`의 `Secure`, `SameSite=Lax`, host-only 동작을 실제 브라우저에서 확인한다.
- 운영 ALB/ECS health check가 `/actuator/health`를 계속 사용하고 있는지 확인한다.
- Naver Maps SDK가 실제로 사용하는 도메인을 네트워크 패널에서 확인한 뒤 CSP 후보를 조정한다.
