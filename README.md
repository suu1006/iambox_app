# iambox

주변 셀프스토리지 지점을 찾고 보관 공간 이용·결제·QR 출입까지 연결하는 모바일 서비스를 목표로 합니다.
학습용 MVP에서 시작해 기능을 단계적으로 구현하고 있습니다.

## 현재 상태

- 모바일: 홈, 지점찾기 지도·목록·상세, 출입QR 안내, 마이페이지를 예시 데이터로 구현했습니다.
- 웹: Next.js 기본 실행 구조를 구성했으며 현재 홈 화면은 비워두었습니다.
- 서버: NestJS 기본 서버와 Prisma–PostgreSQL 연결을 구성했습니다. 업무 데이터 모델은 아직 없습니다.
- 앱–API 연동, 인증, 실제 결제와 QR 발급·출입 인증은 미구현입니다.

## 시작하기

기존 개발 환경은 Node.js 22.23.3, pnpm 12.6.0입니다. 아래 명령은 저장소 루트에서 실행합니다.

```bash
pnpm install
```

**모바일 화면 확인 — Expo Go**

Expo SDK 57과 호환되는 Expo Go에서 터미널의 QR 코드를 스캔합니다.
휴대폰과 컴퓨터는 같은 Wi-Fi에 연결해야 합니다.

```bash
pnpm dev:mobile:go --port 8082
```

Expo Go에서는 지도 영역에 준비 안내를 표시합니다. 실제 네이버 지도는 Client ID 설정과 개발용 앱 빌드·설치가 필요합니다.
[모바일 실행 안내](mobile/README.md)를 따라 준비한 뒤 `pnpm dev:mobile --port 8082`로 연결합니다.

**웹 기본 화면 확인**

```bash
pnpm dev:web
```

[로컬 웹](http://127.0.0.1:3001)에서 빈 기본 화면을 확인합니다. API·DB 실행이나 환경변수 없이 동작합니다. 빌드·타입 검사와 범위는 [웹 실행 안내](web/README.md)를 참고하세요.

**API 서버 실행**

PostgreSQL을 준비하고 [서버 설정 안내](api/README.md)에 따라 `api/.env`의 `DATABASE_URL`을 설정한 뒤 실행합니다.

```bash
pnpm dev:api
```

기본 주소는 `http://localhost:3000`이며, 현재 `GET /`는 `Hello World!`를 반환합니다.

## 저장소 구성

| 경로 | 역할 |
| --- | --- |
| [mobile/](mobile/README.md) | React Native · Expo · TypeScript 모바일 앱, 실행·검증 안내 |
| [web/](web/README.md) | Next.js · App Router 웹 기본 화면, 실행·검증 안내 |
| [api/](api/README.md) | NestJS · Prisma · PostgreSQL 서버, 환경 설정·검증 안내 |
| [packages/](packages/README.md) | 공통 데이터 타입, 유틸리티, 색상 토큰, 네이티브·웹 UI 렌더러 |
| [docs/](docs/PROJECT_STRUCTURE.md) | 제품 요구사항과 설계 문서 |

## 프로젝트 문서

- [PRD](docs/PRD.md): 서비스 목적, MVP 범위, 화면과 사용자 흐름
- [Architecture](docs/ARCHITECTURE.md): 기술 구성과 데이터 흐름
- [Project Structure](docs/PROJECT_STRUCTURE.md): 상세 디렉토리 구조와 파일 배치 기준
- [Database](docs/DATABASE.md): Prisma 스키마와 데이터 모델 계획
- [API](docs/API.md): 현재 엔드포인트와 예정 통신 계약
- [Design System](docs/DESIGN_SYSTEM.md): 색상, 공통 UI, 레이아웃 기준
- [ADR](docs/ADR.md): 주요 설계 결정과 배경

## 구조 검증

공통 패키지·앱·웹·API를 함께 변경했다면 루트에서 다음을 확인합니다.

```bash
pnpm typecheck:shared
pnpm typecheck:mobile
pnpm typecheck:api
pnpm typecheck:web
pnpm test:shared
pnpm --filter @iambox/mobile test
pnpm build:api
pnpm build:web
```

2026-10-02 통합 검증에서 위 명령과 iOS·Android 번들이 통과했습니다. 프로덕션 웹 브라우저 검사 21개, 기존 테스트 45개, iOS 공통 UI 화면, API 응답과 기존 DB 연결을 확인했습니다. Android 기기·실기기 밝기 검증은 남아 있습니다. 자세한 범위는 [6단계 결과보고](docs/superpowers/plans/2026-10-02-monorepo-stage6.md)를 참고하세요.
