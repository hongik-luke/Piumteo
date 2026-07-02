# 피움터 문서 인덱스

이 폴더는 피움터 백엔드 구현과 기획 결정을 코드 기준으로 정리한 문서 모음이다.

## 현재 구현 상태

- 인증: JWT Access Token 기반 로그인/회원가입 구현 완료
- 로그아웃: 별도 API 없이 프론트엔드 저장소의 accessToken 삭제로 처리
- 장소: 등록, 삭제, nearby 조회, bounds 조회, 상세 요약 조회 구현 완료
- 댓글: 회원/비회원 목록, 작성, 수정, 삭제 구현 완료
- 반응: 회원/비회원 좋아요, 싫어요, 취소 처리 구현 완료
- 조회수: 장소 상세 요약 조회 성공 시 `view_count` 1 증가

## 문서 목록

| 문서 | 내용 |
| --- | --- |
| `00_project_memory.md` | 프로젝트 핵심 기억과 고정 결정 |
| `01_mvp_scope.md` | MVP 범위 |
| `02_permissions_policy.md` | 사용자/권한 정책 |
| `03_maps_flow_wireframe.md` | 지도 화면 흐름과 프론트 호출 방식 |
| `04_feature_spec.md` | 기능 명세 |
| `05_api_spec.md` | 최신 API 명세 |
| `06_data_model.md` | 데이터 모델과 삭제 정책 |
| `07_architecture.md` | 백엔드 구조 |
| `08_qa_checklist.md` | QA 체크리스트 |
| `09_decisions_and_gaps.md` | 확정 결정과 남은 확인사항 |
| `10_guest_key_and_reaction_policy.md` | 비회원 키와 시간대별 반응 정책 |

## 구현 기준 요약

- API base path는 `/api`다.
- 회원 인증은 `Authorization: Bearer {accessToken}` 헤더를 사용한다.
- 비회원 반응은 프론트엔드가 생성한 `X-Guest-Key` 헤더를 사용한다.
- 댓글 API와 반응 API는 회원/비회원 경로를 분리한다.
- 장소 삭제는 장소, 해당 장소의 댓글, 해당 장소의 반응을 모두 hard delete한다.
- 개별 댓글 삭제는 soft delete를 유지한다.
- nearby 조회는 현재 위치 기준 1km, 최대 100개, 거리순이다.
- bounds 조회는 현재 지도 화면 영역 기준, 최대 100개, 최신 등록순이다.
