# 공통 패키지 워크스페이스 2단계 구현 계획

> 사용자 요청에 따라 현재 단계만 직접 구현하고 결과를 보고한다. 3단계 코드 이동과 5단계 웹 생성은 별도 단계다.

**Goal:** 기존 앱과 API 설정을 유지하면서 네 개 공통 패키지를 pnpm 워크스페이스에 등록한다.

**Architecture:** 루트 `packages/*`에 private 패키지를 만들고 `packages/tsconfig.base.json`을 공유한다. `utils → contracts`, `ui → design-tokens` 의존성을 `workspace:*`로 선언한다. 실제 소스와 exports는 후속 단계에서 연결한다.

**Tech Stack:** pnpm 12.6.0, 기존 TypeScript ~6.0.3, React 19.2.3의 UI peer dependency.

**Spec:** [Next.js 웹과 모바일 공통 패키지 설계](../specs/2026-10-02-nextjs-shared-packages-design.md)

## 제약과 작업 판단

- 이번 단계는 manifest·설정·문서 변경이다. 런타임 함수·컴포넌트나 설정 내용을 그대로 검사하는 저장소 테스트를 추가하지 않고 실제 pnpm 명령과 TypeScript 설정 파싱으로 확인한다.
- 사용자와 진행한 1단계 문서 및 기존 미커밋 작업이 현재 체크아웃에 있으므로 현재 작업 디렉토리에서 필요한 파일만 변경한다. 기존 변경을 별도 worktree로 복사하거나 커밋하지 않는다.
- 각 패키지는 version `0.0.1`, `private: true`, `type: module`로 선언한다.
- 아직 소스가 없으므로 `main`, `types`, `exports`, 패키지 타입 검사 스크립트와 빈 `src/index.ts`를 추가하지 않는다.
- 모바일·API의 manifest, TypeScript 설정, 런타임 코드는 유지한다. 웹 워크스페이스 등록과 웹 실행 명령은 5단계에서 추가한다.
- 새 외부 버전을 도입하지 않고 기존 TypeScript·React 타입 버전을 사용한다. lockfile은 pnpm으로 갱신한다.

## 검토할 조건

1. 새 패키지가 pnpm 목록에 빠지거나 이름이 중복되는지 확인한다.
2. 내부 의존성이 레지스트리 패키지 대신 로컬 `link:`로 잠기는지 확인한다.
3. 공통 기반 TypeScript 설정에 Node·DOM·React Native ambient 타입이 들어오는지 확인한다.
4. 소스가 없는데 존재하지 않는 exports나 실패할 타입 검사 스크립트가 생기는지 확인한다.
5. 기존 모바일·API lockfile 항목과 미커밋 파일이 의도하지 않게 바뀌는지 확인한다.

## Task 1: 패키지와 설정 구성

**Files:**
- Modify: `pnpm-workspace.yaml`
- Create: `packages/tsconfig.base.json`
- Create: `packages/{contracts,utils,design-tokens,ui}/package.json`
- Create: `packages/{contracts,utils,design-tokens,ui}/tsconfig.json`
- Create: `packages/README.md`

**Interfaces:**
- Produces: `@iambox/contracts`, `@iambox/utils`, `@iambox/design-tokens`, `@iambox/ui` 패키지 등록 및 설정. 런타임 import는 아직 제공하지 않는다.
- Consumes: 기존 워크스페이스와 TypeScript 버전.

- [x] `packages/*` 워크스페이스 패턴을 추가한다.
- [x] 기반 설정을 ES2023·ESNext·Bundler·strict·noEmit·resolveJsonModule·isolatedModules·verbatimModuleSyntax·skipLibCheck·esModuleInterop로 구성하고 `types: []`, `lib: [ES2023]`을 지정한다.
- [x] 각 패키지에서 기반 설정을 상속하고 `src`의 TS·TSX·JSON을 대상으로 지정한다. UI는 `jsx: react-jsx`, `lib: [ES2023, DOM, DOM.Iterable]`, `types: [react]`를 사용한다.
- [x] 모든 패키지에 기존 TypeScript dev dependency를 선언한다. UI에는 기존 `@types/react` dev dependency와 `react: ^19.2.3` peer dependency를 선언한다.
- [x] `utils → contracts`, `ui → design-tokens`만 내부 의존성으로 연결하고 준비 상태와 후속 연결 방법을 README에 기록한다.
- [x] `pnpm -r list --depth -1`과 실제 TypeScript compiler API로 패키지 등록·설정 파싱을 확인한다. 소스 없는 설정의 no-input 진단은 현재 단계에서 예상되는 상태로 따로 보고한다.

## Task 2: 설치·검증·문서 반영

**Files:**
- Modify: `pnpm-lock.yaml`
- Modify: `docs/PROJECT_STRUCTURE.md`, `docs/ARCHITECTURE.md`, `docs/ADR.md`
- Modify: `docs/superpowers/specs/2026-10-02-nextjs-shared-packages-design.md`

**Interfaces:**
- Consumes: Task 1의 패키지 manifest와 내부 의존성.
- Produces: lockfile의 공통 패키지 항목과 실제 구성 상태를 반영한 문서.

- [x] `pnpm install --offline --lockfile-only --ignore-scripts`로 기존 캐시 기반 lockfile 갱신을 시도한다. 캐시가 부족하면 실패 원인을 확인한 뒤 필요한 설치 방법을 결정한다.
- [x] `pnpm install --offline --frozen-lockfile --ignore-scripts`로 lockfile과 실제 설치의 일치를 확인한다.
- [x] pnpm 패키지 목록과 내부 symlink를 확인하고 작업 전 lockfile의 기존 항목과 비교한다.
- [x] `pnpm typecheck:mobile`, `pnpm typecheck:api`를 실행하고 결과를 확인한다.
- [x] 구조·아키텍처·ADR·설계 진행 상태를 실제 2단계 구성으로 갱신한다.
- [x] `git diff --check`, 문서 링크 확인, 작업 전 파일 해시와 비교로 변경 범위를 검증한다.
- [x] 이 문서에 실제 검증 결과를 기록하고 파일 링크와 함께 사용자에게 보고한다.

## 실행 결과

- 네 패키지의 manifest·설정·내부 의존성을 구성했다. `pnpm -r list --depth -1`에서 루트·기존 앱/API·공통 패키지를 포함한 7개 프로젝트를 확인했다.
- TypeScript 6.0.3 compiler API로 네 설정의 상속·strict·noEmit·Bundler·전역 타입 경계를 파싱했다. 입력 소스는 0개이며 TS18003만 예상 진단으로 구분했다. 공통 패키지 전체 타입 검사는 수행하지 않았다.
- `utils → contracts`, `ui → design-tokens`가 실제 로컬 symlink로 연결되는 것을 확인했다.
- `pnpm install --offline --lockfile-only --ignore-scripts`는 성공했다. 오프라인 실제 설치는 캐시 접근 문제로 실패했고 샌드박스 내 온라인 재시도도 DNS 제한으로 실패해 종료했다.
- 설치 판단: lockfile을 바꾸지 않고 일반 권한 환경에서 `pnpm install --frozen-lockfile --ignore-scripts`를 실행해 복구했다. 기존 store에서 929개를 재사용했고 다운로드는 0개였다. 기존 루트·mobile·api importer와 외부 packages·snapshots·settings·overrides가 작업 전과 동일한 것을 YAML 비교로 확인했다.
- `pnpm typecheck:mobile`은 작업 전과 설치 후 모두 통과했다. `pnpm typecheck:api`는 샌드박스에서 Prisma 엔진 캐시 접근 권한으로 중단됐으나 일반 권한 환경에서 Prisma Client 생성과 tsc가 모두 통과했다.
- `README.md`, 구조·아키텍처·ADR·설계 진행 상태, 패키지 README를 실제 2단계 구성에 맞춰 갱신했다.
- 이번 단계에서 직접 작성·수정한 파일은 18개다. JSON 파싱, 로컬 문서 링크·코드 블록·공백 검사와 `git diff --check`를 통과했다.
- 작업 전 해시 비교에서 이 단계가 수정하지 않은 모바일 지점 사진·mock·디자인 문서와 배너 산출물의 추가 변경도 감지했다. 병행 변경을 보존하고 이번 단계의 18개 파일과 구분했다. 이후 모바일 타입 검사를 다시 실행해 통과했다.
- 실제 소스 이동, 컴포넌트 렌더러, Next.js 웹 생성·빌드·화면 실행은 이번 단계에서 수행하지 않았다. 앱/API 런타임 소스·manifest·tsconfig를 이번 단계에서 수정하지 않았다.
