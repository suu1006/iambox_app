# Architecture

> 기준일: 2026-09-30. 현재 코드와 예정 구조를 구분한다. 제품 범위는 [PRD.md](PRD.md)를 따른다.

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

## Frontend Architecture

- `mobile/index.ts`가 `registerRootComponent(App)`으로 앱을 등록한다.
- `App.tsx`의 `useState`로 홈 · 지점찾기 · 출입QR · 이삿짐 · 마이 탭 선택을 관리한다. `Pressable`에 선택 상태와 탭 접근성 역할을 제공한다.
- `react-native-safe-area-context`로 안전 영역을 반영하고 `react-native-svg`와 SVG transformer로 `assets/nav-*.svg` 탭 아이콘을 표시한다. 선택 탭은 보라색이고 중앙 출입QR은 원형 버튼으로 강조한다. 같은 SVG를 임시 콘텐츠 아이콘에도 재사용한다. QR SVG는 모양과 전달받은 색상만 표현하며 원형 배경과 그림자는 View에서 관리한다. 공통 색상은 `mobile/theme/colors.json`에서 관리하며 Tailwind와 SVG가 함께 사용한다. 홈·출입QR 콘텐츠는 스크롤 가능하고 지도는 남은 화면 높이를 사용하며 하단 탭은 고정된다. 홈은 소개·서비스 카드·이벤트·후기 정적 블록, 출입QR은 mock 내 공간 화면, 지점찾기는 예시 지도이고 나머지 메뉴는 임시 안내 화면이다.
- `App.tsx`는 탭·QR 표시 상태와 배치를 담당하고 `components/`의 AppHeader, HomeContent, AccessContent, PlaceholderContent, BottomTabBar와 `features/locations/LocationsContent`, `features/access/QrAccessModal`로 UI를 분리한다. 탭 정의와 타입은 `navigation/tabs.ts`에 둔다. 화면 라우터, 전역 상태 관리 라이브러리, 영속 상태 저장은 없다. QR 밝기 수명 주기는 `features/access/useQrBrightness`에서 관리한다.
- 홈은 큰 물품 보관 카드와 오른쪽 서비스 2개, 원형 바로가기 4개, 배너 순으로 구성한다. `HomeContent`의 `onLocationsPress` 콜백으로 기존 지점찾기 탭에 연결하고, 나머지 서비스는 로컬 `Modal`로 준비 안내를 표시한다. 서비스 아이콘은 선택 시안의 PNG를 추적한 `assets/home-*.svg` 7개이며 SVG 안에 래스터 이미지를 내장하지 않는다. 상세 신청·문의와 API는 연결하지 않았다.
- 지점찾기 탭은 `LocationsContent`에서 기존 헤더·예시 데이터 안내·`LocationMap`을 배치한다. `LocationMap`은 Expo Go·네이티브 모듈·인증 설정을 확인하고 준비 안내 또는 `NaverLocationMap`을 표시한다. 네이버 SDK는 네이티브 모듈을 import 시점에 요구하므로 확인 후 지연 로드한다. `NaverLocationMap`은 iOS·Android에서 네이버 한국어 기본 지도(`Basic`)와 `mocks/locations.ts`의 예시 좌표 3개를 표시한다. 기본 마커에 지점명 캡션을 붙이고 누르면 예시 안내를 연다. 지도는 `ScrollView` 밖에서 남은 높이를 사용한다. iPhone 18 Pro / iOS 27.0 시뮬레이터에서 지도 타일·마커 3개 표시를 확인했다. 실기기와 반복 탭 재진입은 검토 대기 중이다.
- 출입QR 탭의 `AccessContent`는 `mocks/access.ts`의 정적 이용 정보와 안내 데이터를 표시한다. 남은 14일은 시안 확인을 위한 2026-09-30 기준 고정 값이며 실시간 계약 상태가 아니다. QR 버튼은 `App.tsx`의 `QrAccessModal`을 열며, 다른 안내는 컴포넌트 로컬 상태의 React Native `Modal`로 열고 닫는다. 안내 모달은 닫힘 페이드 동안 마지막 내용을 유지한다. QR 발급, 지도 호출, 문의 전송은 수행하지 않는다. 아이콘 SVG 6개는 기존 transformer로 사용한다. 보관함 그림은 제공 SVG(PNG를 base64로 두 번 포함한 3.5MB)가 JS 번들에 들어가지 않도록 내부 PNG를 추출해 768×512로 줄인 `imbox_storage_A-024.png`를 `Image`로 표시한다.
- QR 안내창이 열리고 앱이 활성 상태일 때 `expo-brightness ~57.0.2`로 밝기를 1(최대)로 설정한다. 닫기·뒤로가기·탭 전환·언마운트·앱 비활성화 시 복원하고, QR을 유지한 채 앱에 돌아오면 그 시점의 밝기를 새로 저장한 뒤 다시 높인다. iOS와 기존 앱 밝기를 쓰던 Android는 저장한 값을 복원하고, 시스템 밝기를 쓰던 Android는 `restoreSystemBrightnessAsync`로 시스템 밝기 사용 상태를 복원한다. 시스템 설정 변경 API와 권한 요청은 사용하지 않는다. `brightnessSession`은 읽기·적용·복원을 직렬화하고 닫힌 뒤 완료된 읽기 결과는 무시하며, 실패 시 원래 값을 보존해 후속 정리에서 복원을 재시도한다. 재마운트 간에도 같은 세션을 사용한다.
- Android의 네이티브 `Modal`은 별도 Dialog 창이라 Activity 밝기 적용을 위해 QR만 앱 루트의 오버레이로 표시한다. 배경 콘텐츠·탭의 터치와 접근성 탐색을 막고 하드웨어 뒤로가기를 닫기에 연결한다. iOS는 기존 네이티브 모달의 페이드를 사용한다. 네이티브 밝기 모듈이 없는 기존 개발용 앱과 웹에서는 밝기 변경을 건너뛰고 QR 안내를 표시한다. 네이티브 의존성 추가 후 개발용 앱 재빌드가 필요하며 실제 기기 밝기·자동 밝기 복원 확인은 별도 검증 대상이다.
- NativeWind 4와 Tailwind CSS 3의 `className`으로 스타일을 작성한다. `global.css`는 Tailwind 진입점이며 `tailwind.config.js`에서 컴포넌트 경로와 공통 색상을 지정한다. Metro는 SVG transformer와 NativeWind를 함께 적용하며 `inlineRem: 16`으로 기존 간격을 유지한다. 네이티브 hairline·QR 그림자는 BottomTabBar의 StyleSheet에 두고 지도 SDK의 크기는 NaverLocationMap의 StyleSheet로 지정한다.
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

예시 지점 지도 화면은 1단계 코드가 추가되었고 실제 실행 검토를 기다린다. 예정 흐름의 지점 API·모델은 아직 없으며 경로와 응답 형태도 TBD다.

## 지점찾기 지도 설계와 단계별 진행

> 2026-09-30 사용자가 지도 제공자를 네이버로 변경하도록 승인했다. 1단계 네이버 기본 지도 코드·설정·번들 검증까지 진행했으며, 실제 Client ID 발급과 개발용 앱 빌드·기기 검토를 기다린다. 2~5단계는 미구현이다.

### 목적과 범위

- 사용자가 설명한 현재 규모는 약 300개 지점이며 앞으로 증가할 수 있다.
- 지도 축소 시 강남구·서초구처럼 행정구역별 정확한 지점 개수를 표시하고, 확대 시 개별 지점의 가격·특가 문구·특징을 표시한다. 지도와 지점 목록의 선택 상태를 연결한다.
- 지도는 `@mj-studio/react-native-naver-map`을 사용하고 행정구역 집계는 앱의 지점 데이터로 계산한다. `react-native-map-clustering`과 직접 `supercluster` 연결은 모두 거리 기반 군집이므로 이번 행정구역 개수 표시에 필요하지 않다. 당초 선택했던 클러스터 패키지는 설치하지 않고 도입을 보류했다. 군집별 최저가 집계는 요구하지 않는다.
- 이번 범위는 모바일 지도·마커·목록이다. 현재 지점 API·DB 모델과 실제 지점 데이터가 없으므로 화면 확인에는 예시 데이터를 사용한다. 실제 300개 지점의 주소·가격을 임의로 만들어 운영 데이터처럼 표시하지 않는다.
- API·DB 연동, 상세 예약 화면, 검색·필터, 내 위치 권한, 길찾기는 후속 범위로 둔다.

### 지도와 행정구역 집계 기준

- iOS·Android 모두 네이버 기본 지도(`Basic`, 한국어)를 사용한다. Expo Go에서는 해당 SDK가 없어 준비 안내를 표시한다. 실제 확인은 네이버 Client ID를 설정한 개발용 앱에서 수행한다. Google/Apple 지도로 대체하지 않는다.
- `@mj-studio/react-native-naver-map`은 `2.9.0`으로 고정하고 Expo 패키지는 SDK 57 호환 버전을 설치했다. 타입·번들·설정 검증과 네이티브 컴파일·실행 검증을 구분한다. 현재 RN 0.86.3과의 실제 기기 호환성은 아직 확인하지 못했다.
- 네이버 SDK의 `Region.latitude/longitude`는 중심점이 아니라 남서쪽 모서리다. 기존 중심 좌표를 그대로 전달하지 않고 예시 마커 3개를 포함하는 남서쪽 좌표와 범위를 설정했다. 현재 위치 버튼과 위치 권한은 추가하지 않는다.
- 사용자는 거리 기반 자동 군집이 아닌 강남구·서초구처럼 행정구역별 정확한 집계를 선택했다. 초기 집계 단위는 시·군·구 수준을 제안한다. 같은 구 이름이 다른 시·도에 존재할 수 있으므로 이름 대신 행정구역 코드로 구분한다.
- 지점에는 `districtCode`, 별도 지역 메타데이터에는 코드·표시명·개수 마커를 둘 대표 좌표를 둔다. 지점의 행정구역은 검증된 원본 데이터에서 받아야 한다. 지도 중심점이나 좌표 간 거리로 소속을 추정하지 않는다.
- 개수는 제공된 전체 지점 데이터의 지역별 고유 ID 수로 계산한다. 지도 이동이나 지역 경계에 걸친 화면 때문에 같은 지역의 개수가 바뀌지 않는다. 개수 마커가 화면에 보이는지와 집계 대상은 분리한다.
- 실제 API 연동 시에는 페이지 일부만 받아 전체 지역 개수로 표시하지 않는다. 전체 지점의 최소 데이터 또는 서버가 집계한 지역별 총계가 있어야 한다. 현재는 전체 예시 데이터로 검증한다.
- 멀리서는 `강남구 15개` 같은 개수 마커, 가까이서는 가격과 짧은 특가 문구를 표시한다. 지점명·상세 특징은 충분히 확대하거나 선택했을 때 보여 마커가 겹치는 정도를 줄인다. 정확한 표시 전환 수준은 3단계에서 실제 화면으로 검토한다.
- 지역 개수 마커를 누르면 해당 지역의 지점들을 볼 수 있도록 지도 범위를 이동·확대한다. 같은 좌표에 여러 지점이 있으면 최대 확대 이후에도 해당 지점을 선택할 수 있는 목록을 제공한다. 경계 양쪽의 지점은 가까워도 개수 집계에서 합치지 않는다.
- 지역 코드가 누락되거나 등록되지 않은 데이터는 다른 지역에 임의로 포함하지 않는다. 예시 데이터는 전부 올바른 코드가 있어야 하며, 실제 데이터 오류가 있으면 지역 미지정 개수를 별도로 안내한다.
- 지역 집계와 커스텀 마커 렌더링은 별도 비용이다. 300개라는 전체 개수만으로 성능을 보장하지 않으며, 한 지역에 몰린 경우도 검증한다. 확대 상태의 마커 겹침이 실제 문제가 되면 표시 밀도와 보조 공간 군집 필요성을 해당 단계에서 검토한다.

### 화면과 데이터 책임

- 기존 `App.tsx`의 `locations` 탭에 전용 화면을 연결한다. 기존 탭 전환 방식을 유지한다.
- `mobile/features/locations/`에 기능이 필요한 순서대로 화면·지도·마커·목록을 둔다. `LocationsContent.tsx`는 지도/목록 모드와 선택한 지점 ID를 관리하고, `LocationMap.tsx`는 실행 환경과 설정을 확인하고 `NaverLocationMap.tsx`를 지연 로드한다. 네이버 SDK·확대 단계별 표시·카메라 이동은 `NaverLocationMap.tsx`가 담당한다. `groupLocationsByDistrict.ts`는 데이터 집계만 담당하며 지도 SDK에 의존하지 않는다. `LocationMarker.tsx`와 `LocationList.tsx`는 표시를 담당한다.
- 기능 타입은 해당 폴더의 `types.ts`, 화면 검토용 데이터는 기존 배치 방식에 맞춰 `mobile/mocks/locations.ts`에 둔다. 1단계에서 `LocationsContent.tsx`, `LocationMap.tsx`, `NaverLocationMap.tsx`, `types.ts`와 예시 좌표 데이터를 추가했다. 집계·가격·목록 관련 파일과 데이터 필드는 후속 단계에서 추가한다.
- 지점 데이터에는 안정적인 ID, 지점명, 주소, 위도·경도, 행정구역 코드, 원화 가격과 요금 기준 문구, 선택적인 특가 문구, 특징 배열을 둔다. 가격이 없는 경우는 별도로 표현하며 임의로 0원이나 할인 상품으로 표시하지 않는다. 실제 요금 기준이 정해지지 않았으므로 월 요금이라고 확정하지 않는다.
- 지도와 `FlatList`는 같은 원본 지점 배열을 사용한다. 지역 집계 결과 배열을 지점 목록으로 사용하지 않는다. 초기 목록은 전체 제공 지점이며 지도 이동에 따라 자동 필터링하지 않는다.
- 마커 선택 시 요약 카드를 표시한다. 목록 선택 시 지도 모드로 전환해 해당 지점으로 이동·강조한다. 지도/목록 전환 중 선택 지점과 지도 위치를 보존한다.
- 예시 데이터에는 일반 가격, 특가, 특징 없음, 긴 지점명, 가격 없음, 같은 좌표 사례를 포함한다. 300개 및 증가 규모 검증용 데이터는 재현 가능한 고정 규칙으로 생성하고 예시임을 안내한다.
- 마커의 ID와 전달 값은 안정적으로 유지하고 불필요한 재생성을 줄인다. 가격·특가 커스텀 마커는 네이버 SDK의 이미지·캡션·커스텀 뷰 방식 중 적합한 방식을 후속 단계에서 검증한다. 실제 초기 표시·텍스트 갱신·선택 상태와 밀집 시 성능을 기기에서 확인한다.
- 기능 폴더를 추가하는 단계에서 `tailwind.config.js`의 클래스 탐색 경로를 함께 갱신한다. 지도는 크기가 정해진 영역에 배치하고 목록 스크롤과 분리한다.

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
