# Guest Key And Reaction Policy

## 목적

비회원도 장소에 좋아요/싫어요/취소를 남길 수 있게 하되, 서버가 비회원 원문 식별자를 저장하지 않도록 한다. 또한 한 사용자가 같은 장소에 대해 시간대별로 반복 의견을 남길 수 있도록 하되, 같은 시간대 안에서는 중복 row를 만들지 않는다.

## X-Guest-Key

- 비회원 식별 키는 `X-Guest-Key` 헤더로 전달한다.
- `X-Guest-Key`는 프론트엔드가 앱 첫 진입 시 UUID 등으로 생성한다.
- 프론트엔드는 생성한 값을 localStorage 또는 cookie에 저장한다.
- 비회원 반응 요청과 summary 요청에 같은 `X-Guest-Key`를 전달한다.
- 서버는 `X-Guest-Key` 원문을 저장하지 않는다.
- 서버는 SHA-256 해시값을 `place_reactions.guest_key_hash`로 저장한다.

## Endpoint

회원:

```http
PUT /api/places/{placeId}/reaction/member
Authorization: Bearer {accessToken}
```

비회원:

```http
PUT /api/places/{placeId}/reaction/guest
X-Guest-Key: 550e8400-e29b-41d4-a716-446655440000
```

요청 body:

```json
{
  "reactionType": "LIKE"
}
```

## reactionHourKey

- `reactionHourKey`는 현재 시간대 row를 찾기 위한 key다.
- 같은 시간대 안에서 반응을 변경하거나 취소해도 `reactionHourKey`는 바뀌지 않는다.
- 다음 시간대가 되면 새로운 `reactionHourKey`가 계산되고 새 반응 row를 생성할 수 있다.

식별 기준:

- 회원: `place_id + member_user_id + reaction_hour_key`
- 비회원: `place_id + guest_key_hash + reaction_hour_key`

## 처리 규칙

| 현재 시간대 row | 요청 reactionType | 처리 |
| --- | --- | --- |
| 없음 | `LIKE` | 새 row 생성 |
| 없음 | `DISLIKE` | 새 row 생성 |
| 없음 | `CANCELED` | row 생성 없이 `CANCELED` 응답 |
| 있음, 기존값과 같음 | `LIKE` 또는 `DISLIKE` | `CANCELED`로 변경 |
| 있음, 기존값과 다름 | `LIKE` 또는 `DISLIKE` | 요청값으로 변경 |
| 있음 | `CANCELED` | `CANCELED`로 변경 |

## 집계 규칙

- `LIKE` row만 좋아요 수에 포함한다.
- `DISLIKE` row만 싫어요 수에 포함한다.
- `CANCELED` row는 좋아요/싫어요 수에서 제외한다.
- 다음 시간대에 새로 생성된 row는 누적 의견으로 집계한다.

## Summary 응답 연동

`GET /api/places/{placeId}/summary`는 아래 값을 포함한다.

- `myReactionType`: 현재 시간대 내 사용자의 반응 상태

회원은 JWT 사용자 기준으로 계산한다. 비회원은 `X-Guest-Key`가 있을 때 guest hash 기준으로 계산한다. 해당 시간대 row가 없으면 `myReactionType`은 `CANCELED`다.

## DB 제약 권장

```sql
CREATE UNIQUE INDEX uk_place_reactions_member_hour
ON public.place_reactions (place_id, member_user_id, reaction_hour_key)
WHERE reaction_author_type = 'MEMBER';

CREATE UNIQUE INDEX uk_place_reactions_guest_hour
ON public.place_reactions (place_id, guest_key_hash, reaction_hour_key)
WHERE reaction_author_type = 'GUEST';
```

동시 요청으로 unique index 충돌이 발생하면 서버는 `REACTION_TOO_FAST` 계열 오류를 반환한다.
