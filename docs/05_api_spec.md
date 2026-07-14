# API 명세서

## 공통 기준

- Base path는 `/api`다.
- 응답 wrapper는 `ApiResponse<T>` 형식을 사용한다.
- 회원 인증은 `accessToken` HttpOnly Cookie를 사용한다.
- 서버는 JWT 기반 stateless 인증을 사용한다.
- 로그인 성공 시 Access Token은 응답 body가 아니라 `Set-Cookie`로 전달된다.
- 로그아웃은 `POST /api/auth/logout`에서 `accessToken` Cookie를 만료시키는 방식으로 처리한다.
- 비회원 반응은 `X-Guest-Key` 헤더를 사용한다.
- 잘못된 또는 만료된 accessToken Cookie가 인증 API에 사용되면 401로 응답한다.

## Endpoint 목록

| 기능 | Method | URL | 권한 | 요청 |
| --- | --- | --- | --- | --- |
| 회원가입 | `POST` | `/api/auth/signup` | 비회원 | Body: `email`, `password`, `nickname` |
| 로그인 | `POST` | `/api/auth/login` | 비회원 | Body: `email`, `password` |
| 현재 사용자 조회 | `GET` | `/api/auth/me` | 회원 | Cookie: `accessToken` |
| 로그아웃 | `POST` | `/api/auth/logout` | 전체 | Cookie 만료 |
| 이메일 중복 확인 | `GET` | `/api/auth/check-email` | 비회원 | Query: `email` |
| 닉네임 중복 확인 | `GET` | `/api/auth/check-nickname` | 비회원 | Query: `nickname` |
| 현재 위치 기준 주변 장소 조회 | `GET` | `/api/places/nearby` | 전체 | Query: `lat`, `lng` |
| 지도 bounds 기준 장소 조회 | `GET` | `/api/places/bounds` | 전체 | Query: `minLat`, `minLng`, `maxLat`, `maxLng` |
| 장소 상세 요약 조회 | `GET` | `/api/places/{placeId}/summary` | 전체 | Path: `placeId`, optional Cookie, optional `X-Guest-Key` |
| 장소 등록 | `POST` | `/api/places` | 회원 | Body: `placeName`, `placeType`, `latitude`, `longitude`, `locationDescription` |
| 장소 삭제 | `DELETE` | `/api/places/{placeId}` | 회원 | Path: `placeId` |
| 댓글 목록 조회 | `GET` | `/api/places/{placeId}/comments` | 전체 | Path: `placeId`, Query: `cursorId`, `size` |
| 회원 댓글 작성 | `POST` | `/api/places/{placeId}/comments/member` | 회원 | Body: `content` |
| 비회원 댓글 작성 | `POST` | `/api/places/{placeId}/comments/guest` | 비회원 | Body: `displayNickname`, `guestPassword`, `content` |
| 회원 댓글 수정 | `PATCH` | `/api/places/{placeId}/comments/member/{commentId}` | 회원 | Body: `content` |
| 비회원 댓글 수정 | `PATCH` | `/api/places/{placeId}/comments/guest/{commentId}` | 비회원 | Body: `guestPassword`, `content` |
| 회원 댓글 삭제 | `DELETE` | `/api/places/{placeId}/comments/member/{commentId}` | 회원 | Path: `commentId` |
| 비회원 댓글 삭제 | `DELETE` | `/api/places/{placeId}/comments/guest/{commentId}` | 비회원 | Body: `guestPassword` |
| 회원 좋아요/싫어요/취소 처리 | `PUT` | `/api/places/{placeId}/reaction/member` | 회원 | Body: `reactionType` |
| 비회원 좋아요/싫어요/취소 처리 | `PUT` | `/api/places/{placeId}/reaction/guest` | 비회원 | Header: `X-Guest-Key`, Body: `reactionType` |

현재 구현 기준 API 수는 20개다.

## Auth

### `POST /api/auth/signup`

요청:

```json
{
  "email": "luke0985@naver.com",
  "password": "luke0824",
  "nickname": "luke"
}
```

응답은 사용자 기본 정보를 포함한다. 회원가입 직후 자동 로그인은 하지 않는다.

### `POST /api/auth/login`

요청:

```json
{
  "email": "luke0985@naver.com",
  "password": "luke0824"
}
```

응답 body에는 JWT Access Token을 포함하지 않는다. 성공 시 `accessToken` HttpOnly Cookie를 발급한다.

```http
Set-Cookie: accessToken=...; HttpOnly; Path=/; SameSite=Lax
```

### `GET /api/auth/me`

HttpOnly `accessToken` Cookie를 기준으로 현재 로그인한 사용자의 최소 정보를 조회한다.

### `POST /api/auth/logout`

`accessToken` Cookie를 즉시 만료시킨다.

## Place Marker

### `GET /api/places/nearby`

현재 내 위치 기준 1km 반경의 장소 마커를 조회한다.

Query:

| 이름 | 설명 |
| --- | --- |
| `lat` | 현재 위치 위도 |
| `lng` | 현재 위치 경도 |

정책:

- 반경은 1km 고정이다.
- `radius` query는 받지 않는다.
- 최대 100개를 응답한다.
- 거리 가까운 순으로 정렬한다.
- 삭제된 장소는 제외한다.
- PostGIS 거리 검색을 사용한다.

### `GET /api/places/bounds`

현재 지도 화면 영역 안의 장소 마커를 조회한다.

Query:

| 이름 | 설명 |
| --- | --- |
| `minLat` | 지도 화면 최소 위도 |
| `minLng` | 지도 화면 최소 경도 |
| `maxLat` | 지도 화면 최대 위도 |
| `maxLng` | 지도 화면 최대 경도 |

정책:

- 최대 100개를 응답한다.
- 최신 등록순으로 정렬한다.
- 삭제된 장소는 제외한다.
- PostGIS 영역 검색을 사용한다.

nearby/bounds 공통 응답:

```json
{
  "placeId": 1,
  "placeName": "와우산로 버스정류장 흡연부스",
  "placeType": "SMOKING_BOOTH",
  "latitude": 37.5512345,
  "longitude": 126.9234567
}
```

## Place Summary

### `GET /api/places/{placeId}/summary`

마커 클릭 시 바텀시트에 표시할 상세 요약 정보를 조회한다.

응답 주요 필드:

| 필드 | 설명 |
| --- | --- |
| `placeId` | 장소 ID |
| `placeName` | 장소 이름 |
| `placeType` | 장소 타입 |
| `latitude` | 위도 |
| `longitude` | 경도 |
| `locationDescription` | 위치 설명 |
| `likeCount` | `CANCELED` 제외 좋아요 수 |
| `dislikeCount` | `CANCELED` 제외 싫어요 수 |
| `commentCount` | 삭제되지 않은 댓글 수 |
| `viewCount` | 상세 요약 조회수 |
| `myReactionType` | 현재 시간대 내 사용자 반응 상태 |
| `isOwner` | 현재 사용자가 등록자인지 여부 |

정책:

- 조회 성공 시 `viewCount`가 1 증가한다.
- 회원은 HttpOnly accessToken Cookie 기준으로 `isOwner`, `myReactionType`을 계산한다.
- 비회원은 `X-Guest-Key`가 있으면 현재 시간대의 비회원 반응 상태를 계산한다.
- 회원 반응 후 summary에서 `myReactionType`을 확인하려면 summary 요청에도 accessToken Cookie가 필요하다.
- 비회원 반응 후 summary에서 `myReactionType`을 확인하려면 summary 요청에도 같은 `X-Guest-Key`가 필요하다.

## Place Mutation

### `POST /api/places`

회원 전용 장소 등록 API다. 요청 body에 작성자 ID를 받지 않고 JWT에서 추출한다.

요청:

```json
{
  "placeName": "와우산로 버스정류장 흡연부스",
  "placeType": "SMOKING_BOOTH",
  "latitude": 37.5512345,
  "longitude": 126.9234567,
  "locationDescription": "버스정류장 옆 공식 흡연부스."
}
```

### `DELETE /api/places/{placeId}`

회원 전용 장소 삭제 API다.

정책:

- 장소 등록자 본인만 삭제할 수 있다.
- 장소, 해당 장소의 댓글, 해당 장소의 반응을 모두 hard delete한다.

## Comment

- 댓글 목록 조회는 cursor 기반이다.
- 회원 댓글은 `/comments/member` 경로를 사용한다.
- 비회원 댓글은 `/comments/guest` 경로를 사용한다.
- 비회원 댓글은 `guestPassword`로 수정/삭제 권한을 검증한다.
- 개별 댓글 삭제는 soft delete다.

## Reaction

요청 body:

```json
{
  "reactionType": "LIKE"
}
```

`reactionType` 값:

- `LIKE`
- `DISLIKE`
- `CANCELED`

정책:

- 회원 반응은 `/reaction/member` 경로를 사용한다.
- 비회원 반응은 `/reaction/guest` 경로를 사용한다.
- 비회원 요청에는 `X-Guest-Key`가 필수다.
- 서버는 `X-Guest-Key` 원문을 저장하지 않고 SHA-256 해시만 저장한다.
- 같은 시간대에 row가 없고 `LIKE` 또는 `DISLIKE`를 보내면 새 row를 만든다.
- 같은 시간대에 row가 없고 `CANCELED`를 보내면 row를 만들지 않고 `CANCELED` 상태로 응답한다.
- 같은 시간대에 같은 반응을 다시 보내면 `CANCELED`로 변경한다.
- 같은 시간대에 다른 반응을 보내면 요청 반응으로 변경한다.
- `CANCELED`는 `likeCount`, `dislikeCount` 집계에서 제외한다.
- 다음 시간대에는 같은 사용자도 새 반응 row를 생성할 수 있다.
