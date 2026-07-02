# 피움터(Piumteo)

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

| 브랜치 | 용도 | 규칙 |
| --- | --- | --- |
| `main` | 👑 서비스 배포용 브랜치 | 팀장만 직접 관리하고 머지 가능 |
| `develop` | 🛠️ 개발 기능 통합 브랜치 | 새로운 기능은 항상 이 브랜치를 기준으로 브랜치 생성 |

## 🔖 브랜치 명명 규칙

| 유형 | 형식 | 설명 | 예시 |
| --- | --- | --- | --- |
| ✨ 기능 추가 | `feat-[이슈번호]` | 새로운 UI/기능 개발 | `feat-100` |
| ♻️ 리팩토링 | `refactor-[이슈번호]` | 코드 구조 개선 | `refactor-28` |
| 🐛 버그 수정 | `bug-[이슈번호]` | UI/UX 버그 수정 | `bug-23` |
| 🎨 코드 포맷팅, CSS 수정 | `style-[이슈번호]` | 코드 포맷팅, CSS 수정 등 기능에 영향 없는 스타일 변경 | `style-123` |
| 🔨 잡무성 작업 | `chore-[이슈번호]` | 주석, 콘솔 제거, 의존성 관리 | `chore-102` |
| 📝 문서 수정 | `docs-[이슈번호]` | 문서 수정(README 등) | `docs-23` |
| 🚀 빌드 설정 | `build-[이슈번호]` | 빌드 설정, 의존성 패키지 | `build-12` |
| ✅ 테스트 코드 추가/수정 | `test-[이슈번호]` | 테스트 코드 추가/수정 | `test-12` |

## 📝 커밋/PR 컨벤션

| 타입 | 설명 | 예시 |
| --- | --- | --- |
| ✨ `feat` | 새로운 기능 추가 | `feat: 검색 기능 추가` |
| ♻️ `refactor` | 리팩토링 | `refactor: header 컴포넌트 구조 개선` |
| 🐛 `bug` | 버그 수정 | `bug: 모바일 메뉴 토글 오류 수정` |
| 🎨 `style` | 스타일, 포맷, 세미콜론 등 코드 비동작 변경 | `style: 코드 정렬 및 들여쓰기 수정` |
| 📝 `docs` | 문서 수정 | `docs: README 배포 방법 추가` |
| ✅ `test` | 테스트 코드 추가/수정 | `test: 로그인 테스트 케이스 추가` |
| 📦 `build` | 빌드 시스템, 의존성 설정 | `build: Vite 설정 파일 수정` |
| 🚀 `ci` | CI 설정 변경 | `ci: GitHub Actions 수정` |
| 🔨 `chore` | 그 외 잡무 | `chore: 불필요한 주석 제거` |

## 🤝 PR(Pull Request) 전략

| 대상 브랜치 | 머지 규칙 |
| --- | --- |
| `main` | 👑 팀장 승인 후 머지 가능 |
| 그 외 브랜치 | 👥 최소 1명 이상 리뷰어 승인 후 머지 |

## 💻 코드 컨벤션(JavaScript / React 기준)

| 항목 | 규칙 | 예시 |
| --- | --- | --- |
| 컴포넌트명 | PascalCase | `UserCard`, `MainLayout` |
| 변수/함수명 | camelCase | `handleClick`, `userName` |
| 상수 | UPPER_SNAKE_CASE | `DEFAULT_LIMIT`, `API_URL` |
| 파일명 | PascalCase | `ProfilePage.tsx` |
| 스타일 클래스명 | camelCase 또는 BEM | `buttonPrimary`, `card__title` |
| CSS 파일 | 상의 필요 | - |
