# API

NestJS + TypeScript 서버를 구성할 디렉토리입니다.

모바일 앱의 HTTP 요청을 처리하고, 필요한 데이터를 PostgreSQL에 저장하거나
조회합니다. 데이터베이스 접근에는 Prisma를 사용할 예정입니다.

NestJS 12 + TypeScript 기본 서버를 구성했습니다.
`GET /` 요청에 `Hello World!`를 반환합니다. Prisma 7.10을 통해 로컬 PostgreSQL에 연결합니다.
아직 데이터 모델과 앱 테이블은 없습니다.

## 서버 실행과 확인

프로젝트 루트에서 실행합니다. `api/.env`의 `DATABASE_URL`이 필요합니다.
처음 저장소를 받았다면 `cp -n api/.env.example api/.env`로 예시를 복사한 뒤
자신의 PostgreSQL 사용자와 DB 주소로 수정하세요. 기존 `.env`는 덮어쓰지 않습니다.

```bash
pnpm dev:api
```

Nest CLI가 TypeScript를 컴파일하고 서버를 실행합니다.
파일을 수정하면 다시 컴파일하고 서버를 재시작합니다.
다른 터미널에서 다음 요청을 보내세요.

```bash
curl -i http://localhost:3000/
```

예상 결과: HTTP 상태 `200 OK`, 응답 본문 `Hello World!`.
서버는 실행 중인 터미널에서 `Ctrl+C`로 종료합니다.

기본 포트는 3000입니다. 다른 프로세스가 사용하는 경우 다음처럼 변경할 수 있습니다.

```bash
PORT=3001 pnpm dev:api
curl -i http://localhost:3001/
```

`PORT`는 서버가 요청을 받을 포트 번호입니다. 현재는 명령 실행 시 전달하는
환경변수를 사용합니다. `dotenv/config`가 `api/.env`도 읽으며,
명령에서 전달한 환경변수가 우선합니다.

타입 검사와 빌드:

```bash
pnpm typecheck:api
pnpm build:api
```

빌드된 서버를 실행하려면 다음 명령을 사용합니다.

```bash
pnpm --filter @iambox/api start
```

## 서버 파일 역할

- `src/main.ts`: 환경변수를 읽고 앱을 시작합니다. 종료 신호를 받으면 연결 정리 훅을 실행합니다.
- `src/app.module.ts`: Controller와 Service를 NestJS에 등록하는 시작 Module입니다.
- `src/app.controller.ts`: `@Controller()`와 `@Get()`으로 `GET /` 요청을 처리합니다.
- `src/app.service.ts`: Controller가 사용할 응답 문구를 제공합니다.
  `@Injectable()`은 NestJS가 이 클래스를 생성해 필요한 곳에 전달하도록 표시합니다.
- `package.json`: 서버 패키지와 실행·빌드·타입 검사 명령입니다.
- `tsconfig.json`: strict 검사와 NestJS의 데코레이터 컴파일 설정입니다.
- `nest-cli.json`: 소스 위치와 빌드 출력 정리 설정입니다.

요청 흐름: `curl → AppController → AppService → Hello World! 응답`

현재는 고정 문자열 반환만 있으므로 별도 테스트 도구는 추가하지 않았습니다.
타입 검사, 빌드, 실제 HTTP 요청으로 기본 실행을 확인합니다.

## 로컬 PostgreSQL

- 설치: Homebrew `postgresql@17` (확인 버전: 17.11)
- 주소: `127.0.0.1:5432`
- 개발 DB: `iambox` (UTF-8)
- 현재 로컬 소유자: `jeongsu`
- 앱 테이블: 없음

기존에 실행 중인 PostgreSQL 서버에 빈 `iambox` DB를 생성했습니다.
Homebrew 자동 시작 서비스에는 등록하지 않았습니다.
이 DB는 이 컴퓨터에 생성되며, 저장소를 복제한다고 함께 복제되지는 않습니다.

## 직접 확인

아래 명령은 DB 서버가 접속을 받을 수 있는지 확인합니다.

```bash
pg_isready -h 127.0.0.1 -p 5432
```

예상 결과: `127.0.0.1:5432 - accepting connections`

아래 명령은 `iambox`에 접속해 DB 이름과 접속 사용자를 조회합니다.

```bash
psql -X -h 127.0.0.1 -p 5432 -U jeongsu -d iambox \
  -c 'SELECT current_database(), current_user;'
```

예상 결과: DB 이름 `iambox`, 사용자 `jeongsu`.
현재 컴퓨터의 기존 로컬 인증 설정에서는 비밀번호 없이 접속할 수 있습니다.

앱 테이블이 아직 없는지도 확인할 수 있습니다.

```bash
psql -X -h 127.0.0.1 -p 5432 -U jeongsu -d iambox -c '\dt public.*'
```

예상 결과: 관계(테이블)를 찾지 못했다는 메시지. 빈 DB이므로 정상입니다.

서버가 꺼져 있다면 아래 명령으로 기존 Homebrew 데이터 디렉토리의 서버를
수동 실행합니다. 먼저 `pg_isready`로 실행 여부를 확인하세요.

```bash
pg_ctl -D /opt/homebrew/var/postgresql@17 \
  -l /opt/homebrew/var/log/postgresql@17.log start
```

## Prisma 연결

- `prisma/schema.prisma`: PostgreSQL을 사용하도록 지정하고 클라이언트 생성 위치를 정합니다.
  기존 CommonJS 서버와 맞추기 위해 `moduleFormat = "cjs"`를 지정했습니다.
- `prisma.config.ts`: Prisma CLI에 스키마 위치와 DB 접속 주소를 전달합니다.
- `.env`: 실제 `DATABASE_URL`을 저장합니다. Git에서 제외합니다.
- `.env.example`: 필요한 환경변수의 로컬 예시입니다.
- `src/prisma/prisma.service.ts`: Prisma Client를 NestJS Service로 제공합니다.
  시작 시 `$connect()`, 종료 시 `$disconnect()`를 호출합니다.
- `src/prisma/prisma.module.ts`: PrismaService를 등록하고 다른 Module에 제공합니다.
- `src/prisma/check-connection.ts`: DB 이름을 조회한 후 연결을 닫는 확인용 명령입니다.
- `src/generated/prisma/`: Prisma가 생성한 코드입니다. 직접 수정하거나 Git에 추가하지 않습니다.

`DATABASE_URL`은 서버가 PostgreSQL에 접속할 때 사용하는 주소입니다.
모바일 앱에는 이 값을 넣지 않습니다. 현재 로컬 DB는 기존 인증 설정에 따라
비밀번호 없이 접속하며, 비밀번호가 필요한 환경에서는 실제 값을 `.env`에만 입력합니다.

연결 확인은 프로젝트 루트에서 실행합니다.

```bash
pnpm --filter @iambox/api db:check
```

이 명령은 클라이언트 생성과 서버 빌드 후 `SELECT current_database()`를 실행합니다.
예상 결과: `[ { database: 'iambox' } ]`. 조회만 수행하며 데이터는 변경하지 않습니다.

동작 흐름: `연결 확인 명령 → PrismaService → PostgreSQL → iambox DB 이름 반환`

설정만 검사하려면:

```bash
pnpm --filter @iambox/api prisma:validate
```

`dev`, `build`, `typecheck` 명령은 먼저 Prisma Client를 생성합니다.
이 생성 작업은 DB에 테이블을 만들지 않습니다. 실제 서버 실행에는 PostgreSQL이 필요합니다.
`GET /`는 여전히 고정 문자열을 반환하며, DB 조회는 `db:check`로 확인합니다.

현재 스키마에는 모델이 없으므로 migration도 없습니다.
Migration은 향후 테이블 구조가 바뀔 때 그 변경을 DB에 적용하는 이력 파일입니다.
모바일 API 연결과 첫 데이터 모델은 별도 단계에서 진행합니다.


## 모노레포 통합 확인 (2026-10-02, 6단계)

`pnpm typecheck:api`와 `pnpm build:api`가 Prisma Client 생성 후 통과했습니다. 빌드된 연결 확인 CLI의 읽기 전용 `SELECT current_database()`는 `iambox`를 반환했고, API 3000과 웹 3001/검증용 3002를 함께 실행해 `GET /`의 `Hello World!`·200 응답을 확인했습니다. migration·테이블·업무 API는 추가하지 않았습니다.

API는 현재 공통 packages를 소비하지 않습니다. 웹 확인 화면도 API·DB에 연결하지 않으며, 공통 LocationData는 실제 API 응답 계약이 아닙니다. 업무 모델·DTO·CORS와 클라이언트 환경변수는 실제 연동 단계에서 결정합니다. [6단계 결과](../docs/superpowers/plans/2026-10-02-monorepo-stage6.md)를 참고하세요.
