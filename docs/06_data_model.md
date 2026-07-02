# 데이터 모델

## 주요 테이블

- `users`
- `places`
- `place_comments`
- `place_reactions`

## users

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `user_id` | `BIGINT` | PK |
| `email` | `VARCHAR(320)` | 로그인 이메일 |
| `password_hash` | `VARCHAR(255)` | BCrypt 비밀번호 해시 |
| `nickname` | `VARCHAR(50)` | 닉네임 |
| `user_role` | `VARCHAR(20)` | `MEMBER`, `ADMIN` 등 |
| `user_status` | `VARCHAR(20)` | `ACTIVE`, `WITHDRAWN`, `BANNED` 등 |
| `created_at` | `TIMESTAMPTZ` | 생성 시각 |
| `updated_at` | `TIMESTAMPTZ` | 수정 시각 |
| `deleted_at` | `TIMESTAMPTZ` | 회원 탈퇴 등 soft delete 용도 |

## places

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `place_id` | `BIGINT` | PK |
| `created_by_user_id` | `BIGINT` | 등록자 FK |
| `place_name` | `VARCHAR` | 장소 이름 |
| `place_type` | `VARCHAR` | 장소 타입 |
| `latitude` | `NUMERIC` | 위도 |
| `longitude` | `NUMERIC` | 경도 |
| `location` | PostGIS geometry/geography | 위치 검색용 컬럼. 현재 구현은 latitude/longitude로 PostGIS 함수를 구성한다. |
| `location_description` | `VARCHAR` | 위치 설명 |
| `view_count` | `BIGINT` | 장소 상세 요약 조회수 |
| `created_at` | `TIMESTAMPTZ` | 생성 시각 |
| `updated_at` | `TIMESTAMPTZ` | 수정 시각 |
| `deleted_at` | `TIMESTAMPTZ` | 컬럼은 존재하지만 현재 장소 삭제 API는 hard delete 정책을 사용한다. |

장소 타입:

- `SMOKING_BOOTH`
- `SMOKING_AREA`
- `IMPLICIT_SMOKING_AREA`
- `NON_SMOKING_AREA`

## place_comments

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `place_comment_id` | `BIGINT` | PK |
| `place_id` | `BIGINT` | 장소 FK |
| `comment_author_type` | `VARCHAR(20)` | `MEMBER`, `GUEST` |
| `member_user_id` | `BIGINT` | 회원 댓글 작성자 |
| `display_nickname` | `VARCHAR(50)` | 표시 닉네임 |
| `guest_password_hash` | `VARCHAR` | 비회원 댓글 비밀번호 해시 |
| `content` | `VARCHAR(500)` | 댓글 내용 |
| `created_at` | `TIMESTAMPTZ` | 생성 시각 |
| `updated_at` | `TIMESTAMPTZ` | 수정 시각 |
| `deleted_at` | `TIMESTAMPTZ` | 개별 댓글 삭제 soft delete |

정책:

- 개별 댓글 삭제는 soft delete다.
- 장소 삭제 시 해당 장소의 댓글은 hard delete된다.

## place_reactions

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `place_reaction_id` | `BIGINT` | PK |
| `place_id` | `BIGINT` | 장소 FK |
| `reaction_author_type` | `VARCHAR(20)` | `MEMBER`, `GUEST` |
| `member_user_id` | `BIGINT` | 회원 반응 작성자 |
| `guest_key_hash` | `VARCHAR(255)` | 비회원 식별 키 SHA-256 해시 |
| `reaction_type` | `VARCHAR(20)` | `LIKE`, `DISLIKE`, `CANCELED` |
| `reaction_hour_key` | `BIGINT` | 시간대별 반응 구간 key |
| `created_at` | `TIMESTAMPTZ` | 생성 시각 |
| `updated_at` | `TIMESTAMPTZ` | 수정 시각 |

중복 방지 기준:

- 회원: `place_id + member_user_id + reaction_hour_key`
- 비회원: `place_id + guest_key_hash + reaction_hour_key`

권장 인덱스:

```sql
CREATE INDEX idx_place_reactions_place_type
ON public.place_reactions (place_id, reaction_type);

CREATE UNIQUE INDEX uk_place_reactions_member_hour
ON public.place_reactions (place_id, member_user_id, reaction_hour_key)
WHERE reaction_author_type = 'MEMBER';

CREATE UNIQUE INDEX uk_place_reactions_guest_hour
ON public.place_reactions (place_id, guest_key_hash, reaction_hour_key)
WHERE reaction_author_type = 'GUEST';
```

## 삭제 정책

- 장소 삭제 API는 `places`, 해당 장소의 `place_comments`, 해당 장소의 `place_reactions`를 모두 hard delete한다.
- 개별 댓글 삭제 API는 `place_comments.deleted_at`을 채우는 soft delete다.
- 반응은 개별 삭제 API가 없고, 취소는 `reaction_type = CANCELED`로 표현한다.

## 조회 정책

- nearby 조회는 PostGIS 거리 검색을 사용한다.
- bounds 조회는 PostGIS 영역 검색을 사용한다.
- 장소 상세 요약 조회 성공 시 `places.view_count`를 1 증가시킨다.
- 댓글 수는 `deleted_at IS NULL`인 댓글만 집계한다.
- 반응 수는 `reaction_type = LIKE` 또는 `DISLIKE`만 집계하고 `CANCELED`는 제외한다.
