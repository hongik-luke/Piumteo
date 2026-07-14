# 피움터(Piumteo)

[![FE CI](https://github.com/hongik-luke/Piumteo/actions/workflows/fe-ci.yml/badge.svg?branch=main)](https://github.com/hongik-luke/Piumteo/actions/workflows/fe-ci.yml)
[![BE CI](https://github.com/hongik-luke/Piumteo/actions/workflows/be-ci.yml/badge.svg?branch=main)](https://github.com/hongik-luke/Piumteo/actions/workflows/be-ci.yml)

피움터는 지도 기반 흡연 장소 정보 공유 서비스입니다. 사용자는 현재 위치나 지도 화면을 기준으로 주변 흡연 장소를 찾고, 장소 상세 정보와 댓글, 좋아요/싫어요 반응을 통해 장소 정보를 함께 보완할 수 있습니다.

회원은 JWT 기반 인증으로 로그인해 장소, 댓글, 반응 기능을 사용할 수 있으며, 일부 기능은 비회원 흐름도 함께 지원합니다.

## 프로젝트 구조

```text
Piumteo/
  FE/      프론트엔드 애플리케이션
  BE/      Spring Boot 백엔드 서버
  docs/    기획, API, 아키텍처, QA 문서
```

## 주요 기능

- 지도 기반 흡연 장소 등록, 조회, 상세 확인
- 현재 위치 또는 지도 영역 기준 장소 검색
- 회원/비회원 댓글 작성 및 관리
- 회원/비회원 좋아요, 싫어요 반응
- JWT Access Token 기반 회원 인증
- Swagger/OpenAPI 기반 API 문서화

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | React, Vite, TypeScript |
| Backend | Java 17, Spring Boot, Gradle |
| Database | PostgreSQL, JPA, Flyway |
| Auth | Spring Security, JWT |
| Docs | springdoc-openapi, Markdown |

## 백엔드 실행

백엔드는 `BE` 폴더에서 관리합니다.

```powershell
.\BE\gradlew.bat -p BE bootRun
```

백엔드 테스트 실행:

```powershell
.\BE\gradlew.bat -p BE test
```

로컬 비밀값은 Git에 올리지 않습니다. 로컬 환경에서는 `BE/src/main/resources/application-local.yml` 또는 환경 변수를 사용해 `JWT_SECRET_KEY` 같은 값을 주입합니다.

## 프론트엔드 실행

프론트엔드는 `FE` 폴더에서 관리합니다.

```powershell
cd FE
pnpm install
pnpm dev
```

## 문서

프로젝트 상세 문서는 `docs/` 폴더에서 관리합니다.

- `docs/README.md`: 문서 인덱스
- `docs/05_api_spec.md`: API 명세
- `docs/07_architecture.md`: 백엔드 아키텍처
- `docs/08_qa_checklist.md`: QA 체크리스트

---

# Git Convention

## 🌳 깃 브랜치 전략

피움터는 개인 프로젝트 기준으로 관리한다.  
브랜치는 `main`을 안정 버전으로 두고, 기능 개발은 별도 작업 브랜치에서 진행한 뒤 PR로 병합한다.

| 브랜치 | 용도 | 규칙 |
| --- | --- | --- |
| `main` | 서비스 기준 브랜치 | 배포 가능하거나 안정적인 변경만 병합 |
| `FEAT_FE` | 프론트엔드 개발 통합 브랜치 | FE 작업을 모아 검증하는 브랜치 |
| `FEAT_BE` | 백엔드 개발 통합 브랜치 | BE 작업을 모아 검증하는 브랜치 |
| 작업 브랜치 | 기능/수정/리팩토링 단위 작업 | `FEAT_FE` 또는 `FEAT_BE`에서 분기 후 작업 |

> 현재처럼 FE 작업이 크고 연속적인 경우에는 `FEAT_FE`에서 작업 후 `main`으로 PR을 생성한다.  
> 기능 단위가 커지거나 실험 작업이 많아지면 `FEAT_FE`에서 다시 작업 브랜치를 분기한다.

---

## 🔖 브랜치 명명 규칙

브랜치 이름은 `타입/영역-작업내용` 형식을 사용한다.  
이슈 번호가 없을 수 있으므로 이슈 번호는 필수로 두지 않는다.

| 유형 | 형식 | 설명 | 예시 |
| --- | --- | --- | --- |
| ✨ 기능 추가 | `feat/[영역]-[작업내용]` | 새로운 기능 추가 | `feat/fe-map-register-sheet` |
| ♻️ 리팩토링 | `refactor/[영역]-[작업내용]` | 코드 구조 개선 | `refactor/fe-api-layer` |
| 🐛 버그 수정 | `fix/[영역]-[작업내용]` | 오류 수정 | `fix/fe-marker-position` |
| 🎨 스타일 수정 | `style/[영역]-[작업내용]` | CSS, UI 스타일 수정 | `style/fe-bottom-sheet` |
| 🔨 잡무성 작업 | `chore/[영역]-[작업내용]` | 주석, 콘솔 제거, 파일 정리 | `chore/fe-remove-unused-files` |
| 📝 문서 수정 | `docs/[작업내용]` | README, 문서 수정 | `docs/update-git-convention` |
| 📦 빌드 설정 | `build/[영역]-[작업내용]` | 빌드 설정, 의존성 관리 | `build/fe-vite-config` |
| ✅ 테스트 | `test/[영역]-[작업내용]` | 테스트 코드 추가/수정 | `test/be-place-service` |
| 🚀 CI 설정 | `ci/[작업내용]` | GitHub Actions 등 CI 설정 | `ci/github-actions` |

## 📝 커밋 컨벤션

커밋 메시지는 Conventional Commit 형식을 따른다.

```txt
type(scope): subject
```

| 요소 | 설명 | 예시 |
| --- | --- | --- |
| `type` | 작업 종류 | `feat`, `refactor`, `fix` |
| `scope` | 작업 영역 | `fe`, `be`, `api`, `map`, `auth`, `place` |
| `subject` | 변경 요약 | `API 타입 및 유틸 구조 분리` |

---

### 커밋 타입

| 타입 | 설명 | 예시 |
| --- | --- | --- |
| ✨ `feat` | 새로운 기능 추가 | `feat(fe): 장소 등록 바텀시트 추가` |
| ♻️ `refactor` | 기능 변화 없는 코드 구조 개선 | `refactor(fe): API 타입 및 유틸 구조 분리` |
| 🐛 `fix` | 버그 수정 | `fix(fe): 마커 좌표 보정 오류 수정` |
| 🎨 `style` | CSS, UI 스타일, 포맷 수정 | `style(fe): 장소 상세 바텀시트 스타일 정리` |
| 📝 `docs` | 문서 수정 | `docs: Git 컨벤션 수정` |
| ✅ `test` | 테스트 코드 추가/수정 | `test(be): 장소 등록 서비스 테스트 추가` |
| 📦 `build` | 빌드 설정, 패키지, 의존성 수정 | `build(fe): Vite 설정 수정` |
| 🚀 `ci` | CI/CD 설정 변경 | `ci: GitHub Actions 배포 워크플로우 추가` |
| 🔨 `chore` | 그 외 잡무성 작업 | `chore(fe): 미사용 컴포넌트 제거` |

---

### Scope 규칙

`scope`는 변경된 영역을 나타낸다.  
가능하면 작성하되, 특정 영역이 애매한 경우에는 생략할 수 있다.

| Scope | 설명 |
| --- | --- |
| `fe` | 프론트엔드 전반 |
| `be` | 백엔드 전반 |
| `api` | API 호출 계층, endpoint, client |
| `auth` | 로그인, 회원가입, 인증/인가 |
| `map` | 지도, 마커, 위치, 네이버 지도 |
| `place` | 장소 등록, 장소 상세, 장소 타입 |
| `comment` | 댓글 작성, 수정, 삭제 |
| `reaction` | 좋아요/싫어요 |
| `ui` | 공통 UI, 바텀시트, 모달, 오버레이 |
| `style` | 전역 스타일, CSS, Tailwind |
| `docs` | 문서 |

---

### 커밋 메시지 예시

```bash
git commit -m "feat(fe): 장소 등록 바텀시트 추가"
git commit -m "feat(map): 네이버 지도 렌더링 추가"
git commit -m "refactor(fe): API 타입 및 유틸 구조 분리"
git commit -m "refactor(api): 인증 헤더 처리 구조 정리"
git commit -m "fix(map): 장소 등록 마커 좌표 보정"
git commit -m "fix(auth): 로그인 만료 처리 오류 수정"
git commit -m "style(fe): 전역 스타일 구조 정리"
git commit -m "chore(fe): 미사용 mock 데이터 제거"
git commit -m "docs: Git 컨벤션 수정"
```

---

### 커밋 작성 규칙

- `type`은 소문자로 작성한다.
- `scope`도 소문자로 작성한다.
- `subject`는 한 줄로 간결하게 작성한다.
- 한 커밋에는 하나의 목적만 담는다.
- 기능 추가와 리팩토링은 가능하면 분리한다.
- 단순 파일 이동, 구조 변경, 기능 추가를 한 커밋에 과하게 섞지 않는다.
- 커밋 메시지는 한국어 또는 영어 모두 가능하지만, 한 PR 안에서는 최대한 통일한다.
- 커밋 제목 끝에는 마침표를 찍지 않는다.

---

### 커밋 분리 기준

| 상황 | 권장 타입 | 예시 |
| --- | --- | --- |
| 새로운 화면/기능 추가 | `feat` | `feat(fe): 회원가입 페이지 추가` |
| 기존 기능 동작은 그대로 두고 구조만 변경 | `refactor` | `refactor(fe): 페이지 구조 분리` |
| 화면이 깨지거나 동작이 잘못된 부분 수정 | `fix` | `fix(fe): 장소 유형 아이콘 표시 오류 수정` |
| CSS, className, UI 배치만 수정 | `style` | `style(fe): 지도 버튼 위치 조정` |
| 불필요한 파일/console/import 제거 | `chore` | `chore(fe): 미사용 UI 컴포넌트 제거` |
| README, 컨벤션, 문서 수정 | `docs` | `docs: PR 템플릿 추가` |
| 패키지 설치, Vite 설정, 빌드 설정 변경 | `build` | `build(fe): path alias 설정 추가` |
| GitHub Actions 등 자동화 설정 변경 | `ci` | `ci: FE 배포 워크플로우 추가` |

---

# 💻 코드 컨벤션

피움터 FE는 React + TypeScript + Vite 기반으로 작성한다.  
코드 컨벤션은 복잡한 규칙을 늘리는 것보다, 파일 위치와 역할을 예측 가능하게 만드는 데 집중한다.

---

### 1. 파일 구조는 역할 기준으로 나눈다

FE 코드는 역할별 폴더 구조를 따른다.

```txt
src/
  app/
  apis/
  components/
  pages/
  types/
  utils/
  constants/
  libs/
  styles/
  assets/
```

| 폴더 | 역할 |
| --- | --- |
| `app` | 앱 진입점, 레이아웃, 화면 전환 |
| `apis` | API client, endpoint, API 함수 |
| `components` | 재사용 UI 컴포넌트 |
| `pages` | 화면 단위 컴포넌트 |
| `types` | API 타입, 도메인 타입 |
| `utils` | mapper, storage, helper |
| `constants` | 장소 타입 등 상수 |
| `libs` | 네이버 지도 등 외부 SDK 연동 |
| `styles` | 전역 스타일 |
| `assets` | 이미지, 아이콘, 로고 |

---

### 2. API 타입, 도메인 타입, mapper 역할을 분리한다

API 응답 타입은 `types/api`에 둔다.  
화면에서 사용하는 타입은 `types/domain`에 둔다.  
API 응답을 화면용 데이터로 바꾸는 로직은 `utils/mappers`에서 처리한다.

```txt
types/
  api/
  domain/

utils/
  mappers/
```

컴포넌트나 page 안에서 API 응답 필드를 직접 조립하지 않는다.

```ts
// 지양
const place = {
  id: String(response.placeId),
  name: response.placeName,
};

// 권장
const place = markerToPlace(response);
```

---

### 3. 네이밍은 예측 가능하게 작성한다

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 컴포넌트 | PascalCase | `PlaceDetailSheet` |
| Page 파일 | PascalCase + `Page` | `MapPage.tsx` |
| API 파일 | 도메인명 + `.api.ts` | `place.api.ts` |
| 타입 / 인터페이스 | PascalCase | `AuthSession`, `Place` |
| 변수 / 함수 | camelCase | `handleSubmit`, `placeName` |
| 상수 | UPPER_SNAKE_CASE 또는 의미 있는 객체명 | `API_BASE_URL`, `PLACE_CFG` |

UI에 enum 값을 그대로 출력하지 않고 상수 label을 사용한다.

```ts
// 지양
<span>{place.type}</span>

// 권장
<span>{PLACE_CFG[place.type].label}</span>
```
