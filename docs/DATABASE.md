# Database

> 기준일: 2026-09-29. 연결 설정은 구현되어 있으나 데이터 모델은 없다. 아래 후보·운영 지침은 실제 스키마와 구분한다.

## Database / Prisma

- DB: PostgreSQL (`api/prisma/schema.prisma`의 provider).
- ORM: Prisma 7.10.0, PrismaPg 어댑터와 pg 드라이버.
- CLI: `api/prisma.config.ts`가 스키마 경로와 `DATABASE_URL`을 읽는다.
- 서버: `PrismaService`가 환경변수로 연결하고 시작/종료 시 연결을 열고 닫는다.
- Client: `prisma-client` generator, 출력 `api/src/generated/prisma`, `moduleFormat = "cjs"`.
- `.env.example`의 로컬 예시: `127.0.0.1:5432`, DB `iambox`, schema `public`. 실제 환경에서는 자신의 접속 정보를 사용한다.
- 기존 README는 PostgreSQL 17.11과 빈 개발 DB를 기록한다. 현재 가동 여부와 실제 테이블 상태를 이번 작업에서 재조회하지 않았다.

## 현재 스키마

`generator`와 `datasource`만 있다. `model`, `enum`, 관계, 인덱스, 제약조건, migration 파일은 없다. 업무 데이터를 저장하거나 조회하는 코드는 없다.
`check-connection.ts`의 `SELECT current_database()`는 연결 확인용이며 업무 모델이 아니다.

## 주요 모델 후보 — 예정 / TBD

제품 요구사항을 설명하기 위한 후보이며, 모델 이름·채택 여부·필드 모두 확정하지 않았다.

| 후보 | 목적 | 결정할 내용 |
| --- | --- | --- |
| User | 사용자 계정·정보 | 인증 제공자, 식별 정보, 개인정보 항목 |
| Location | 지점 목록·위치·상세 | 주소·좌표·시설 정보 |
| StorageSpace | 지점 내 보관 공간 | 공간 단위, 크기, 요금, 이용 가능 여부 |
| Reservation | 사용자와 공간의 이용 관계 | 예약 모델 필요 여부, 기간, 상태, 중복 이용 방지 |
| Payment | 기본 결제 기록 | 결제 제공자, 금액·통화, 결제 시도·취소 구조 |
| AccessQR | 출입 QR | 저장 필요 여부, 발급·만료·재사용·검증 방식 |

## 모델 관계 — 개념 후보

```text
User ── Reservation(채택 여부 TBD) ── StorageSpace ── Location
             ├── Payment
             └── AccessQR(연결 위치·저장 여부 TBD)
```

보관 공간이 지점에 속하고 사용자의 이용과 결제가 연결된다는 개념만 표현한다. 관계 수(1:1/1:N), 외래키, 삭제 정책과 QR의 소유 주체는 TBD다. 이 그림은 적용된 ERD가 아니다.

## 필드 규칙 — 아직 스키마에 적용되지 않음

| 항목 | 현재 결정 상태 / 첫 모델 작성 시 기준 |
| --- | --- |
| ID | TBD. UUID, CUID, 정수 중 하나를 필요에 맞게 정하고 일관되게 적용 |
| 날짜 / 시간 | 저장 타입·시간대 TBD. 시점 데이터는 UTC 기준 저장·전달을 우선 검토하고 화면에서 현지 시간으로 표시 |
| nullable | 필드별 TBD. 업무상 값이 없는 상태가 허용될 때만 선택 필드로 정의 |
| enum | 상태 목록 TBD. 상태와 전이가 확정된 뒤 정의 |
| createdAt / updatedAt | 적용 모델 TBD. 생성·수정 추적이 필요한 모델에 `@default(now())`, `@updatedAt` 사용 검토 |
| 금액 | 타입·통화 TBD. 결제 제공자와 최소 화폐 단위를 확인한 뒤 정함 |

## Naming Convention — 예정 지침

- Prisma Model: 단수 PascalCase (`Location`).
- Field: camelCase (`createdAt`).
- DB Table / Column: 명시적인 별도 명명 규칙은 TBD. Prisma 기본 이름과 `@@map` / `@map`을 이용한 매핑 중 결정한다.
- 현재 model이 없으므로 snake_case·복수 테이블명 등을 이미 적용된 규칙으로 가정하지 않는다.

## Index / Constraint

현재 정의된 항목은 없다. 첫 모델 구현 시 실제 접근 패턴에 필요한 것만 추가한다.

- 계정 식별 방식이 확정되면 필요한 고유 제약을 결정한다.
- 관계가 확정되면 외래키와 삭제/수정 정책을 결정한다.
- 지점별 공간 조회 등 실제 쿼리에 필요한 인덱스만 추가한다.
- 결제 연동 시 제공자 식별자의 중복 처리, 공간 이용 구현 시 기간 중복 방지를 검토한다. 구현 방식은 TBD다.

## Migration

현재 migration 디렉토리와 전용 package script가 없다. `prisma generate`는 클라이언트를 생성하며 DB 테이블을 만들지 않는다.

첫 모델 추가 시 사용할 **예정 관리 절차**:

1. `api/prisma/schema.prisma`를 수정하고 `pnpm --filter @iambox/api prisma:validate`로 확인한다.
2. 개발 DB를 대상으로 `pnpm --filter @iambox/api exec prisma migrate dev --name <change_name>`을 실행한다.
3. 생성된 `api/prisma/migrations/`의 SQL을 검토하고 스키마와 함께 Git으로 관리한다. 적용 대상 DB를 먼저 확인한다.
4. `pnpm --filter @iambox/api prisma:generate` 후 관련 코드와 이 문서를 갱신한다.
5. 배포 환경이 생기면 `prisma migrate deploy`를 통한 적용 절차를 구성한다. 현재 배포 파이프라인은 없다.

공유·적용된 migration을 수정하는 대신 후속 migration으로 변경한다. 생성된 클라이언트와 `.env`는 커밋하지 않는다. 이번 문서 작성에서는 migration을 생성하거나 실행하지 않았다.
