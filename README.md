# iambox_app

작은 MVP에서 시작해 기능을 하나씩 추가하는 앱 프로젝트입니다.

## 디렉토리 구조

```text
iambox_app/
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── mobile/
│   ├── App.tsx
│   ├── index.ts
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── assets/
│   ├── LICENSE
│   └── README.md
└── api/
    ├── src/
    │   ├── main.ts
    │   ├── app.module.ts
    │   ├── app.controller.ts
    │   ├── app.service.ts
    │   └── prisma/
    │       ├── prisma.module.ts
    │       ├── prisma.service.ts
    │       └── check-connection.ts
    ├── prisma/
    │   └── schema.prisma
    ├── prisma.config.ts
    ├── .env.example
    ├── package.json
    ├── tsconfig.json
    ├── nest-cli.json
    └── README.md
```

- `mobile/`: React Native + Expo + TypeScript 모바일 앱
- `api/`: NestJS + TypeScript 백엔드 서버
- 데이터베이스: PostgreSQL, 서버에서 Prisma를 통해 접근

## 동작 흐름

```text
모바일 앱 → HTTP API 요청 → NestJS 서버 → Prisma → PostgreSQL
```

API는 앱과 서버가 요청과 응답을 주고받는 창구입니다.
Prisma는 서버 코드에서 데이터베이스를 조회하고 수정하는 도구입니다.
모바일 앱은 PostgreSQL에 직접 연결하지 않고 서버에 요청합니다.

PostgreSQL은 별도로 실행되는 데이터베이스입니다. 현재 기존 Homebrew
PostgreSQL 17에 빈 개발용 `iambox` DB를 생성했습니다.
접속 확인 방법은 [api/README.md](api/README.md)에 정리했습니다.
Prisma 설정은 `api/prisma.config.ts`, 스키마는 `api/prisma/schema.prisma`에서 관리합니다.

## 현재 단계

pnpm 워크스페이스와 `mobile/`의 Expo + TypeScript 기본 앱을 구성했습니다.
로컬 PostgreSQL 개발 DB와 `api/`의 NestJS 기본 서버도 준비했습니다.
Prisma를 통한 서버의 DB 연결도 구성했습니다. 모바일 앱의 API 호출과 데이터 모델은 아직 없습니다.

Node.js 22.23.3과 pnpm 12.6.0으로 구성했습니다.

```bash
pnpm install
pnpm dev:mobile --port 8082
```

휴대폰과 컴퓨터를 같은 Wi-Fi에 연결하고, Expo Go에서 터미널의 QR 코드를
열면 `iambox 앱 실행 성공` 문구가 표시됩니다.
자세한 실행 방법은 [mobile/README.md](mobile/README.md)를 참고하세요.

타입 검사:

```bash
pnpm typecheck:mobile
```

NestJS 서버는 별도 터미널에서 실행합니다.

```bash
pnpm dev:api
```

다른 터미널에서 `curl http://localhost:3000/`을 실행하면 `Hello World!`를 반환합니다.
타입 검사는 `pnpm typecheck:api`, 빌드는 `pnpm build:api`로 실행합니다.

DB 연결 확인:

```bash
pnpm --filter @iambox/api db:check
```

예상 결과는 `[ { database: 'iambox' } ]`입니다.
`api/.env` 설정과 초기 복사 방법은 [서버 README](api/README.md)를 참고하세요.

## 이후 작업

별도 요청을 받아 첫 기능에 필요한 데이터 모델 하나를 정의합니다.
