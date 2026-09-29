# Project Structure

> 기준일: 2026-09-29. 루트 `mobile/`, `api/`의 pnpm 워크스페이스다. `apps/` 구조가 아니다.

## 현재 디렉토리 구조

```text
iambox_app/
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .gitignore
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── PROJECT_STRUCTURE.md
│   ├── DATABASE.md
│   └── API.md
├── mobile/
│   ├── index.ts
│   ├── App.tsx
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md
│   ├── LICENSE
│   └── assets/
└── api/
    ├── package.json
    ├── tsconfig.json
    ├── nest-cli.json
    ├── README.md
    ├── .env.example
    ├── .env                         # 로컬 설정 / Git 제외
    ├── prisma.config.ts
    ├── prisma/
    │   └── schema.prisma
    └── src/
        ├── main.ts
        ├── app.module.ts
        ├── app.controller.ts
        ├── app.service.ts
        ├── prisma/
        │   ├── prisma.module.ts
        │   ├── prisma.service.ts
        │   └── check-connection.ts
        └── generated/prisma/        # 자동 생성 / Git 제외
```

트리는 소스·설정 중심이다. 로컬 `node_modules/`, `mobile/.expo/`, `mobile/dist/`, `api/dist/`는 생략했다. `.env`와 생성 클라이언트는 로컬에 있어도 새 checkout에 포함되지 않는다.

## 디렉토리와 파일 책임

| 위치 | 역할 / 둘 파일 | 두지 않을 파일·내용 |
| --- | --- | --- |
| 루트 | 워크스페이스 설정, 공통 실행 명령, lockfile, 개요 | 화면 구현, 서버 도메인 코드, 비밀값 |
| `docs/` | 제품·구조·DB·API 기준 문서 | 런타임 코드, 실제 인증정보 |
| `mobile/` | 앱 진입점, 모바일 소스와 설정 | DB 접속 코드, 서버 비밀키 |
| `mobile/index.ts` | Expo 루트 등록 | 업무 처리 |
| `mobile/App.tsx` | 현재 실행 확인 화면; 이후 앱 구성 진입점 | 기능이 커진 뒤 모든 업무 로직을 한 파일에 누적 |
| `mobile/assets/` | 아이콘 등 번들 정적 이미지 | API 응답, TS 업무 로직 |
| `api/` | 서버 패키지·환경·빌드·Prisma CLI 설정 | 모바일 UI |
| `api/src/` | 부팅, 모듈, Controller, Service | DB migration SQL, 빌드 출력 |
| `api/src/prisma/` | DB 연결 수명 주기, 모듈 제공, 연결 확인 CLI | 결제·예약 등 개별 업무 규칙 |
| `api/prisma/` | Prisma 스키마, 향후 migration 이력 | HTTP 처리 코드, 생성 클라이언트 |
| `api/src/generated/prisma/` | Prisma 생성물 | 직접 작성·수정한 코드; Git에 추가하지 않음 |
| `node_modules/`, `dist/`, `.expo/` | 의존성, 빌드 출력, 로컬 Expo 상태 | 직접 유지할 소스; Git에 추가하지 않음 |

`api/.env.example`에는 공유 가능한 설정 예시, `.env`에는 실제 로컬 설정을 둔다. `mobile/app.json`은 Expo 설정, 각 `tsconfig.json`은 TypeScript 설정을 관리한다.

## 새로운 파일 배치 기준

1. 제품·계약·설계 설명은 이 문서 목록 중 해당 문서를 수정한다.
2. 모바일 소스는 `mobile/`, 서버 소스는 `api/src/` 아래에 둔다.
3. 서버 기능이 실제로 추가될 때 `api/src/<domain>/`에 Module·Controller·Service와 필요한 DTO를 함께 둔다. 현재 도메인 폴더는 없다.
4. 모바일에 화면 분리가 필요하면 라우팅 방식을 먼저 결정한다. 현재 Expo Router가 없으므로 `app/` 폴더가 자동 라우팅된다고 가정하지 않는다.
5. 기능별 UI·hooks·API 연동이 생기면 `mobile/features/<feature>/`를 사용할 수 있다. 여러 기능에서 실제로 재사용하는 UI는 `mobile/components/`, 공통 HTTP 처리가 필요해지면 `mobile/services/`로 분리할 수 있다. 모두 **예정 배치 지침**이며 지금 생성하지 않는다.
6. 기능 전용 타입은 해당 기능 가까이에 둔다. 공용 `types/`는 실제 공유 필요가 생길 때만 만든다.
7. 데이터 모델은 `api/prisma/schema.prisma`를 수정한다. 생성물을 직접 수정하지 않는다.

미사용 폴더, 공유 패키지, Repository 계층을 선행 생성하지 않는다. 실제 구조가 바뀌면 이 문서의 트리와 책임 표를 갱신한다.

## 주요 명령 (루트에서 실행)

| 명령 | 역할 |
| --- | --- |
| `pnpm dev:mobile --port 8082` | Expo 개발 서버 |
| `pnpm typecheck:mobile` | 모바일 타입 검사 |
| `pnpm dev:api` | Prisma 생성 후 Nest 개발 서버 |
| `pnpm typecheck:api` | Prisma 생성 후 서버 타입 검사 |
| `pnpm build:api` | Prisma 생성 후 서버 빌드 |
| `pnpm --filter @iambox/api db:check` | 빌드 후 DB 연결·DB 이름 확인 |

서버 실행에는 `DATABASE_URL`과 접근 가능한 PostgreSQL이 필요하다. 상세 실행 안내는 기존 mobile/api README를 참고한다.
