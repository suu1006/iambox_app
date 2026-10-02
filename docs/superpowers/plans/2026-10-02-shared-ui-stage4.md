# Button·Badge 공통 UI 4단계 구현 계획

> **For agentic workers:** superpowers:executing-plans로 이번 단계만 직접 구현한다.

**Goal:** 기존 모바일 Button·Badge를 공통 규칙과 native/web 렌더러로 분리하고 모바일 호출부를 유지한다.

**Architecture:** shared는 플랫폼 중립 props와 디자인 규칙을 제공한다. native는 기존 NativeWind 클래스·SVG props·Pressable을 유지하고 web은 HTML button/span으로 같은 규칙을 표시한다. 공개 진입점은 `@iambox/ui/native`, `@iambox/ui/web`, 웹 상태 CSS는 `@iambox/ui/web.css`다.

**Tech Stack:** 기존 React 19.2.3, React Native 0.86.3, NativeWind 4.2.7, react-native-svg 15.15.4, TypeScript 6.0.3, Node test.

**Spec:** [승인된 공통 패키지 설계](../specs/2026-10-02-nextjs-shared-packages-design.md)

## Global Constraints

- 기존 api/mobile 위치, 앱 호출부·화면·터치·접근성·지도·QR 밝기를 유지한다.
- Button은 primary/link(기본 primary), Badge는 solid/soft/neutral(기본 solid), default/compact(기본 default)를 지원한다.
- shared에 React Native·DOM 이벤트 타입을 넣지 않는다. 색상은 기존 공통 JSON을 참조한다.
- native/web 루트 barrel을 만들지 않는다. React는 peer이고 네이티브 peer는 optional로 선언해 웹 소비자가 필수로 설치하지 않도록 한다.
- 기존 의존성 버전을 유지한다. UI 타입 검사에 필요한 devDependencies는 기존 모바일 버전으로 선언한다.
- Next.js 앱 생성·브라우저 UI 실행은 5단계에서 수행한다. 이번 단계는 렌더러 구현·단위 검증까지다.
- 기존 작업이 많은 현재 checkout에서 3단계와 동일하게 작업하고 커밋은 생성하지 않는다. 작업 전 파일 해시와 두 컴포넌트 원본을 /tmp에 보관한다.

## Review Focus

- 기본 variant/tone/size와 커스텀 className·style가 이전 호출부 의미를 유지한다.
- 네이티브 버튼 접근성·disabled·이벤트 전달·장식 SVG가 이동하면서 누락되지 않는다.
- 웹 버튼이 폼 안에서 기본 submit이 되지 않고, 접근성 이름과 disabled를 HTML에 전달한다.
- 웹 진입점이 React Native·SVG 네이티브 모듈을 로드하지 않는다.
- 공통 패키지의 NativeWind 클래스가 실제 Tailwind 결과에 포함된다. native 타입 검사에서 DOM 전역을 자동 포함하지 않는다.

## 파일 책임과 인터페이스

- `packages/ui/src/shared/button.ts`, `badge.ts`: 공통 props/variant/tone/size 타입과 색상·간격·높이·글자·아이콘 규칙. NativeWind의 완전한 클래스 문자열과 웹이 사용할 수치/색상 규칙을 이곳에 정의한다.
- `src/native/Button.tsx`, `Badge.tsx`, `index.ts`: 기존 네이티브 JSX를 유지하는 렌더러와 공개 타입/진입점.
- `src/web/Button.tsx`, `Badge.tsx`, `index.ts`, `styles.css`: 플랫폼 속성·SVG 슬롯·HTML 표현과 pressed/focus 표시. Button만 Client 경계를 갖고 Badge는 순수 렌더러다.
- `tsconfig.json`, `tsconfig.native.json`: web/shared와 native/shared 검사를 분리한다. NativeWind 타입 증강은 native 검사에만 포함한다.
- `tests/loadUI.cjs`, `components.test.cjs`, `web.types.ts`, `native.types.ts`: 실제 소스 로딩, 컴포넌트 경계 동작·플랫폼 props 검증. Node가 로드할 수 없는 네이티브 host만 대체하고 React·shared·색상은 실제 모듈을 사용한다.
- 모바일 Button/Badge는 기존 경로에서 native 진입점을 재수출한다. 모바일 package·Tailwind·기존 locationList 테스트 로더를 연결한다.

## Task 1: 렌더러와 모바일 연결

- [x] 모바일 타입 검사·테스트 기준을 확인하고 원본·lockfile·파일 해시를 보관한다.
- [x] 기본값, 이벤트/접근성/아이콘, 6개 배지 조합, 웹 props와 네이티브 의존성 차단을 검증하는 컴포넌트 테스트를 먼저 작성한다.
- [x] `pnpm --filter @iambox/ui exec node --test tests/components.test.cjs` 실행. Expected: 공개 native/web 진입점 미구현으로 실패.
- [x] 공통 props·규칙과 native/web 렌더러·exports를 구현한다. 웹은 공유 색상·수치로 inline style을 만들며 pressed/focus는 web.css가 제공한다. JSX에서 브라우저 전역을 사용하지 않는다.
- [x] native/web 타입 fixture와 별도 tsconfig를 연결하고 peer/devDependencies·모바일 의존성을 기존 버전으로 구성한다.
- [x] 모바일 재수출·Tailwind 탐색 경로·기존 테스트의 TSX 패키지 로더를 연결한다.
- [x] offline lockfile-only 갱신 후 frozen install 실행. Expected: workspace 연결 완료, 외부 버전 유지.
- [x] UI 테스트·타입 검사 실행. Expected: 모든 케이스 통과, 플랫폼 props 혼합은 컴파일로 거부.

## Task 2: 검증과 기록

- [x] 공통 전체 타입 검사·테스트 및 모바일 타입 검사·전체 테스트 실행. Expected: 기존 31개와 공통 utils 2개 유지, UI 새 테스트 통과.
- [x] Tailwind를 실제 실행해 패키지 클래스 생성 확인. Expected: 이동 전 두 컴포넌트에 필요한 클래스가 모두 생성되고 색상·수치 규칙 일치.
- [x] Expo iOS·Android export 실행. Expected: 두 번들 생성, native 진입점 변환과 NativeWind 처리 성공.
- [x] 구조·설계·디자인 시스템·사용법과 전체 변경 링크를 갱신한다. 이번 단계 검증과 기기/웹 실행 미검증을 구분한다.
- [x] 읽기 전용 독립 최종 검토 후 필요한 수정·검증을 완료하고 결과를 보고한다.

## 판단 기록

- Ruling: 사용자 승인된 설계의 4단계를 구체화해 바로 실행한다. 단계별 계획 재승인을 요청하지 않는다. 범위가 다르면 다음 단계의 API를 재조정해야 한다.
- Ruling: 기존 미커밋 결과를 소비하는 단계이므로 현재 checkout을 유지한다. 다른 작업과 섞일 수 있어 작업 전 파일 기준으로 변경 범위를 따로 기록한다.
- Ruling: NativeWind에는 정적 클래스, 웹에는 수치·색상 표현이 필요하다. 둘을 shared의 동일 variant/tone/size 정의에 두고 렌더러에 값을 복사하지 않는다. 향후 디자인 변경 시 shared의 두 표현을 함께 갱신해야 한다.

- Ruling: 새 UI 타입 검사 의존성 연결로 pnpm의 SVG peer context가 갱신되는 것은 허용한다. packages의 실제 버전·API importer와 ui/mobile의 React·RN·SVG 단일 인스턴스를 확인했다. 잘못되면 런타임 모듈 중복 위험이 있으므로 이 확인을 유지한다.

## 실행 결과

작업 전 모바일 타입 검사와 테스트 31개가 통과했다. 구현을 완료했다. 모바일의 두 컴포넌트 파일은 `@iambox/ui/native`를 재수출하고 화면 호출부는 변경하지 않았다. 공통 규칙과 색상으로 웹 HTML 렌더러도 제공한다. Next.js 앱은 생성하지 않았다.

### 검증 결과

| 검증 | 결과 |
| --- | --- |
| 공개 진입점 테스트 RED | 미구현 native/web exports로 11개 실패 확인 |
| `pnpm install --offline --lockfile-only --ignore-scripts` | 통과 |
| `pnpm install --frozen-lockfile --ignore-scripts` | 통과. 기존 store의 패키지만 재사용, 다운로드 0 |
| `pnpm typecheck:shared` | 공통 4패키지 통과. UI는 web/shared와 native/shared를 분리 검사 |
| `pnpm typecheck:mobile` | 통과 |
| `pnpm test:shared` | utils 2개, UI 12개 통과 |
| `pnpm --filter @iambox/mobile test` | 기존 31개 통과. 합계 45개 |
| Tailwind 실제 생성과 작업 전 두 컴포넌트 utility 비교 | 34개 규칙의 선언·상위 조건 모두 동일 |
| `CI=1 EXPO_NO_TELEMETRY=1 pnpm --filter @iambox/mobile exec expo export --platform ios --platform android --output-dir /tmp/iambox-stage4-export --clear --max-workers 2` | iOS·Android Hermes 번들 생성 통과 |
| lockfile 비교 | packages(실제 버전)·settings·overrides·API importer 동일. workspace/개발 의존성·일부 peer context 갱신 |
| ui/mobile의 실제 React·React Native·SVG module resolve 비교 | 세 라이브러리 모두 같은 인스턴스 |
| 변경 Markdown 파일 링크 확인, `git diff --check` | 통과. 현재 파일 링크 누락 없음 |

UI 단위 테스트는 실제 TSX·React·shared·색상을 읽고 Node가 실행할 수 없는 RN host만 대체한다. 테스트의 이벤트 전달 검증은 실제 기기 터치나 브라우저 이벤트 실행을 대체하지 않는다. 기기·시뮬레이터 화면·스크린리더·지도·밝기 실행, 웹 키보드·클릭·hydration·Next.js 빌드는 이번 단계에서 수행하지 않았다. API 소스를 수정하지 않아 서버 타입 검사·DB 검증은 재실행하지 않았다.

### 문제 확인과 수정

1. 새 manifest를 연결한 직후 pnpm test가 자동 설치를 먼저 실행하며 샌드박스 네트워크 오류가 발생했다. 설치를 중단하고 offline lockfile-only, 일반 권한 frozen 설치를 차례로 실행한 뒤 검증을 재개했다. 패키지 버전을 변경하지 않았고 기존 store에서 전부 재사용했다.
2. lockfile은 pnpm 12의 다중 YAML 문서라 단일 parse로는 비교할 수 없었다. parseAllDocuments로 합쳐 packages·설정·API를 비교했다. snapshots 전체 동일성은 새 UI devDependencies의 peer context 갱신 때문에 성립하지 않았다. 실제 버전·단일 인스턴스를 별도로 확인했다.
3. 최종 독립 검토에서 웹 primary 버튼의 포커스 외곽선이 currentColor(흰색)라 흰 배경에서 보이지 않는 문제(P2)를 발견했다. 실제 CSS를 PostCSS로 읽고 버튼 style과 연결한 테스트에서 expected #844CCF / actual #FFFFFF로 실패를 확인했다. shared focusColor와 CSS 변수를 연결해 수정했고 12개 UI 테스트와 공통·모바일 전체 타입 검사/테스트를 재실행해 통과했다. 이후 Tailwind와 양 플랫폼 export도 다시 확인했다.

### 최종 검토와 판단

읽기 전용 독립 검토는 원본 대비 native JSX·클래스·props·아이콘 보존, 플랫폼별 진입점·타입 경계, Tailwind 연결, lockfile의 기존 버전을 확인했다. 필수 지적 1개(흰 배경의 focus 표시)는 실패 테스트 → 수정 → 전체 검증으로 해결했다. 미뤄둔 minor 지적은 없다. 수정 후 검토자를 다시 실행하지 않고 회귀 테스트와 전체 검증으로 확인했다.

- Final: Ruling: 5단계 Next.js·hydration·브라우저 조작은 제외 — 4단계는 렌더러까지만 구현한다 — 통합 문제는 5단계에서 확인·보완해야 한다.
- Final: Ruling: 실제 기기 표시·터치·스크린리더는 제외 — 기기 실행 증거가 없으므로 완료로 주장하지 않는다 — 기기에서 스타일·터치 회귀가 있을 가능성은 후속 검증으로 남는다.
- Final: Ruling: Dialog·BottomSheet·지도·QR 밝기와 기존 미커밋 작업은 직접 검토 제외 — 공유 대상은 Button·Badge이고 나머지 소스는 수정하지 않는다 — 전체 네이티브 통합 동작은 기기에서 추가 확인해야 한다.

동시에 변경된 로고·헤더·화면·배너 에셋은 이번 단계 작업자가 수정하지 않았으며 아래 변경 목록에서 제외했다. 두 컴포넌트와 설정만 연결하고 다른 작업의 결과는 유지했다. 커밋을 생성하지 않았다.


## 변경 파일 전체

이번 단계 작업자가 수정·추가한 파일은 총 32개다. 링크는 현재 checkout의 실제 파일을 가리킨다.

| 파일 | 변경 |
| --- | --- |
| [README.md](/Users/jeongsu/Documents/study/iambox_app/README.md) | 현재 4단계 공통 UI 연결 상태 안내 |
| [docs/ADR.md](/Users/jeongsu/Documents/study/iambox_app/docs/ADR.md) | ADR-003의 UI 적용·진입점 상태 갱신 |
| [docs/ARCHITECTURE.md](/Users/jeongsu/Documents/study/iambox_app/docs/ARCHITECTURE.md) | 공통 UI 구조·peer·타입 검사 경계와 검증 결과 반영 |
| [docs/DESIGN_SYSTEM.md](/Users/jeongsu/Documents/study/iambox_app/docs/DESIGN_SYSTEM.md) | 공통 규칙 위치·웹 CSS·플랫폼별 사용법 안내 |
| [docs/PROJECT_STRUCTURE.md](/Users/jeongsu/Documents/study/iambox_app/docs/PROJECT_STRUCTURE.md) | UI 실제 트리·파일 책임·공통 검사 명령 갱신 |
| [docs/superpowers/plans/2026-10-02-shared-ui-stage4.md](/Users/jeongsu/Documents/study/iambox_app/docs/superpowers/plans/2026-10-02-shared-ui-stage4.md) | 단계 계획·판단·검증·전체 변경 링크 기록 |
| [docs/superpowers/specs/2026-10-02-nextjs-shared-packages-design.md](/Users/jeongsu/Documents/study/iambox_app/docs/superpowers/specs/2026-10-02-nextjs-shared-packages-design.md) | 4단계 완료와 5단계 미구현 상태 구분 |
| [mobile/README.md](/Users/jeongsu/Documents/study/iambox_app/mobile/README.md) | 재수출 경로와 이번 검증·기기 미검증 안내 |
| [mobile/components/ui/Button.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/components/ui/Button.tsx) | 기존 경로에서 native Button·타입 재수출 |
| [mobile/components/ui/Badge.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/components/ui/Badge.tsx) | 기존 경로에서 native Badge·타입 재수출 |
| [mobile/package.json](/Users/jeongsu/Documents/study/iambox_app/mobile/package.json) | @iambox/ui workspace 의존성 추가 |
| [mobile/tailwind.config.js](/Users/jeongsu/Documents/study/iambox_app/mobile/tailwind.config.js) | shared/native 소스를 클래스 탐색에 추가 |
| [mobile/tests/locationList.test.cjs](/Users/jeongsu/Documents/study/iambox_app/mobile/tests/locationList.test.cjs) | 실제 native 패키지 TSX도 변환하는 테스트 로더 연결 |
| [package.json](/Users/jeongsu/Documents/study/iambox_app/package.json) | 공통 검사 명령에 UI 포함 |
| [packages/README.md](/Users/jeongsu/Documents/study/iambox_app/packages/README.md) | 진입점·웹 CSS·클래스 탐색·peer·타입 검사 사용법 |
| [packages/ui/package.json](/Users/jeongsu/Documents/study/iambox_app/packages/ui/package.json) | native/web/CSS exports·optional native peers·개발 의존성·검사 명령 |
| [packages/ui/src/native/Badge.tsx](/Users/jeongsu/Documents/study/iambox_app/packages/ui/src/native/Badge.tsx) | 기존 View/Text 렌더링으로 공통 배지 규칙 소비 |
| [packages/ui/src/native/Button.tsx](/Users/jeongsu/Documents/study/iambox_app/packages/ui/src/native/Button.tsx) | 기존 Pressable·SVG props·클래스를 보존하며 공통 규칙 소비 |
| [packages/ui/src/native/index.ts](/Users/jeongsu/Documents/study/iambox_app/packages/ui/src/native/index.ts) | native 컴포넌트·props 진입점 |
| [packages/ui/src/shared/badge.ts](/Users/jeongsu/Documents/study/iambox_app/packages/ui/src/shared/badge.ts) | 공통 배지 props·tone·size 디자인 규칙 |
| [packages/ui/src/shared/button.ts](/Users/jeongsu/Documents/study/iambox_app/packages/ui/src/shared/button.ts) | 공통 버튼 props·variant·크기·색상·focus 규칙 |
| [packages/ui/src/web/Badge.tsx](/Users/jeongsu/Documents/study/iambox_app/packages/ui/src/web/Badge.tsx) | HTML span 배지와 웹 속성 확장 |
| [packages/ui/src/web/Button.tsx](/Users/jeongsu/Documents/study/iambox_app/packages/ui/src/web/Button.tsx) | Client HTML button·DOM SVG·onClick·접근성 이름 연결 |
| [packages/ui/src/web/index.ts](/Users/jeongsu/Documents/study/iambox_app/packages/ui/src/web/index.ts) | 웹 컴포넌트·props 진입점, native import 없음 |
| [packages/ui/src/web/styles.css](/Users/jeongsu/Documents/study/iambox_app/packages/ui/src/web/styles.css) | pressed opacity·브랜드색 키보드 포커스 표시 |
| [packages/ui/tests/components.test.cjs](/Users/jeongsu/Documents/study/iambox_app/packages/ui/tests/components.test.cjs) | 실제 컴포넌트 경계·6개 배지 조합·focus CSS 회귀 테스트 12개 |
| [packages/ui/tests/loadUI.cjs](/Users/jeongsu/Documents/study/iambox_app/packages/ui/tests/loadUI.cjs) | 실제 TSX 로딩과 네이티브 host 경계 대체, 웹 native 로드 차단 |
| [packages/ui/tests/native.types.ts](/Users/jeongsu/Documents/study/iambox_app/packages/ui/tests/native.types.ts) | native props·이벤트·disabled null과 DOM 혼합 거부 검증 |
| [packages/ui/tests/web.types.ts](/Users/jeongsu/Documents/study/iambox_app/packages/ui/tests/web.types.ts) | HTML props·이벤트와 native 혼합 거부 검증 |
| [packages/ui/tsconfig.json](/Users/jeongsu/Documents/study/iambox_app/packages/ui/tsconfig.json) | web/shared·DOM 타입 검사와 fixture 연결 |
| [packages/ui/tsconfig.native.json](/Users/jeongsu/Documents/study/iambox_app/packages/ui/tsconfig.native.json) | native/shared·React/NativeWind 검사, DOM lib 제외 |
| [pnpm-lock.yaml](/Users/jeongsu/Documents/study/iambox_app/pnpm-lock.yaml) | workspace·기존 버전 개발 의존성·peer context 연결 기록 |
