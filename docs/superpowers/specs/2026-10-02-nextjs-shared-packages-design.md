# Next.js 웹과 모바일 공통 패키지 설계

> 작성일: 2026-10-02. 1·2단계에서 공유 경계·패키지 설정을 정의하고, 3단계에서 공통 데이터·가격·검색·색상 코드를 모바일에 연결했다. 4단계에서 Button·Badge 공통 규칙과 native/web 렌더러를 모바일에 연결했다. 5단계에서 Next.js 기본 확인 화면을 로컬 3001에 연결했다.

## 사용자 요청과 완료 범위

- 기존 루트의 `api/`, `mobile/`을 유지하고 같은 pnpm 모노레포에 Next.js `web/`을 추가한다.
- 웹과 앱에서 공유할 수 있는 컴포넌트의 규칙, 데이터 타입, 순수 함수, 디자인 토큰을 공통 패키지로 관리한다.
- 웹은 기본 구조와 공통 UI를 로컬에서 확인하는 화면까지만 구현한다.
- 각 단계를 구현한 뒤 변경 파일, 동작 결과, 검증 결과를 보고하고 다음 단계로 넘어간다.
- 기존 모바일 화면의 표시, 터치 동작, 접근성, 지도와 QR 밝기 동작을 유지한다.
- 웹의 로그인·지도·결제·업무 API 연결 및 배포는 후속 제품 작업으로 둔다. 기존 백엔드의 업무 기능도 이번 구조 변경에서 추가하지 않는다.

## 1단계에서 확인한 이동 전 코드의 경계

| 이동 전 파일 | 의존성과 책임 | 결정 |
| --- | --- | --- |
| `mobile/theme/colors.json` | JSON 색상 토큰, 플랫폼 의존성 없음 | 공통 색상 원본으로 이동 |
| `mobile/utils/formatLocationPrice.ts` | 한국어 가격 표시, 플랫폼 의존성 없음 | 같은 표시 규칙을 앱과 웹에서 공유 |
| `mobile/utils/filterLocations.ts` | 이름·주소 검색과 사이즈 필터, `LocationPoint` 타입 참조 | 공통 데이터 타입을 참조하도록 분리한 뒤 공유 |
| `mobile/types/location.ts` | 지점 데이터에 React Native `ImageSourcePropType` 혼합 | 공통 지점 데이터와 모바일 이미지 타입 분리 |
| `mobile/components/ui/Button.tsx` | `PressableProps`, `react-native-svg`, NativeWind 클래스 | 공통 표시 props·variant 규칙과 플랫폼별 렌더링 분리 |
| `mobile/components/ui/Badge.tsx` | React Native `View`·`Text`, tone·size 규칙 | 공통 props·tone·size 규칙과 플랫폼별 렌더링 분리 |
| `mobile/components/ui/Dialog.tsx` | 네이티브 Modal, 접근성 포커스, 닫힘 페이드 | 이번에는 모바일 유지 |
| `mobile/components/ui/BottomSheet.tsx` | 네이티브 시트·제스처·키보드 연동 | 모바일 유지 |
| `mobile/utils/bottomSheetLayout.ts` | 순수 계산이지만 모바일 시트의 높이 정책 | 모바일 유지 |
| `mobile/utils/brightnessSession.ts` | 앱 상태와 기기 밝기의 세션 정책 | 모바일 유지 |
| `mobile/components/layout/`, `mobile/navigation/` | 앱 화면 배치·안전 영역·하단 탭 | 모바일 유지 |
| `mobile/features/`, `mobile/mocks/`, `mobile/assets/` | 앱 화면, 플랫폼 이미지와 mock 데이터 | 모바일 유지. 공통화는 실제 웹 사용이 생길 때 별도 검토 |

순수 함수라는 이유만으로 모두 공통 패키지로 옮기지 않는다. 앱과 웹에서 같은 규칙을 사용하는지가 이동 기준이다.

## 목표 구조와 책임

```text
iambox_app/
├── api/                         # 기존 NestJS 백엔드
├── mobile/                      # 기존 Expo / React Native 앱
├── web/                         # Next.js / TypeScript / App Router
│   ├── src/app/                 # layout, page, 전역 스타일
│   └── src/components/          # 웹 확인 화면의 조합과 상호작용
├── packages/
│   ├── contracts/src/           # 플랫폼 중립 데이터 타입
│   ├── utils/src/               # 가격 표시·지점 검색 규칙
│   ├── design-tokens/src/       # 공통 색상 원본
│   └── ui/src/
│       ├── shared/              # 공통 props와 디자인 규칙
│       ├── native/              # React Native 렌더링
│       └── web/                 # HTML 렌더링
└── docs/
```

| 패키지 이름 | 허용하는 책임 | 경계 |
| --- | --- | --- |
| `@iambox/contracts` | 지점 공통 데이터 타입 | React·React Native·DOM·NestJS·Prisma 의존성 없음. 현재 mock 모델은 확정된 API 응답 계약이 아님 |
| `@iambox/utils` | 가격 표시와 지점 필터 | `contracts`의 타입만 참조. 네트워크·스토리지·기기 API 사용 없음 |
| `@iambox/design-tokens` | 앱과 웹이 함께 사용하는 색상 | 플랫폼 의존성 없음. 색상 값과 현재 토큰 이름 유지 |
| `@iambox/ui` | Button·Badge의 공통 규칙과 플랫폼별 구현 | `shared`는 플랫폼 모듈을 참조하지 않음. `web`과 `native` 진입점 분리 |

각 앱은 필요한 패키지를 `workspace:*`로 선언한다. 패키지 간 상대 경로로 다른 패키지 소스에 접근하지 않는다. `ui`와 `utils`의 책임을 서로 연결하지 않고 순환 의존성을 만들지 않는다.

UI 소비자는 `@iambox/ui/native` 또는 `@iambox/ui/web`을 명시적으로 사용한다. 두 구현을 함께 내보내는 UI 루트 barrel은 만들지 않는다. React는 UI 패키지에서 peer dependency로 관리해 소비 앱의 React를 사용한다. React Native와 SVG 의존성은 네이티브 진입점에만 둔다.

## 데이터와 유틸리티 인터페이스

- 공통 `LocationData`는 현재 `LocationPoint`의 `id`, `name`, `latitude`, `longitude`, `address`, `priceFromKrw`, `priceBasis`, `badge?`, `availableSizes?`를 같은 타입으로 유지한다.
- 모바일의 `LocationPoint`는 `LocationData`에 `photoSource?: ImageSourcePropType`을 추가한다. 기존 mock 이미지의 `require()`와 지도·목록 소비자는 유지한다.
- 웹 이미지 표현은 웹에 둔다. 이번에 이미지 URL 필드나 서버 이미지 계약을 새로 확정하지 않는다.
- `formatLocationPrice(priceFromKrw: number | null): string`의 출력은 기존과 동일하다. `null`은 `요금 문의`, 숫자는 한국어 숫자 표기에 `원~`를 붙인다.
- `filterLocations<T extends LocationData>(locations: readonly T[], query: string, sizes: readonly string[]): T[]`로 입력의 확장 타입을 보존한다. 모바일의 이미지 필드가 반환 타입에서 사라지지 않아야 한다.
- 필터는 이름·주소 검색과 선택 사이즈 중 하나라도 이용 가능한 조건을 AND로 결합한다. 검색 문자열 정규화와 입력 순서 보존은 기존대로 유지한다.
- 아직 없는 로그인·결제·지점 조회 API 타입이나 HTTP 클라이언트를 선행 생성하지 않는다.

## 컴포넌트 공유 방식

같은 패키지에서 공통 규칙을 사용하고 실제 렌더링은 플랫폼별로 구현한다. 동일한 JSX를 모든 플랫폼에서 실행하는 설계는 이번에 채택하지 않는다.

| 컴포넌트 | 공통으로 관리할 항목 | 플랫폼별 항목 |
| --- | --- | --- |
| Button | `label`, `variant: primary \| link`(기본 primary), `disabled`, `accessibilityLabel`; variant별 색상·간격·높이·글자·아이콘 크기 규칙 | 네이티브 `PressableProps`·`onPress`·SVG props / 웹 button 속성·`onClick`·DOM 아이콘 |
| Badge | `label`, `tone: solid \| soft \| neutral`(기본 solid), `size: default \| compact`(기본 default); 색상·크기·모서리 규칙 | 네이티브 View·Text / 웹 span·CSS |

- 공통 UI 규칙은 `shared`에 단일 정의를 두고 두 렌더러가 소비한다. 같은 variant 값을 양쪽 구현에 각각 복사해 관리하지 않는다.
- 공통 규칙은 플랫폼에 종속된 `PressableProps`, `SvgProps`, DOM 이벤트 타입을 포함하지 않는다. 컴포넌트 고유 props는 UI 패키지에 두고 `contracts`에 넣지 않는다.
- 아이콘 슬롯과 `className`, 이벤트·접근성 확장 속성은 플랫폼별 props에 둔다. 앱의 기존 SVG 아이콘과 호출부의 동작을 보존한다.
- NativeWind/Tailwind가 사용하는 클래스는 완전한 문자열로 정의하고 공통 패키지 경로를 클래스 탐색 대상에 포함한다. 웹은 같은 색상 원본과 UI 규칙을 스타일에 연결한다.
- 모바일 `components/ui`는 Button·Badge를 네이티브 진입점에서 재수출할 수 있다. 기존 화면의 import 경로는 가능한 한 유지한다.
- 웹의 버튼은 기본 `type="button"`을 사용하고 비활성 상태와 키보드 조작을 지원한다. 공통 접근성 이름은 웹의 `aria-label`에 연결한다.
- 웹 상호작용 영역에만 Next.js Client Component 경계를 두며, 렌더 시 브라우저 전용 전역에 접근하지 않는다. 공통 패키지 사용이 hydration 오류를 만들지 않아야 한다.
- Dialog·Decorative·BottomSheet·ScreenContainer·AppHeader는 최초 공유 대상에 포함하지 않는다. 추가 공유는 웹의 실제 요구가 생길 때 별도 단계로 진행한다.

## Next.js 기본 웹과 개발 환경

- `web/src/app/layout.tsx`, `page.tsx`, 전역 스타일과 기본 메타데이터를 구성한다.
- 확인 화면에는 공통 색상, Button의 두 variant, Badge의 세 tone과 두 size, 버튼 클릭 결과, 공통 가격·필터 함수의 예시를 표시한다.
- 웹 전용 예시 데이터는 `web/`에서 정의하고 모바일 mock 이미지나 네이티브 라이브러리를 import하지 않는다.
- Next.js `transpilePackages`로 필요한 로컬 패키지를 연결한다. React Native Web alias는 추가하지 않는다.
- 백엔드는 기존 기본 포트 3000, 웹 개발 서버는 3001을 사용한다. 기본 확인 화면은 백엔드나 DB 실행 없이 확인할 수 있어야 한다.
- 루트에는 `dev:web`, `build:web`, `typecheck:web` 명령을 추가한다. 기존 모바일·백엔드 명령은 유지한다.
- 설치 시점의 Next.js 요구사항과 기존 Expo의 React·TypeScript 버전 호환성을 확인한다. 기존 전역 `react-dom` override가 웹에 적합한지도 함께 검토한다.
- 환경변수·인증·CORS 변경은 실제 API 연결 범위에서 결정한다.

## 단계와 확인 기준

| 단계 | 산출물 | 확인 기준 | 현재 상태 |
| --- | --- | --- | --- |
| 1. 공유 경계 | 이 설계 문서와 ADR-003 | 실제 의존성 대조, 공유·모바일 유지 대상 및 인터페이스 명시 | 완료 |
| 2. 워크스페이스 구성 | 패키지 manifest·의존성·TypeScript 설정, 워크스페이스 등록 | pnpm 패키지 인식, 의존성 경계 확인 | 완료: 설정 파싱·로컬 링크·기존 앱/API 타입 검사 확인 |
| 3. 토큰·타입·함수 공유 | 기존 코드 이동 및 모바일 소비자·테스트 연결 | 토큰 값·함수 동작 보존, 모바일 타입 검사와 관련 테스트 | 완료: 공통·모바일 타입 검사, 테스트 33개, iOS·Android export 통과 |
| 4. 공통 UI 적용 | Button·Badge 공통 규칙과 두 렌더러 | 모바일 타입 검사, 기존 호출부·스타일·접근성 유지 확인 | 완료: UI·모바일 타입 검사, 전체 테스트 45개, NativeWind utility 보존·양 플랫폼 export 통과. 기기 화면 미검증 |
| 5. Next.js 기본 앱 | 웹 기본 화면과 실행 명령 | 로컬 3001 실행, 공통 패키지 소비, 클릭·키보드 동작, 웹 빌드 | 완료: clean 웹 타입 검사·빌드, Chrome 21개 검사·375px 배치, 기존 테스트 45개 통과 |
| 6. 통합 검증·문서 | 최종 구조·디자인 사용법·실행 안내 | 앱·API·웹 타입 검사, 관련 테스트, Next.js 빌드, 웹·모바일 화면 확인 | 완료: 전체 타입·테스트 45개·API/웹 빌드·iOS/Android export, 프로덕션 Chrome 21개·iOS 공통 UI 확인. Android 기기·실기기·전체 네이티브 조작 미검증 |

2단계에서는 패키지 manifest와 의존성 경계를 구성한다. 소스 진입점과 exports는 3·4단계에서 실제 공유 코드가 생길 때 연결하며, 없는 파일을 exports로 선언하거나 의미 없는 placeholder 구현을 추가하지 않는다. 웹 생성과 실행 명령 연결은 5단계에서 수행한다. 각 단계의 상세 파일 목록과 검증 명령은 해당 단계 착수 시 구체화한다.

검증 실패는 해결한 뒤 다음 단계로 넘어간다. 기기나 실행 환경 때문에 수행하지 못한 검증은 결과 보고에서 구분한다. 문서에는 설계 채택과 실제 구현 완료를 따로 표시한다.

2단계의 준비 상태는 [2단계 기록](../plans/2026-10-02-shared-packages-stage2.md), 실제 코드 이동과 검증은 [3단계 기록](../plans/2026-10-02-shared-packages-stage3.md)에 기록한다. contracts·utils·design-tokens와 UI의 web/native는 실제 소스 타입 검사를 수행했다. UI 구현·검증은 [4단계 기록](../plans/2026-10-02-shared-ui-stage4.md)에 기록한다. 웹 소비자는 `@iambox/ui/web.css`도 읽으며 Next.js 생성과 실브라우저 확인을 완료했다. 자세한 결과는 [5단계 기록](../plans/2026-10-02-nextjs-web-stage5.md)을 따른다.

공통 TS source exports를 소비하는 모바일 tsconfig에 `allowImportingTsExtensions`를 설정했다. Next.js 소비자에도 이 옵션과 `transpilePackages`를 연결했다. 모바일 유틸리티 경로는 재수출로 유지하며 실제 함수 구현은 공통 패키지에만 있다.

## 설계 검토와 관련 문서

- 공통 타입에서 모바일 이미지 타입을 제거하고 필터의 제네릭으로 플랫폼별 확장 데이터를 보존한다.
- 공통 UI의 props·규칙과 플랫폼별 이벤트·아이콘을 분리해 기존 앱 호출부를 유지할 수 있게 한다.
- 패키지 경계와 웹·네이티브 진입점을 분리해 웹의 네이티브 모듈 로드를 막는다.
- 모바일 전용 순수 계산까지 일괄 이동하지 않고 이번 웹 확인 화면이 소비할 공유 코드만 선정한다.
- Next.js 웹을 사용자 서비스의 구현 완료로 설명하지 않고 로컬 공통 구조 확인으로 한정한다.

결정 배경은 [ADR-003](../../ADR.md#adr-003-nextjs-웹과-모바일의-공통-패키지를-구성한다), 현재 파일 배치는 [PROJECT_STRUCTURE.md](../../PROJECT_STRUCTURE.md), 실제 구조와 데이터 흐름은 [ARCHITECTURE.md](../../ARCHITECTURE.md), 모바일 디자인 규칙은 [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md)를 따른다. 후속 단계에서 실제 구조가 바뀌면 해당 문서도 함께 갱신한다.

## 최종 구조 도입 결과

6단계 통합 검증과 사용법 정리를 완료했다. 기존 api/mobile에 같은 저장소의 Next.js web과 4개 공통 패키지를 연결한 구조다. 별도 저장소 없이 웹을 확장할 수 있으며 이번 웹은 로컬 기본 화면까지만 제공한다. 상세 실행 조건·검증 증거·전체 변경 파일은 [6단계 기록](../plans/2026-10-02-monorepo-stage6.md)을 따른다. 인증·실제 지점 API·DB 업무 모델·결제·QR·배포는 후속 제품 작업이다.
