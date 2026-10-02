# Architecture

> 기준일: 2026-10-02. 현재 코드와 예정 구조를 구분한다. 제품 범위는 [PRD.md](PRD.md)를 따른다.

## System Overview

현재 서로 구분된 흐름:

```text
Expo → mobile/index.ts → App.tsx → 하단 탭 / 홈·출입QR mock 화면 / 예시 지점 지도 / 나머지 임시 화면
HTTP GET / → AppController → AppService → Hello World!
서버 초기화 → PrismaModule → PrismaService → PostgreSQL 연결
연결 확인 CLI → PrismaService → SELECT current_database() → 결과 출력
```

목표 흐름 (**예정**, 모바일 API 호출과 업무 모델은 미구현):

```text
React Native / Expo → HTTP REST API → NestJS → Prisma → PostgreSQL
```

모바일에 DB 접속 정보를 넣거나 PostgreSQL에 직접 연결하지 않는다.

## 공통 패키지 워크스페이스 (2026-10-02, 6단계)

- `pnpm-workspace.yaml`은 `mobile`, `api`, `web`과 `packages/*`를 등록한다. 루트를 포함해 pnpm이 인식하는 프로젝트는 8개다.
- `@iambox/contracts`, `@iambox/utils`, `@iambox/design-tokens`, `@iambox/ui`의 manifest·TypeScript 설정을 구성했다. `utils → contracts`, `ui → design-tokens`는 `workspace:*`로 연결한다.
- contracts·utils·design-tokens에 실제 소스·exports·typecheck를 연결하고 모바일이 `workspace:*`로 사용한다. UI는 shared 규칙과 native/web 렌더러를 제공하며 모바일이 ui/native를 재수출한다. API는 공통 패키지를 소비하지 않는다.
- `LocationData`에는 플랫폼 중립 데이터만 둔다. 모바일 `LocationPoint`는 이 타입에 `ImageSourcePropType`의 `photoSource`를 추가한다. 공통 데이터는 확정된 API 응답 계약이 아니다.
- 가격 표시와 검색의 실제 구현은 utils에 있다. 모바일의 기존 유틸리티 경로는 재수출하며 필터는 제네릭으로 확장 타입과 원본 객체·순서를 보존한다.
- 색상의 단일 원본은 `packages/design-tokens/src/colors.json`이다. 모바일 TS import와 Tailwind require가 `@iambox/design-tokens/colors.json`을 읽는다. 색상 값은 이동 전과 동일하다.
- 공통 TS 소스의 명시적 `.ts` export를 위해 공통 기반 설정과 모바일 tsconfig에 `allowImportingTsExtensions`를 지정했다. 기존 Expo 기반 설정과 API NodeNext 설정은 유지한다. Metro는 기존 `expo/metro-config`의 monorepo 자동 설정을 사용한다.
- UI의 Button·Badge는 `src/shared`의 플랫폼 중립 props·규칙을 사용하고 `@iambox/ui/native`, `@iambox/ui/web`으로 렌더러를 나눈다. 웹은 HTML button/span이며 웹 Button만 Client 경계를 갖는다. 웹 소비자는 `@iambox/ui/web.css`로 pressed/focus 스타일을 읽는다. 모바일 Tailwind는 shared/native 소스를 탐색한다.
- UI는 web/shared와 native/shared 타입 검사를 분리한다. React는 필수 peer, React Native·SVG·NativeWind는 optional peer이며 타입 검사용 devDependencies는 기존 모바일 버전을 사용한다. 두 진입점을 함께 export하는 루트 barrel은 없다.
- 네 공통 패키지·모바일 타입 검사, utils 2개·UI 12개·모바일 31개 테스트, iOS·Android Expo export가 통과했다. 실제 Tailwind 출력에서 이전 UI utility 34개가 동일함을 확인했다. 이 내용은 4단계 검증 기록이며 당시 기기 화면·웹 브라우저 조작은 확인하지 않았다. 5·6단계의 추가 검증은 아래 기록을 따른다.
- Next.js `web/`은 로컬 3001의 기본 실행 구조다. 공통 코드 확인용 예시는 사용자 요청으로 제거했고 홈 page는 null을 반환한다. layout은 색상 토큰·공통 UI CSS 연결을 유지한다. 예시 Client Component와 지점 데이터는 제거했으며 API·DB 없이 실행한다. 업무 API·인증·배포는 후속 제품 작업이다.
- Next.js 16.3.8과 기존 React/React DOM 19.2.3을 사용한다. 공통 네 패키지의 transpilePackages·Turbopack root·웹 allowImportingTsExtensions를 연결했다. typecheck는 next typegen을 먼저 실행하며 clean .next 상태에서도 통과한다.
- 웹 타입 검사·빌드와 Chrome 동작 검사 21개가 통과했다. 클릭·키보드·disabled·focus·검색·사이즈·초기화·요금·배지·375px 배치를 확인했고 브라우저 오류·경고는 없었다. 공통/모바일 테스트 45개도 통과했다. 프로덕션 페이지 trace에 native 모듈은 없다.

6단계에서 공유·모바일·API·웹 타입 검사, 테스트 45개, API/웹 빌드, iOS·Android export를 통합 확인했다. 프로덕션 웹 브라우저 검사 21개와 iOS 공통 UI·지점 목록의 배지/가격 표시를 확인했다. API는 기존 DB 연결과 GET / 200을 확인했지만 앱·웹의 업무 API 연동은 없다. Android/실기기 화면·밝기·전체 네이티브 조작은 미검증이다. 실행 환경 조정과 근거는 [6단계 기록](superpowers/plans/2026-10-02-monorepo-stage6.md)을 따른다.

설계 기준은 [ADR-003](ADR.md#adr-003-nextjs-웹과-모바일의-공통-패키지를-구성한다), 패키지 준비 상태와 연결 방법은 [packages/README.md](../packages/README.md), 단계별 범위는 [상세 설계](superpowers/specs/2026-10-02-nextjs-shared-packages-design.md)를 따른다.

## Frontend Architecture

### 마이페이지 (2026-10-01)

- `features/my/MyContent.tsx`를 `App.tsx`의 마이 탭에 연결한다. `ScreenContainer` 안에서 프로필·바로가기·이용 관리·고객지원·로그아웃·법적 문서 링크를 스크롤하고 기존 하단 탭은 고정한다. 이용후기·이용 중인 공간 요약 카드·메뉴 구분선은 없다. 큰 글자 설정에서는 바로가기를 2열로 배치한다.
- `assets/my/`의 개별 SVG 12개를 기존 transformer로 import한다. 모두 실제 벡터 도형이며 내장 PNG·base64는 없다. `currentColor`와 색상 토큰으로 프로필·강조·메뉴 색상을 지정한다. 공통 chevron과 하단 탭 SVG는 재사용한다.
- 나의 박스는 `onMyBoxPress` 콜백으로 출입QR 내 공간 탭에 연결한다. 이용 내역·문의는 기존 `mocks/access.ts`, 그 외 항목은 `mocks/my.ts`의 예시·준비 안내를 공통 `InfoDialog`로 표시한다. 이용약관과 개인정보처리방침도 각각 별도 제목의 모달을 열지만 정식 법적 본문은 제공하지 않는다. 로그인·로그아웃 처리, 알림 권한, 예약·결제·문의 전송, API는 이번 UI 범위에 포함하지 않는다.

### 공통 구성

- `mobile/index.ts`가 `registerRootComponent(App)`으로 앱을 등록한다.
- `App.tsx`의 `useState`로 홈 · 지점찾기 · 출입QR · 택배 · 마이 탭 선택을 관리한다. `Pressable`에 선택 상태와 탭 접근성 역할을 제공한다.
- `react-native-safe-area-context`로 안전 영역을 반영하고 `react-native-svg`와 SVG transformer로 `assets/nav-*.svg` 탭 아이콘을 표시한다. 선택 탭은 보라색이고 중앙 출입QR은 원형 버튼으로 강조한다. 같은 SVG를 임시 콘텐츠 아이콘에도 재사용한다. QR SVG는 모양과 전달받은 색상만 표현하며 원형 배경과 그림자는 View에서 관리한다. 색상은 `packages/design-tokens/src/colors.json`의 primary 기준 디자인 토큰으로 관리하며 Tailwind와 SVG가 함께 사용한다([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)). 홈·출입QR·마이 콘텐츠는 스크롤 가능하고 지도는 남은 화면 높이를 사용한다. 하단 탭은 지점찾기의 지도·목록과 지점 상세를 포함한 모든 탭 화면에서 고정한다. 지점찾기 지도·목록 화면 상단에는 검색창과 필터만 표시하고, Android 뒤로가기는 `App.tsx`가 기억한 진입 전 탭으로 돌아간다. 홈은 소개·서비스 카드·이벤트·후기 정적 블록, 출입QR은 mock 내 공간 화면, 지점찾기는 예시 지도, 마이는 예시 프로필·메뉴 화면이며 택배는 임시 안내 화면이다.
- `App.tsx`는 탭·QR 표시 상태와 배치를 담당하고 `components/layout`의 AppHeader, PlaceholderContent, BottomTabBar와 `features/home/HomeContent`, `features/access/AccessContent`·`QrAccessModal`, `features/locations/LocationsContent`, `features/my/MyContent`로 UI를 분리한다. 여러 화면이 쓰는 Button·Badge는 `components/ui`에서 공통 패키지의 native를 재수출한다. 모바일 전용 Decorative·InfoDialog는 `components/ui`, 스크롤 화면 뼈대 ScreenContainer는 `components/layout`에 둔다. 탭 정의와 타입은 `navigation/tabs.ts`에 둔다. 화면 라우터, 전역 상태 관리 라이브러리, 영속 상태 저장은 없다. QR 밝기 수명 주기는 `features/access/useQrBrightness`에서 관리한다.
- 홈·마이페이지·공통 헤더의 브랜드는 `components/layout/BrandLogo`가 `assets/iambox-logo.svg`를 정적 import해 표시한다. 원본 PNG를 참고해 경로로 재구성한 로고이며 대표 브랜드 색상과 368×80 비율을 유지한다. 지점 상세·지도 마커는 같은 `iambox-logo-symbol.svg`를 사용한다. 원본 `iambox-logo-source.png`는 비교용으로 보관하고 런타임에 import하지 않는다. 현재 벡터 구현은 [브랜드 로고 SVG](../mobile/assets/iambox-logo.svg)에서 확인한다.
- 홈은 큰 물품 보관 카드와 오른쪽 서비스 2개, 원형 바로가기 4개, 배너 순으로 구성한다. 이벤트 배너는 사용자 제공 시안을 변환한 `assets/home-event-*.png` 3장을 `Image`로 자동 전환하며 배너 터치 동작은 없다. `HomeContent`의 `onLocationsPress` 콜백으로 기존 지점찾기 탭에 연결하고, 나머지 서비스는 공통 `InfoDialog`로 준비 안내를 표시한다. 아이콘은 `assets/home-*.svg` 7개를 import한다. 서비스 카드 3개는 선택 시안의 PNG를 추적한 벡터이고, 바로가기 4개는 선택한 라인 시안의 윤곽을 단순화한 32×32 벡터 SVG이며 SVG 안에 래스터 이미지를 내장하지 않는다. 바로가기는 `currentColor` 선에 `primary` 토큰을 전달하며 필터·그라데이션 없이 32×32로 표시한다. 정적 import를 빌드 시 네이티브 컴포넌트로 변환하므로 런타임 SVG 다운로드·문자열 파싱은 없다. 상세 신청·문의와 API는 연결하지 않았다.
- 지점찾기 탭은 `LocationsContent`에서 상단 검색·필터·예시 안내·지도와 선택 지점 상세를 관리한다. `LocationMap`은 실행 환경·인증 준비 상태를 확인한 뒤 네이버 SDK를 지연 로드한다. `NaverLocationMap`은 한국어 기본 지도와 `mockLocations` 3개를 표시하며, 초기 카메라는 강남·서초 주변 확대 수준으로 설정한다. 성수는 지도를 북쪽으로 이동하면 확인할 수 있다. `LocationMarker`는 사용자 검토를 거친 축소 시안의 120×76 크기·3px 테두리·하단 꼬리의 말풍선에 사용자 제공 로고의 왼쪽 심볼·지점명·시작 가격을 표시한다. iOS 새 아키텍처의 캡처에서 RN Text·비동기 PNG가 누락되는 현상이 있어, 말풍선·텍스트·원본 대표 색상을 유지하고 윤곽을 정리한 벡터 심볼을 독립 SVG 레이어로 렌더링한다. 표시 데이터·선택 변경은 SDK가 읽는 최상위 자식 key로 반영하고 View에 `collapsable={false}`를 설정한다. 마커 선택 시 예시 주소·요금 상세를 같은 탭 안의 오버레이 화면으로 연다. 상세 뒤의 지도를 유지해 복귀 시 카메라를 보존하고 배경 터치·접근성을 막는다. 뒤로가기 버튼·Android 하드웨어 뒤로가기·iOS 접근성 escape로 상세를 닫는다. `formatLocationPrice`는 원화 시작 요금과 `요금 문의` 표시를 공용으로 사용한다. 실제 API·과금 기준·공간 선택은 미구현이다.
- 지도 하단에는 `components/ui/BottomSheet`를 같은 지도 영역의 형제 오버레이로 배치한다. `@gorhom/bottom-sheet 5.2.14`와 `react-native-gesture-handler ~2.32.0`을 사용하고 `App.tsx`의 `GestureHandlerRootView`에서 제스처를 처리한다. 지점찾기의 지도/시트는 헤더·고정 하단 탭·이미 적용된 safe area를 제외한 남은 부모 높이를 사용한다. 탭 높이나 안전 영역을 다시 빼지 않는다. 기본 높이는 120px·부모 높이의 45%·85%이며, 작은 영역의 접힘 높이는 부모의 30%를 기준으로 줄이되 측정한 손잡이·헤더 높이 이상으로 유지하고 나머지 높이 순서를 보정한다. 큰 글자 설정으로 헤더가 커지면 펼침 높이도 부모 범위 안에서 늘린다. 고정 스냅을 위해 동적 높이 계산을 끄고 아래로 끌어 완전히 닫는 동작과 배경 dim을 사용하지 않는다. 손잡이 터치·드래그·스크린리더 증감 액션으로 높이를 바꾸고, Android 뒤로가기는 상세 닫기 → 펼친 시트 접기 → 진입 전 탭 복귀 순서로 처리한다. 상세가 열리면 기존 지도와 시트 모두 배경 터치·접근성에서 제외하고 마운트는 유지한다. `LocationList`는 `BottomSheetFlatList`로 예시 목록과 행을 한 파일에서 렌더링한다. 접힘·이동 중에도 목록을 숨기지 않으며, 초기 10개·후속 배치 최대 10개·5개 화면 높이의 렌더 윈도우로 가상화한다. 전체 결과 데이터를 전달하고 스크롤에 따라 행을 추가 렌더링하며 API 페이지 조회는 미구현이다. 부모의 `highlightedLocationId`로 목록·마커를 강조하고 `selectedLocation`은 상세 표시만 담당한다. 목록 행과 마커를 누르면 같은 지점 상세를 연다. 별도 더보기는 없다. `filterLocations`가 이름·주소 검색과 선택 사이즈 중 하나라도 이용 가능한 조건을 결합하고 지도·목록에 같은 결과 배열을 전달한다. `LocationSearchHeader`는 고정 검색창·필터 버튼, `LocationFilterModal`은 사이즈 임시 선택·취소·적용을 담당한다. 실제 예약·API·목록 선택 시 카메라 이동은 후속 범위다.
- 출입QR 탭의 `AccessContent`는 `mocks/access.ts`의 정적 이용 정보와 안내 데이터를 표시한다. 남은 14일은 시안 확인을 위한 2026-09-30 기준 고정 값이며 실시간 계약 상태가 아니다. QR 버튼은 `App.tsx`의 `QrAccessModal`을 열며, 다른 안내는 `useInfoDialog`와 공통 `InfoDialog`(React Native `Modal`)로 열고 닫는다. 안내 모달은 닫힘 페이드 동안 마지막 내용을 유지하고, 열릴 때 제목으로 접근성 포커스를 옮긴다. QR 발급, 지도 호출, 문의 전송은 수행하지 않는다. 아이콘 SVG 6개는 기존 transformer로 사용한다. 보관함 그림은 사용자 요청에 따라 제공 원본 `assets/imbox_storage_A-024.svg`를 같은 transformer로 import해 표시한다. 기존 장식 영역 안에서 `width="100%"`, `height="100%"`, `preserveAspectRatio="xMidYMid meet"`로 원본 비율을 유지한다. 이 SVG는 PNG를 base64로 두 번 포함한 약 3.5MB 파일이므로 내장 이미지 데이터도 JS 번들에 포함된다.
- QR 안내창이 열리고 앱이 활성 상태일 때 `expo-brightness ~57.0.2`로 밝기를 1(최대)로 설정한다. 닫기·뒤로가기·탭 전환·언마운트·앱 비활성화 시 복원하고, QR을 유지한 채 앱에 돌아오면 그 시점의 밝기를 새로 저장한 뒤 다시 높인다. iOS와 기존 앱 밝기를 쓰던 Android는 저장한 값을 복원하고, 시스템 밝기를 쓰던 Android는 `restoreSystemBrightnessAsync`로 시스템 밝기 사용 상태를 복원한다. 시스템 설정 변경 API와 권한 요청은 사용하지 않는다. `utils/brightnessSession`은 읽기·적용·복원을 직렬화하고 닫힌 뒤 완료된 읽기 결과는 무시하며, 실패 시 원래 값을 보존해 후속 정리에서 복원을 재시도한다. 재마운트 간에도 같은 세션을 사용한다.
- Android의 네이티브 `Modal`은 별도 Dialog 창이라 Activity 밝기 적용을 위해 QR만 앱 루트의 오버레이로 표시한다. 배경 콘텐츠·탭의 터치와 접근성 탐색을 막고 하드웨어 뒤로가기를 닫기에 연결한다. iOS는 공통 `InfoDialog`의 네이티브 모달 페이드를 사용한다. 두 플랫폼 모두 같은 `DialogCard`로 안내 내용을 그린다. 네이티브 밝기 모듈이 없는 기존 개발용 앱과 웹에서는 밝기 변경을 건너뛰고 QR 안내를 표시한다. 네이티브 의존성 추가 후 개발용 앱 재빌드가 필요하며 실제 기기 밝기·자동 밝기 복원 확인은 별도 검증 대상이다.
- NativeWind 4와 Tailwind CSS 3의 `className`으로 스타일을 작성한다. `global.css`는 Tailwind 진입점이며 `tailwind.config.js`에서 클래스 탐색 경로(`App.tsx`, `components/`, `features/`)와 색상 토큰을 지정한다. Metro는 SVG transformer와 NativeWind를 함께 적용하며 `inlineRem: 16`으로 기존 간격을 유지한다. 네이티브 hairline·QR 그림자는 BottomTabBar의 StyleSheet에 두고 지도 SDK의 크기는 NaverLocationMap의 StyleSheet로 지정한다.
- Babel은 Expo/NativeWind preset을 사용한다. pnpm에서 JSX 런타임을 찾도록 `react-native-css-interop`를 직접 선언하고 Reanimated/Worklets는 Expo 호환 버전을 사용한다. Metro peer는 React Native와 같은 0.86.3으로 고정한다.
- HTTP 클라이언트, API base URL, 인증 토큰 처리, 요청 캐시는 없다. 호출 방식은 첫 연동 단계에서 결정한다.
- 지도 라이브러리는 `@mj-studio/react-native-naver-map` `2.9.0`이며 기존 `react-native-maps` 의존성은 제거했다. `expo-dev-client`로 개발용 앱을 사용하고 `expo-build-properties`로 네이버 Maven 저장소를 등록한다. `app.config.ts`는 `.env.local`의 `NAVER_MAP_CLIENT_ID`를 네이티브 인증 설정에 주입하고 JS에는 설정 여부를 전달한다. 신규 개발용 앱 식별자 기본값은 두 플랫폼 모두 `com.iambox.app`이며 환경변수로 바꿀 수 있다. 로컬 Client ID 설정으로 iOS 시뮬레이터 지도를 확인했으며 Android와 실기기 실행은 대기 중이다. 행정구역별 집계는 앱에서 별도로 구현할 예정이며 클러스터 패키지·내 위치 권한·QR·결제 SDK는 도입하지 않았다.
- Xcode 27 / iOS 27 빌드에서는 `expo-build-properties`의 `ios.enableSceneSupport: true`로 UIKit scene lifecycle을 사용한다. prebuild가 `UIApplicationSceneManifest`와 `ExpoReactNativeFactoryProvider` 연결을 생성하고 `ExpoAppSceneDelegate`가 화면을 시작한다. SDK 57 기본 설정으로는 컴파일에 성공해도 iOS 27에서 실행 직후 종료되므로, 생성된 Swift 파일 대신 `app.config.ts`에 설정을 유지한다.
- 개발 서버를 여는 Expo QR은 제품의 출입 QR 기능이 아니다.

향후 화면 이동과 기능이 필요해질 때 해당 구조만 추가한다. 파일 배치 기준은 [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)를 따른다.

## Backend Architecture

- `main.ts`: dotenv와 reflect-metadata 로드, Nest 앱 생성, 종료 훅 활성화, `PORT` 또는 기본 3000에서 수신한다.
- `AppModule`: `AppController`, `AppService`를 등록하고 `PrismaModule`을 import한다.
- `AppController`: `GET /`를 받아 AppService에 위임한다. Controller는 HTTP 입력·출력 경계를 담당한다.
- `AppService`: 현재 고정 문자열만 반환한다. 기능 추가 시 Service가 해당 업무 처리를 담당한다.
- `PrismaModule`: PrismaService를 제공하고 export한다. 전역 모듈이 아니므로 사용할 모듈에서 import한다.
- `PrismaService`: 생성된 PrismaClient를 상속하고 PrismaPg 어댑터로 연결한다. `DATABASE_URL`이 없으면 생성 시 오류, 모듈 초기화 시 `$connect()`, 종료 시 `$disconnect()`를 실행한다.
- Auth, Users, Locations, Reservations, Payments, QR 모듈은 없다. Repository 계층도 없다.

`GET /` 자체는 DB를 조회하지 않지만 서버 부팅에는 Prisma 초기화가 포함된다. 이 경로를 DB 상태 검사 API로 취급하지 않는다.

## Database Architecture

PostgreSQL provider와 Prisma Client 생성 설정만 있다. 모델·관계·migration은 없다.
CLI 접속 설정은 `api/prisma.config.ts`, 서버 접속 설정은 PrismaService가 `DATABASE_URL`에서 읽는다. 생성된 클라이언트는 `api/src/generated/prisma/`에 위치하며 CommonJS 형식이다.
도메인 관계 후보와 미확정 정책은 [DATABASE.md](DATABASE.md)에만 관리한다.

## API Architecture

현재 HTTP 엔드포인트는 `GET /` 하나이고 응답은 문자열이다. 업무용 REST API와 JSON 통신은 예정이며 공통 응답 envelope는 없다.
전역 prefix, URI 버전, 인증 Guard, 전역 ValidationPipe, 커스텀 예외 필터·응답 interceptor, CORS 활성화 코드가 없다. `/api/v1`을 현재 주소로 사용하지 않는다.
구체적인 계약은 [API.md](API.md)를 따른다.

## Data Flow

현재 DB 확인:

```text
pnpm --filter @iambox/api db:check
→ Prisma Client 생성 및 서버 빌드
→ Nest application context(PrismaModule)
→ PrismaService.$queryRaw로 DB 이름 조회
→ 콘솔 출력 → context 종료 / DB 연결 해제
```

지점 탐색 (**예정**):

```text
사용자 → 지도/목록 화면 → 지점 조회 API
→ 지점 Controller → Service → Prisma → PostgreSQL
→ 조회 결과 응답 → 화면/마커 표시
```

예시 지도와 mock 가격 마커·지점 상세는 모바일 코드에 구현했다. 예정 흐름의 지점 API·모델은 아직 없으며 경로와 응답 형태도 TBD다.

## 지점찾기 지도 설계와 단계별 진행

> 2026-09-30 사용자가 지도 제공자를 네이버로 변경하도록 승인했다. 기본 지도는 Client ID를 설정한 iOS 개발용 앱에서 실행 확인했다. 2026-10-01에는 별도 요청으로 단순 가격 마커·mock 상세를 구현했다. 같은 날 바텀 시트 예시 목록·선택 강조·상세 이동을 추가했다. 아래의 행정구역 집계·특가·지도/목록 모드 전환·카메라 연동·규모 검증은 예정 설계다.

### 목적과 범위

- 사용자가 설명한 현재 규모는 약 300개 지점이며 앞으로 증가할 수 있다.
- 지도 축소 시 강남구·서초구처럼 행정구역별 정확한 지점 개수를 표시하고, 확대 시 개별 지점의 가격·특가 문구·특징을 표시한다. 지도와 지점 목록의 선택 상태를 연결한다.
- 지도는 `@mj-studio/react-native-naver-map`을 사용하고 행정구역 집계는 앱의 지점 데이터로 계산한다. `react-native-map-clustering`과 직접 `supercluster` 연결은 모두 거리 기반 군집이므로 이번 행정구역 개수 표시에 필요하지 않다. 당초 선택했던 클러스터 패키지는 설치하지 않고 도입을 보류했다. 군집별 최저가 집계는 요구하지 않는다.
- 이번 범위는 모바일 지도·마커·목록이다. 현재 지점 API·DB 모델과 실제 지점 데이터가 없으므로 화면 확인에는 예시 데이터를 사용한다. 실제 300개 지점의 주소·가격을 임의로 만들어 운영 데이터처럼 표시하지 않는다.
- API·DB 연동, 상세 예약 화면, 내 위치 권한, 길찾기는 후속 범위로 둔다. 검색·사이즈 필터는 2026-10-01 별도 사용자 요청으로 예시 데이터에 구현했다.

### 지도와 행정구역 집계 기준

- iOS·Android 모두 네이버 기본 지도(`Basic`, 한국어)를 사용한다. Expo Go에서는 해당 SDK가 없어 준비 안내를 표시한다. 실제 확인은 네이버 Client ID를 설정한 개발용 앱에서 수행한다. Google/Apple 지도로 대체하지 않는다.
- `@mj-studio/react-native-naver-map`은 `2.9.0`으로 고정하고 Expo 패키지는 SDK 57 호환 버전을 설치했다. 타입·번들·설정 검증과 네이티브 컴파일·실행 검증을 구분한다. RN 0.86.3의 iOS 시뮬레이터 실행은 확인했으며 Android 네이티브와 실기기 호환성은 미확인이다.
- 네이버 SDK의 `Region.latitude/longitude`는 중심점이 아니라 남서쪽 모서리다. 1단계는 3개 지점을 포함하는 Region을 사용했다. 현재 단순 가격 마커는 `initialCamera`의 중심 좌표·zoom 13으로 강남·서초를 먼저 보여 준다. 현재 위치 버튼과 위치 권한은 추가하지 않는다.
- 사용자는 거리 기반 자동 군집이 아닌 강남구·서초구처럼 행정구역별 정확한 집계를 선택했다. 초기 집계 단위는 시·군·구 수준을 제안한다. 같은 구 이름이 다른 시·도에 존재할 수 있으므로 이름 대신 행정구역 코드로 구분한다.
- 지점에는 `districtCode`, 별도 지역 메타데이터에는 코드·표시명·개수 마커를 둘 대표 좌표를 둔다. 지점의 행정구역은 검증된 원본 데이터에서 받아야 한다. 지도 중심점이나 좌표 간 거리로 소속을 추정하지 않는다.
- 개수는 제공된 전체 지점 데이터의 지역별 고유 ID 수로 계산한다. 지도 이동이나 지역 경계에 걸친 화면 때문에 같은 지역의 개수가 바뀌지 않는다. 개수 마커가 화면에 보이는지와 집계 대상은 분리한다.
- 실제 API 연동 시에는 페이지 일부만 받아 전체 지역 개수로 표시하지 않는다. 전체 지점의 최소 데이터 또는 서버가 집계한 지역별 총계가 있어야 한다. 현재는 전체 예시 데이터로 검증한다.
- 멀리서는 `강남구 15개` 같은 개수 마커, 가까이서는 가격과 짧은 특가 문구를 표시한다. 지점명·상세 특징은 충분히 확대하거나 선택했을 때 보여 마커가 겹치는 정도를 줄인다. 정확한 표시 전환 수준은 3단계에서 실제 화면으로 검토한다.
- 지역 개수 마커를 누르면 해당 지역의 지점들을 볼 수 있도록 지도 범위를 이동·확대한다. 같은 좌표에 여러 지점이 있으면 최대 확대 이후에도 해당 지점을 선택할 수 있는 목록을 제공한다. 경계 양쪽의 지점은 가까워도 개수 집계에서 합치지 않는다.
- 지역 코드가 누락되거나 등록되지 않은 데이터는 다른 지역에 임의로 포함하지 않는다. 예시 데이터는 전부 올바른 코드가 있어야 하며, 실제 데이터 오류가 있으면 지역 미지정 개수를 별도로 안내한다.
- 지역 집계와 커스텀 마커 렌더링은 별도 비용이다. 300개라는 전체 개수만으로 성능을 보장하지 않으며, 한 지역에 몰린 경우도 검증한다. 확대 상태의 마커 겹침이 실제 문제가 되면 표시 밀도와 보조 공간 군집 필요성을 해당 단계에서 검토한다.

### 예정 집계·목록 화면과 데이터 책임

- 기존 `App.tsx`의 `locations` 탭에 전용 화면을 연결한다. 기존 탭 전환 방식을 유지한다.
- `mobile/features/locations/`에 기능이 필요한 순서대로 화면·지도·마커·목록을 둔다. `LocationsContent.tsx`는 지도/목록 모드와 선택한 지점 ID를 관리하고, `LocationMap.tsx`는 실행 환경과 설정을 확인하고 `NaverLocationMap.tsx`를 지연 로드한다. 네이버 SDK·확대 단계별 표시·카메라 이동은 `NaverLocationMap.tsx`가 담당한다. `groupLocationsByDistrict.ts`는 데이터 집계만 담당하며 지도 SDK에 의존하지 않는다. `LocationMarker.tsx`와 `LocationList.tsx`는 표시를 담당한다.
- 지점 모델은 `mobile/types/location.ts`, UI에 의존하지 않는 함수·세션은 `mobile/utils/`, 화면 검토용 데이터는 기존 배치 방식에 맞춰 `mobile/mocks/locations.ts`에 둔다. 1단계에서 기본 지도 파일·좌표 데이터를 추가했고, 2026-10-01에 가격·예시 주소·상세 파일을 추가했다. 바텀 시트 예시 목록은 별도 요청으로 추가했다. 집계·특가·실제 특징 데이터·지도/목록 모드 전환·카메라 연동은 후속 단계에서 추가한다.
- 지점 데이터에는 안정적인 ID, 지점명, 주소, 위도·경도, 행정구역 코드, 원화 가격과 요금 기준 문구, 선택적인 특가 문구, 특징 배열을 둔다. 가격이 없는 경우는 별도로 표현하며 임의로 0원이나 할인 상품으로 표시하지 않는다. 실제 요금 기준이 정해지지 않았으므로 월 요금이라고 확정하지 않는다.
- 지도와 `FlatList`는 같은 원본 지점 배열을 사용한다. 지역 집계 결과 배열을 지점 목록으로 사용하지 않는다. 초기 목록은 전체 제공 지점이며 지도 이동에 따라 자동 필터링하지 않는다.
- 마커 선택 시 요약 카드를 표시한다. 목록 선택 시 지도 모드로 전환해 해당 지점으로 이동·강조한다. 지도/목록 전환 중 선택 지점과 지도 위치를 보존한다.
- 예시 데이터에는 일반 가격, 특가, 특징 없음, 긴 지점명, 가격 없음, 같은 좌표 사례를 포함한다. 300개 및 증가 규모 검증용 데이터는 재현 가능한 고정 규칙으로 생성하고 예시임을 안내한다.
- 마커의 ID와 전달 값은 안정적으로 유지하고 불필요한 재생성을 줄인다. 가격·특가 커스텀 마커는 네이버 SDK의 이미지·캡션·커스텀 뷰 방식 중 적합한 방식을 후속 단계에서 검증한다. 실제 초기 표시·텍스트 갱신·선택 상태와 밀집 시 성능을 기기에서 확인한다.
- 기능 폴더를 추가하는 단계에서 `tailwind.config.js`의 클래스 탐색 경로를 함께 갱신한다. 지도는 크기가 정해진 영역에 배치하고 목록 스크롤과 분리한다.

### 2026-10-01 사용자 요청: 단순 가격 마커와 상세 이동

- 사용자 검토를 거친 `로고 + 지점명 / 가격` 시안을 기존 지도에 적용한다. 화면 지점명에서 mock 접두사를 제외하며 mock 데이터는 `mockLocations`·ID로 구분한다.
- 기본 마커·안내창을 커스텀 말풍선·지점 상세 화면으로 바꾼다. 상세는 예시 지점명·주소·시작 요금과 실제 데이터가 아니라는 안내를 표시한다. 실제 월 요금으로 확정하지 않는다.
- 행정구역 집계 단계를 먼저 구현하지 않는 것은 이번 사용자 요청에 따른 범위 변경이다. 이 가격 마커 단계에는 특가·특징·목록·규모 검증이 포함되지 않았다. 이후 바텀 시트 예시 목록은 별도 요청으로 추가했다.
- 네이티브 의존성·라우터는 추가하지 않는다. 원본 PNG 로딩을 기다려 지도 마커를 다시 캡처하는 방식 대신, 마커에 동기적으로 그릴 수 있는 벡터 심볼을 사용한다.

검증 기록(2026-10-01):

- `pnpm typecheck:mobile`: 통과.
- `pnpm --filter @iambox/mobile test`: 16개 통과. 시작 가격·가격 없음·0원 구분 3개와 기존 밝기 수명 주기 13개를 포함한다.
- `expo export --platform ios --platform android`: 두 플랫폼 JavaScript 번들 생성 통과. 네이티브 Android 실행 성공을 뜻하지 않는다.
- iPhone 18 Pro / iOS 27.0 개발용 앱에서 로고·지점명·가격·굵은 테두리, 3개 지점 각각의 상세 이동, 상세 복귀 시 변경한 축척 유지, 홈·출입QR·지도 탭 왕복을 확인했다. 초기 zoom 13에서 강남·서초 말풍선이 겹치지 않고 화면 안에 표시된다.
- 지도 축소 시 가까운 말풍선의 겹침은 남아 있다. 행정구역 집계·밀도 조절·300개 성능 검증은 이번 단순 마커 범위에 포함하지 않았다.
- Android 네이티브 실행·하드웨어 뒤로가기, 실기기, VoiceOver/TalkBack 제스처, 지도 드래그에 의한 위치 보존은 아직 확인하지 못했다. 상세의 접근성 제목·복귀 버튼은 iOS 접근성 트리에서 확인했다.

### 2026-10-01 사용자 요청: 지점 검색·사이즈 필터와 목록 순서

- 이름·주소 검색과 사이즈 필터 버튼은 화면 최상단 지도 바로 위의 고정 영역에 배치한다(2026-10-02 위치 수정). 시트가 펼쳐져도 검색 영역을 덮지 않는다. 검색어는 앞뒤·연속 공백, NFC, 영문 대소문자를 정규화한다. 검색과 사이즈 조건은 AND, 여러 선택 사이즈는 OR이며 조건이 없으면 사이즈 정보가 없는 지점도 포함한다. 원본 순서·데이터를 보존한다.
- 필터 적용 상태와 임시 상태를 분리한다. 열 때 적용 상태를 복사하며 취소하면 기존 지도·목록 결과를 유지한다. 적용 후 같은 결과 배열을 지도·목록에 전달하고 시트를 펼친다. 초기화는 임시 조건만 비우며 활성 칩 삭제는 즉시 적용한다. 제외된 지점의 강조는 전달하지 않는다. 현재 mock 지점 3곳 모두 M/L 예시여서 두 사이즈 선택만으로 목록 수가 달라지지 않는다.
- 별도 더보기 없이 행 전체로 상세를 연다. 주소 → 이용 가능한 사이즈 → 최저가 순서이며 상세 복귀 시 지도·시트·검색 조건을 유지한다. 2026-10-02 변경으로 결과 개수 제목·펼치기/접기 버튼을 제거했다. 접힌 상태에서도 시트 영역에 들어오는 목록 일부를 표시하며 이동 중·정착 후에도 목록을 투명하게 숨기지 않는다. 초기 10개와 후속 최대 10개 배치로 가상화하고 화면 주변 버퍼를 유지한다. 현재 mock 3개로는 대량 네이티브 스크롤 성능을 검증한 것으로 간주하지 않는다.
- 지도 위 검색은 일반 RN `TextInput`을 사용하고 포커스 시 시트를 펼친다. 지점찾기에서는 시트의 `header`·`measurementHeader`에 검색 입력을 전달하지 않는다. 공통 시트의 입력 관련 API는 유지한다.
- 실제 API·가격 필터·거리 정렬·카메라 자동 이동·행정구역 집계는 이번 범위에 포함하지 않는다. iOS·Android 키보드·큰 글자·제스처의 실제 조합은 네이티브 기기에서 별도로 확인한다.

검증: `pnpm typecheck:mobile`, 모바일 테스트 31개, iOS·Android `expo export` JavaScript 번들 생성, `git diff --check` 통과. 코드 리뷰에서 행의 모든 영역을 하나의 상세 이동 버튼으로 보정했다. 시뮬레이터와 개발 서버가 실행 중임은 확인했으나 Mac 잠금으로 화면 조작·키보드·큰 글자·스크린리더 검증은 수행하지 못했다. 번들 생성 성공은 네이티브 실행 성공을 뜻하지 않는다.

### 단계별 결과와 사용자 검토

각 단계는 구현·검증 결과와 변경 파일 링크를 전달한 뒤 사용자 검토를 기다린다. 검토 전 다음 단계의 기능을 선행 구현하지 않는다.

| 단계 | 구현 결과 | 검증 및 사용자가 확인할 내용 |
| --- | --- | --- |
| 1. 기본 지도 | 지도 의존성 설치, 지점찾기 화면 연결, 소수의 예시 좌표에 기본 마커 표시 | iOS·Android 지도 로딩, 확대·이동, 탭 왕복 후 마커 재표시. 제공자·버전 호환성을 확인한 뒤 진행 |
| 2. 행정구역 개수 | 300개 예시 지점, 지역 코드별 집계·개수 마커, 클릭 시 해당 지역으로 이동 | 강남구·서초구 경계의 가까운 좌표를 별도 집계, 지도 이동 후 같은 지역의 개수 유지, 중복 ID·미등록 코드 처리, 합계 검증 |
| 3. 가격·특가·특징 | 개별 가격 마커, 특가 문구, 선택된 지점의 특징·요약 카드 | 가격 기준 문구, 긴 텍스트·빈 가격 처리, 선택 강조, 마커 겹침·잘림·깜박임 |
| 4. 지도·목록 연동 | 지도/목록 전환, `FlatList`, 공유 선택 상태 | 목록 선택 → 지도 이동, 지도 선택 → 목록 강조, 모드 전환 중 위치·선택 보존, 빈 목록 안내 |
| 5. 안정성·규모 검증 | 발견한 문제 수정과 검증 기록 | 300개 실제 예상 분포와 밀집 분포, 1,000개 증가 가정의 샘플, 같은 좌표의 여러 지점 선택, 반복 확대·탭 전환, 로딩 실패·복구를 기기에서 확인 |

- 1,000개는 스트레스 검증용 가정이며 사업상 확정 규모나 성능 보장 수치가 아니다.
- 코드 변경 단계마다 `pnpm typecheck:mobile`을 실행한다. 의존성·플랫폼 연결 변경 시 iOS·Android JavaScript 번들 생성도 확인한다. 네이티브 실행·화면 검증은 별도 결과로 기록하며 번들 성공으로 대체하지 않는다.
- 사용 가능한 기기가 한 플랫폼뿐이면 확인한 플랫폼과 미확인 플랫폼을 명시한다. 네이티브 실행이 불가능하면 정상 동작으로 판정하지 않고 재현 절차와 필요한 환경을 전달한다.
- 지역 집계 로직은 경계 양쪽의 지점, 빈 배열, 중복 ID, 미등록 지역 코드 사례로 자동 검증한다. 지도 SDK의 내부 알고리즘을 다시 구현하거나 시험하지 않는다.
- 1단계에서 네이티브 마커 호환성 문제가 드러나면 다음 단계를 진행하기 전에 재현 조건과 대안을 검토한다.
- 각 단계의 실제 구현 상태에 맞춰 PRD·Architecture·Project Structure를 갱신한다. API·DB 문서는 해당 기능이 실제로 추가될 때 갱신한다.

### 설계 근거

- [React Native Naver Map Expo 설정](https://rnnavermap.mjstudio.net/docs/installation/expo): 네이버 인증·Maven 저장소·개발용 앱 빌드.
- [네이버 지도 Android SDK 시작하기](https://navermaps.github.io/android-map-sdk/guide-ko/1.html): Client ID 설정.
- [네이버 클라우드 Application 등록](https://guide.ncloud-docs.com/docs/maps-app): Mobile Dynamic Map와 앱 식별자 등록.
- [네이버 마커·오버레이](https://rnnavermap.mjstudio.net/docs/components/overlays/common-overlay-usage): 캡션·커스텀 뷰·확대 수준별 표시.

### 1단계 네이버 지도 교체와 검토 기록

사용자의 네이버 지도 전환 요청을 반영한다. 이번 결과는 네이버 기본 지도와 예시 마커이며 대화에서 보여준 가격·개수 목업 전체 구현을 뜻하지 않는다. 기존 행정구역 집계·가격·목록의 단계별 검토 순서는 유지한다.

- [x] `@mj-studio/react-native-naver-map` 2.9.0 설치, `react-native-maps` 제거.
- [x] Expo 호환 `expo-dev-client`, `expo-build-properties`, `expo-constants` 설치. 기본 시작 명령을 개발용 앱으로 바꾸고 `start:go`는 다른 화면 검토용으로 제공한다.
- [x] `app.config.ts`에 환경변수 기반 네이버 Client ID, Maven 저장소, 개발용 앱 식별자 설정. `.env.example` 및 빈 Client ID를 가진 로컬 `.env.local` 준비.
- [x] `LocationMap`에서 준비 상태를 확인하고 네이버 SDK 지연 로드. `NaverLocationMap`에서 한국어 기본 지도와 예시 마커 3개·캡션·터치 안내 연결.
- [x] 타입 검사, 두 플랫폼 JavaScript 번들 생성, Expo 네이티브 설정 introspection 확인.
- [x] 신규 인증 발급·앱 빌드·재빌드 순서를 `mobile/README.md`에 기록.
- [ ] 실제 네이버 Client ID 발급·등록과 `.env.local` 입력.
- [ ] 개발용 앱 컴파일·설치 후 지도 로딩·마커 3개·확대·이동·홈/출입QR 탭 왕복 확인.
- [ ] 사용자 화면 검토 후 2단계 행정구역 집계 진행.

당시 작업 환경(Xcode 설치 전): 기존 변경 사항이 있는 현재 체크아웃에서 필요한 파일만 수정했다. 선택된 Xcode 도구는 Command Line Tools였으며 `simctl`이 없었고, `adb`도 명령 경로에 없었다. 신규 네이버 인증 정보는 발급 전이어서 네이티브 실행 검증은 대기 상태였다.

후속 확인(2026-09-30, Xcode 설치 후): 로컬 Client ID 설정을 반영하고 Xcode 27.0 / iPhone 18 Pro / iOS 27.0 시뮬레이터에서 빌드·설치·실행했다. 최초 UIScene 실행 오류는 위 `enableSceneSupport` 설정으로 해결했다. 홈 화면과 네이버 지도 타일·예시 마커 3개, 지도에서 홈 복귀를 확인했다. 타입 검사와 iOS·Android 번들 생성도 통과했다. Android 네이티브 실행, 실기기, 마커 터치·지도 제스처·출입QR 왕복과 사용자 검토는 아직 대기 중이다.

검증 기록(2026-09-30):

- `expo-constants` 최신 패치가 배포 대기 정책에 걸려 기존 SDK의 `57.0.19`로 고정했다. 해당 항목의 기존 lockfile 정보만 복구한 뒤 `pnpm install --frozen-lockfile`의 공급망 정책 검사·설치가 통과했다. 신규 정책 예외는 남기지 않았다.
- `pnpm typecheck:mobile`: 종료 코드 0. 문서 예시의 부분 `layerGroups`가 배포 타입과 맞지 않아, 동일한 건물 표시 기본값을 사용하도록 수정한 뒤 통과했다.
- `CI=1 EXPO_NO_TELEMETRY=1 pnpm --filter @iambox/mobile exec expo export --platform ios --platform android --output-dir /private/tmp/iambox-naver-map-stage1-dist`: 종료 코드 0, 두 플랫폼 Hermes 번들 생성. 색상 환경변수 경고만 있었으며 번들 오류는 없었다.
- `expo config --type introspect --json`: 인증값 없음 및 실제 인증에 사용할 수 없는 검증용 값 각각으로 수행했다. iOS `NMFNcpKeyId`, Android `com.naver.maps.map.NCP_KEY_ID`, 앱 식별자 기본값·환경변수 재정의, 네이버 Maven 저장소, 위치 권한 미추가를 확인했다.
- 별도 코드 리뷰에서 설치된 SDK의 모듈 이름·인증 플러그인·남서쪽 기준 지도 범위를 대조했으며, 1단계 범위 내 조치가 필요한 결함을 발견하지 못했다.
- 위 결과는 실제 네이버 인증·지도 타일 로딩·네이티브 빌드 성공을 보장하지 않는다. 기기 검토가 끝나기 전 1단계 전체 완료로 판정하지 않는다.

## Architecture Principles

- 과도한 추상화와 사용하지 않는 레이어를 미리 만들지 않는다.
- NestJS Module → Controller → Service, 기존 PrismaService 패턴을 우선한다.
- 기능이 필요할 때만 모듈과 화면 구조를 확장한다.
- 설정·인증 비밀값은 서버 환경변수로 관리한다.
- 구현을 변경할 때 관련 구조·DB·API 문서도 갱신한다.

## 코드와 기존 문서의 차이

루트 README의 앱 → API → DB 그림은 목표 흐름이며 앱의 실제 HTTP 호출은 없다.
`api/README.md` 도입부의 “Prisma를 사용할 예정”은 오래된 표현이다. 현재 PrismaModule과 연결 코드는 이미 구현되어 있다.
README가 기록한 로컬 PostgreSQL 설치·DB 생성 상태는 이번 작업에서 실행 검증하지 않았다. 이 문서는 소스의 구성과 동작을 설명한다.


### 공통 바텀 시트 구현·검증 (2026-10-01)

- 공통 시트 외형·3단계 높이·손잡이 및 버튼·접근성 높이 액션·지도 연결·Android 뒤로가기 처리를 추가했다. 실제 지점 목록과 API는 포함하지 않았다.
- 타입 검사, 모바일 테스트 22개(바텀 시트 높이 6개 포함), `git diff --check`, iOS·Android 번들 생성이 통과했다.
- `Gesture Handler 2.32.0`을 포함한 iOS 개발용 앱을 iPhone 18 Pro / iOS 27.0 시뮬레이터에 빌드·설치했다. 빌드는 오류 0개이며 Expo Dev Launcher 스크립트의 dependency analysis 경고 1개가 있다.
- 시뮬레이터 UI에서 초기 접힘, 버튼 펼침·접힘, 본문 스크롤, 손잡이 드래그 접힘, 접근성 액션의 중간 높이 전환, 노출된 지도의 더블 탭 확대와 마커 상세 진입·복귀를 확인했다. 상세 중 배경 지도·시트가 접근성 트리에서 제외되고 복귀 시 카메라·시트 높이가 유지됐다.
- 설치 버전의 런타임 검증이 `containerHeight` 속성을 금지하므로 이 속성을 전달하지 않고 라이브러리 내부 측정을 사용한다. 타입 검사·번들 성공만으로는 확인되지 않은 오류를 네이티브 화면에서 재현해 수정했다.
- 임시 네이티브 검증 화면으로 부모 높이 200px에서 헤더가 커져 시트가 숨겨진 후, 부모 높이를 바꾸지 않고 헤더를 줄이면 시트가 복구되는 것을 확인했다. 이 검증용 화면·버튼은 최종 코드에서 제거했다.
- 미검증: Android 네이티브 실행·하드웨어 뒤로가기, 실기기의 지도 이동·핀치, 실제 VoiceOver/TalkBack 음성 안내와 포커스 유지. CUA 지도 드래그는 카메라 변화가 확인되지 않아 통과로 기록하지 않았다.

### 바텀 시트 예시 지점 목록 (2026-10-01)

- 기존 안내 본문 `LocationSheetContent.tsx`를 제거하고 `LocationList.tsx`를 연결한다. 목록 컴포넌트는 `LocationPoint` 배열과 선택 ID·선택/상세 콜백을 받으며 지도 SDK와 mock 데이터를 직접 참조하지 않는다. 예약 버튼과 예약 콜백은 제거했다. 시트 본문에 추가 ScrollView를 중첩하지 않는다.
- `LocationPoint`에 선택적인 `photoSource`(RN `ImageSourcePropType`)와 `badge`를 추가한다. 기존 좌표·주소·가격 계약은 유지한다. 강남·서초·성수 예시는 `assets/locations/`의 아이엠박스 지점 내부 사진(JPEG)을 사용하되 mock 지점에 예시로 배정한 것이므로 해당 지점의 실제 사진·시설 정보와 구분한다. 목록 썸네일은 가로 사진을 `cover`로 채운다. API 계약과 DB 모델은 추가하지 않는다.
- 목록 선택과 상세 표시 상태를 분리해 목록 선택만으로 상세 화면이 열리지 않으며, 상세 복귀 시 강조·시트 높이·목록 스크롤을 유지한다. 지도 마커도 같은 선택 ID를 사용하지만 목록 선택에 따른 지도 카메라 이동과 지도/목록 모드 전환은 구현하지 않는다. 앞선 단계별 전체 목록 연동 계획의 완료를 뜻하지 않는다.
- `tests/locationList.test.cjs`는 실제 컴포넌트의 JSX·콜백을 실행해 선택 상태·지점별 이벤트 전달·썸네일 이미지 소스와 `cover` 채움·이미지/배지/가격 누락·빈 목록·큰 글자의 행 높이/주소 줄 제한을 검증한다. Node가 직접 실행할 수 없는 네이티브 뷰·SVG·시트 경계만 대체하며 실제 네이티브 제스처 검증은 별도로 수행한다.
- 최초 구현 검증: 모바일 타입 검사·테스트 25개와 iOS/Android 번들 생성이 통과했다. iPhone 18 Pro / iOS 27.0에서 시트 펼침·본문 스크롤·행 선택·상세 진입/복귀·당시 예약 안내 열기/닫기를 확인했다. 임시 320px 너비 검증 화면에서 최대 접근성 글자 크기의 세로 배치·주소/가격 줄바꿈·당시 예약 버튼 너비 제한을 확인하고 검증 화면을 제거했다. 이후 예약 버튼 제거를 기대하는 호출부·테스트와 이전 구현이 섞인 상태에서 타입 검사·테스트 실패가 발생했으며, 코드 리뷰 수정에서 목록 구현도 예약 버튼을 제거했다. Android 기기 실행과 VoiceOver/TalkBack 사용은 미검증이다. 글자 크기를 실행 중에 바꿀 때 기존 화면에도 일시적인 측정/잘림 문제가 발생했고 앱 재실행 후 해소됐다. 이 동적 변경 문제와 극단적인 크기에서의 기존 탭 레이아웃은 이번 목록 범위에서 해결한 것으로 간주하지 않는다.
- 코드 리뷰 보정: `BottomSheet`는 스냅 포인트 개수가 줄면 네이티브 렌더 전에 현재 인덱스와 손잡이 접근성 상태를 보정한다. `tests/bottomSheet.test.cjs`는 펼친 시트의 단계 축소와 재확장 시 위치 유지를 검증한다. 네이버 지도 SDK 로고는 기본 왼쪽 아래 대신 왼쪽 위에 12px 여백으로 배치해 목록 시트에 가려지지 않도록 한다. 마이 화면의 브랜드 SVG는 남은 폭에서 비율을 유지해 축소하고 고정 폭 설정 버튼을 유지하며, 법적 링크는 흰 배경 대비 약 4.97:1인 `muted`를 사용한다.
- 코드 리뷰 수정 후 검증: 타입 검사·전체 모바일 테스트 26개·iOS/Android 번들 생성이 통과했다. iPhone 18 Pro / iOS 27.0에서 접힌 시트와 펼친 시트 위의 네이버 로고 노출, 지점 목록의 예약 버튼 제거, 최대 접근성 글자 크기의 설정 버튼 노출과 안내 모달 열기·닫기를 확인했다. 스냅 단계 개수 변경은 wrapper 회귀 테스트로 확인했으며 네이티브 실행은 별도로 하지 않았다. Android 기기 실행·VoiceOver/TalkBack은 미검증이다.
