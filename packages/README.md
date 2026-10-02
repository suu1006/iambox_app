# 공통 패키지

> 2026-10-02: 3단계에서 공통 데이터·함수·색상을, 4단계에서 Button·Badge 규칙과 native/web 렌더러를 연결했다. 5단계에서 Next.js 기본 확인 화면을 연결했다.

| 패키지 | 현재 제공하는 진입점 | 내부 의존성 |
| --- | --- | --- |
| `@iambox/contracts` | `LocationData` 타입 | 없음 |
| `@iambox/utils` | `formatLocationPrice`, `filterLocations` | `@iambox/contracts` 타입 |
| `@iambox/design-tokens/colors.json` | 색상 JSON 원본 | 없음 |
| `@iambox/ui/native`, `@iambox/ui/web` | Button·Badge와 플랫폼별 props 타입 | `@iambox/design-tokens` |
| `@iambox/ui/web.css` | 웹 버튼 pressed/focus 상태 CSS | 없음 |

## 현재 상태

- 루트 `pnpm-workspace.yaml`의 `packages/*` 패턴으로 네 패키지를 등록한다.
- 내부 패키지는 `workspace:*`로 선언한다. React는 UI 패키지의 peer dependency이며 각 앱의 React를 사용한다.
- TypeScript는 기존 앱·API와 같은 `~6.0.3`을 사용한다. UI의 React 타입도 기존 모바일과 같은 선언 범위를 사용한다.
- 모바일이 contracts·utils·design-tokens·ui/native를 소비한다. API는 아직 공통 패키지를 소비하지 않는다.
- `LocationData`는 지점 표시 데이터이며 확정된 API 응답 계약이 아니다. 모바일 이미지 타입은 모바일의 `LocationPoint`에만 추가한다.
- 모바일의 가격·검색 유틸리티 파일은 utils를 재수출한다. 실제 함수 구현은 공통 패키지에만 있다.
- 색상의 단일 원본은 `design-tokens/src/colors.json`이다. TS import와 Tailwind require가 같은 JSON subpath를 사용한다. 색상 값은 이동 전 그대로다.
- 네 패키지에 실제 source exports와 typecheck를 연결했다. UI는 shared 규칙과 native/web 진입점을 제공하고 모바일은 기존 Button·Badge 경로에서 native를 재수출한다.
- Next.js `web/`은 네 공통 패키지의 의존성·변환 설정과 실행·빌드·타입 검사 명령을 제공한다. 사용자 요청으로 예시 화면·데이터를 제거해 홈은 비어 있다. layout은 색상 토큰·공통 UI CSS를 읽고, contracts/utils/UI 렌더러는 후속 화면에서 사용할 수 있다. API·DB 없이 로컬 3001에서 동작한다.

## TypeScript 설정

`tsconfig.base.json`은 공통 패키지 전용 설정이며 모바일·API가 이 설정을 상속하지 않는다. `ES2023`, `ESNext`, `Bundler`, `strict`, `noEmit`을 사용하고 JSON import와 모듈 단위 변환을 지원한다.

기반 설정은 `types: []`, `lib: [ES2023]`으로 Node·DOM·React Native의 전역 타입을 자동으로 포함하지 않는다. UI의 `tsconfig.json`은 web/shared·DOM·React 타입을, `tsconfig.native.json`은 native/shared·React·NativeWind 타입을 검사한다. native 검사에는 DOM lib를 추가하지 않는다.

contracts·utils는 `.ts` 소스를 exports로 제공하며 앱 bundler가 변환한다. utils 내부 export에도 `.ts` 확장자를 사용하므로 공통 기반 설정과 모바일 tsconfig에 `allowImportingTsExtensions: true`를 설정한다. Next.js에도 이 옵션과 `transpilePackages`를 연결했다. 공통 패키지의 별도 JS 빌드 산출물은 만들지 않는다.

utils의 Node 테스트는 기존 환경인 Node.js v22.23.3에서 `--experimental-strip-types`로 실제 package exports를 읽는다. UI 테스트는 TypeScript로 실제 TSX 진입점을 변환하며 Node가 실행할 수 없는 네이티브 host만 대체한다. 실제 브라우저·네이티브 기기 실행을 대체하는 검증은 아니다. 토큰은 JSON subpath로 제공해 TS와 CommonJS 설정에서 함께 사용한다.

네 패키지는 실제 typecheck를 실행한다. utils는 `tests/filterLocations.types.ts`도 검사해 소비자가 확장한 타입의 반환을 확인한다. UI의 플랫폼별 타입 fixture는 onPress/onClick 혼합을 거부하고 native의 disabled null·웹 HTML 속성을 확인한다.

## 사용 예

```ts
import type { LocationData } from '@iambox/contracts';
import { filterLocations, formatLocationPrice } from '@iambox/utils';
import colors from '@iambox/design-tokens/colors.json';

const priceLabel = formatLocationPrice(39000); // 39,000원~
const primaryColor = colors.primary.DEFAULT;
```

Tailwind 등의 설정에서는 `require('@iambox/design-tokens/colors.json')`을 사용한다. `filterLocations<T extends LocationData>`는 원본 순서·객체 참조·확장 필드 타입을 보존한다.

## UI 사용법

모바일의 기존 `components/ui` import는 그대로 사용한다. 직접 소비하면 `@iambox/ui/native`를 사용하고 앱의 NativeWind·SVG 설정을 유지한다. Tailwind의 content에는 `packages/ui/src/shared/**/*.ts`, `src/native/**/*.{ts,tsx}`를 포함한다. 기존 클래스 문자열을 이동했으며 화면 호출부는 변경하지 않았다.

웹 화면을 추가할 때 다음 진입점을 사용한다. 5단계의 확인 화면은 사용자 요청으로 제거했으며 공통 패키지와 layout의 CSS 연결은 유지한다.

```tsx
// 웹 layout / 전역 스타일 진입점
import '@iambox/ui/web.css';
// 웹 Client Component
import { Button, Badge } from '@iambox/ui/web';

<Button label="확인" onClick={() => {}} accessibilityLabel="예시 확인" />
<Badge label="M" tone="neutral" size="compact" />
```

웹 CSS는 pressed opacity와 브랜드색 키보드 focus 표시를 제공하므로 반드시 전역 진입점에서 한 번 읽는다. Button 기본 type은 button이며 HTML 속성·onClick과 DOM SVG 아이콘을 받는다. 접근성 이름은 aria-label로 연결하고 장식 SVG는 탐색에서 제외한다. native는 Pressable props·onPress와 SvgProps 아이콘을 받는다. 웹 Button만 Client 경계를 갖고 Badge는 순수 렌더러다.

shared는 각 variant/tone/size 정의에서 NativeWind 정적 클래스와 웹 수치·색상 규칙을 함께 관리한다. 디자인 변경 시 두 표현을 같은 정의에서 갱신한다. 네이티브 peer(React Native·SVG·NativeWind)는 optional이고 React는 필수 peer다. UI 자체 타입 검사에는 기존 모바일 버전의 native devDependencies를 사용한다. 웹 진입점은 native 모듈을 import하지 않는다.

## 후속 연결 기준

1. 3단계 완료: `contracts`, `utils`, `design-tokens`에 실제 코드·exports를 연결하고 모바일 dependencies에 추가했다.
2. 4단계 완료: UI의 `src/shared`, `src/native`, `src/web`과 `@iambox/ui/native`, `@iambox/ui/web` 진입점을 연결했다. 두 플랫폼을 함께 export하는 루트 barrel은 제공하지 않는다.
3. 5단계 완료: Next.js가 웹 진입점만 사용하며 공통 버튼·키보드·색상·배지·검색·가격을 로컬 브라우저에서 확인했다.

패키지 간 파일을 상대 경로로 직접 참조하지 않고 등록된 패키지 이름과 명시한 exports를 사용한다. 공통 데이터와 순수 함수에는 React Native·DOM·NestJS·Prisma를 의존시키지 않는다.

## 확인 명령

루트에서 실행한다.

```bash
pnpm -r list --depth -1
pnpm --filter '@iambox/*' list --depth 0
pnpm typecheck:shared
pnpm test:shared
pnpm typecheck:mobile
pnpm --filter @iambox/mobile test
```

4단계 검증: 공통 네 패키지(웹·네이티브 UI 분리 검사)와 모바일 타입 검사, utils 2개·UI 12개·모바일 31개 테스트, iOS·Android Expo export가 통과했다. 실제 Tailwind 출력에서 이동 전 UI utility 34개가 동일하게 생성됨을 확인했다. 기기·시뮬레이터 화면 실행과 Next.js 웹 검증은 이번 단계에서 수행하지 않았다.

5단계 검증: 웹 clean 타입 검사·빌드, 공통/모바일 검사·테스트 45개, Chrome 동작 검사 21개가 통과했다. 웹이 native를 읽지 않으며 React/React DOM 19.2.3을 유지한다. [웹 실행 안내](../web/README.md)와 [5단계 기록](../docs/superpowers/plans/2026-10-02-nextjs-web-stage5.md)을 참고한다.

설계와 단계별 범위는 [공통 패키지 설계](../docs/superpowers/specs/2026-10-02-nextjs-shared-packages-design.md), 현재 배치는 [PROJECT_STRUCTURE.md](../docs/PROJECT_STRUCTURE.md), 결정 배경은 [ADR-003](../docs/ADR.md#adr-003-nextjs-웹과-모바일의-공통-패키지를-구성한다), 검증 기록은 [3단계 구현 기록](../docs/superpowers/plans/2026-10-02-shared-packages-stage3.md), [4단계 구현 기록](../docs/superpowers/plans/2026-10-02-shared-ui-stage4.md)을 따른다.

## 통합 검증과 변경 기준 (2026-10-02, 6단계)

앱과 웹은 같은 contracts·utils·토큰 소스를 읽으며 React도 같은 인스턴스로 해석한다. UI는 각 플랫폼 subpath만 소비한다. 웹 프로덕션 페이지 trace에 네이티브 모듈이 없음을 확인했다. API는 독립적인 NodeNext 설정과 Prisma 생성 순서를 유지하며 아직 공통 패키지를 사용하지 않는다.

- 데이터·순수 함수 변경: 공통 타입/테스트와 두 소비자 타입 검사를 실행한다.
- Button·Badge 규칙 변경: native/web 타입·UI 테스트와 앱/웹 빌드·화면을 확인한다.
- 색상 변경: JSON 원본만 수정하고 NativeWind 탐색·웹 스타일·두 플랫폼 화면을 확인한다.
- 실제 API 연결: LocationData를 현재 응답 계약으로 간주하지 않고 DTO·요청/응답 계약부터 정의한다.

이번에는 전체 타입 검사, 테스트 45개, API/웹 빌드, iOS·Android export, 프로덕션 Chrome 검사 21개, iOS 공통 UI 화면 확인이 통과했다. 실기기·Android 화면과 실제 업무 API 연동은 포함하지 않는다. [6단계 상세 기록](../docs/superpowers/plans/2026-10-02-monorepo-stage6.md)을 따른다.
