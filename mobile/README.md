# Mobile

React Native + Expo + TypeScript 앱입니다. Expo SDK 57을 사용하며 홈·지점찾기·출입QR·택배·마이 하단 탭이 있습니다.
지점찾기는 `@mj-studio/react-native-naver-map` 2.9.0을 사용합니다. 네이버 지도는 **Expo Go가 아닌 개발용 앱(Development Build)**에서 실행합니다.

## 처음 실행하기

아래 명령은 프로젝트 루트에서 실행합니다.

### 1. 네이버 지도 Client ID 발급

1. [네이버 클라우드 콘솔](https://console.ncloud.com/)에서 **Services → Application Services → Maps**를 엽니다.
2. Application을 등록하고 **Mobile Dynamic Map**을 선택합니다.
3. Android 앱 패키지 이름과 iOS Bundle ID를 각각 **`com.iambox.app`**으로 등록합니다. 현재 신규 개발용 기본값이며, 다른 식별자를 쓰려면 아래 환경변수도 함께 변경합니다.
4. 인증 정보에서 **Client ID**를 확인합니다. 이 앱의 네이티브 지도 표시에는 Client Secret을 넣지 않습니다.

[네이버 Application 등록 안내](https://guide.ncloud-docs.com/docs/maps-app) · [SDK 인증 설정](https://navermaps.github.io/android-map-sdk/guide-ko/1.html)

### 2. 로컬 설정

```bash
pnpm install
cp -n mobile/.env.example mobile/.env.local
```

현재 작업 폴더에는 빈 Client ID를 가진 `.env.local`을 준비했습니다. 해당 파일의 `NAVER_MAP_CLIENT_ID=` 오른쪽에 발급받은 값을 입력합니다. `.env.local`은 Git에서 제외됩니다.

```dotenv
NAVER_MAP_CLIENT_ID=발급받은_Client_ID
ANDROID_PACKAGE=com.iambox.app
IOS_BUNDLE_IDENTIFIER=com.iambox.app
```

`app.config.ts`가 이를 읽어 iOS Info.plist와 AndroidManifest.xml에 SDK 인증 정보를 넣습니다. 앱 식별자는 네이버 클라우드에 등록한 값과 일치해야 합니다. Client ID는 네이티브 앱에 포함되는 식별자이며 서버용 비밀키가 아닙니다.

### 3. 개발용 앱 빌드·설치

사용할 플랫폼의 개발 도구와 기기 또는 에뮬레이터를 준비한 뒤, 해당 명령만 실행합니다. 네이버 인증 설정 변경도 반영하도록 `prebuild`를 먼저 실행합니다.

**Android:** Android Studio의 SDK, JDK와 연결된 Android 기기 또는 에뮬레이터가 필요합니다.

```bash
pnpm --filter @iambox/mobile exec expo prebuild --platform android
pnpm --filter @iambox/mobile android --port 8082
```

**iOS:** 전체 Xcode와 시뮬레이터가 필요합니다. 실기기는 추가 서명 설정이 필요할 수 있습니다.

Xcode 27 / iOS 27에서는 UIKit scene lifecycle이 필요합니다. `app.config.ts`의
`expo-build-properties`에 `ios.enableSceneSupport: true`를 설정했습니다.
Expo SDK 57의 기본값은 비활성화라 이 설정이 없으면 빌드 성공 후에도 실행 직후 종료됩니다.
[Expo 공식 설정 안내](https://github.com/expo/expo/issues/46664)를 참고하세요.
시뮬레이터 화면은 Xcode 27의 **Device Hub**에서 확인합니다.

`xcode-select -p`가 `/Library/Developer/CommandLineTools`를 가리키면 아래 명령 전에
현재 터미널에 `export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer`를 설정합니다.

```bash
pnpm --filter @iambox/mobile exec expo prebuild --platform ios
pnpm --filter @iambox/mobile ios --port 8082
```

생성되는 `mobile/android/`, `mobile/ios/`는 Git에서 제외하며 `app.json`과 `app.config.ts`를 설정 원본으로 사용합니다. 네이티브 폴더를 직접 수정하는 방식은 현재 사용하지 않습니다.
Xcode에서 직접 열 때는 CocoaPods 설치 후 생성되는 `mobile/ios/iambox.xcworkspace`를 사용합니다.
로컬 빌드 환경이 없는 경우 EAS Development Build도 사용할 수 있지만, 이 저장소에는 EAS 프로젝트·빌드 프로필·서명 설정이 아직 없습니다. [개발용 빌드 안내](https://docs.expo.dev/develop/development-builds/introduction/)

### 4. 이후 개발 서버 실행

개발용 앱 설치 후에는 아래 명령으로 다시 연결합니다.

```bash
pnpm dev:mobile --port 8082
```

휴대폰과 컴퓨터를 같은 Wi-Fi에 연결하고 설치한 **iambox 개발용 앱**으로 접속합니다. 이미 8082 포트의 서버가 실행 중이면 기존 터미널에서 `Ctrl+C`로 종료한 뒤 다시 시작합니다. 캐시 초기화가 필요하면 `--clear`를 붙입니다.

iOS 시뮬레이터에 `--localhost`로 연결할 때 서버가 `::1`에서만 대기하면,
개발용 앱이 사용하는 `127.0.0.1`로 접속하지 못할 수 있습니다. 이 경우 기존
서버를 종료하고 아래처럼 IPv4 우선 DNS 순서와 Xcode 경로를 지정합니다.

```bash
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer NODE_OPTIONS=--dns-result-order=ipv4first pnpm --filter @iambox/mobile start --localhost --port 8081
curl http://127.0.0.1:8081/status
```

상태 응답은 `packager-status:running`이어야 합니다. 실행 명령에 지정한 환경변수는
해당 서버 프로세스에만 적용되며 시스템 Xcode 설정은 변경하지 않습니다.

Client ID·앱 식별자·네이티브 의존성을 변경하면 **prebuild와 앱 빌드·설치를 다시 수행**해야 합니다. Metro 새로고침만으로 네이티브 인증 설정은 바뀌지 않습니다. JS 화면 코드만 변경한 경우에는 보통 다시 빌드하지 않습니다.

### 5. Expo Go로 실행

네이티브 앱을 빌드하지 않고 화면을 확인하려면 프로젝트 루트에서 실행합니다.

```bash
pnpm dev:mobile:go --port 8082
```

휴대폰의 Expo Go에서 터미널의 QR 코드를 스캔합니다. 컴퓨터와 휴대폰은 같은
Wi-Fi에 연결해야 하며, 프로젝트의 Expo SDK 57과 호환되는 Expo Go가 필요합니다.
`dev:mobile`은 개발용 앱, `dev:mobile:go`는 Expo Go를 명시적으로 대상으로 합니다.

홈·마이·출입QR 안내와 지점 바텀 시트 목록·상세 화면을 확인할 수 있습니다.
네이버 지도 SDK는 Expo Go에 포함되어 있지 않으므로 지도 영역에는 개발용 앱
안내를 표시하고 SDK를 로드하지 않습니다. 실제 지도는 `pnpm dev:mobile`로
개발용 앱을 연결해 확인합니다.

iOS 시뮬레이터에서는 설치와 실행을 Expo CLI에 맡길 수 있습니다.

```bash
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer NODE_OPTIONS=--dns-result-order=ipv4first pnpm dev:mobile:go --localhost --port 8082 --ios
```

Expo Go는 개발용 앱과 별도로 설치됩니다. 동시에 실행하려면 서로 다른 포트를
사용합니다(예: 개발용 앱 8081, Expo Go 8082).

## 지점찾기 1단계 검토

현재는 한국어 네이버 기본 지도(`Basic`)와 강남·서초·성수의 **예시 마커 3개**를 연결했습니다. 마커에는 예시 지점명을 표시하고, 누르면 예시 데이터 안내를 엽니다. 현재 위치 권한은 요청하지 않습니다. 행정구역 개수·가격·특가·특징·목록은 다음 단계입니다. 대화에서 보여준 가격 말풍선 목업은 아직 구현 결과가 아닙니다.

1. Client ID를 설정한 개발용 앱에서 지점찾기 탭을 엽니다.
2. 서울 주변 지도와 예시 마커 3개, 각 지점명이 표시되는지 확인합니다.
3. 마커 터치, 지도 확대·축소·이동을 확인합니다.
4. 홈과 출입QR 탭을 다녀온 뒤 지도·마커가 다시 표시되는지 확인합니다.
5. iOS·Android 각각 확인한 기기·OS와 미확인 플랫폼을 구분해 기록합니다.

지도 대신 준비 안내가 나오면 Expo Go로 열었는지, 네이버 SDK가 포함된 개발용 앱인지, Client ID를 입력하고 앱을 다시 빌드했는지 확인합니다. 지도 바탕이 비어 있다면 네트워크, Mobile Dynamic Map 활성화, 네이버에 등록된 앱 식별자와 인증 정보를 확인합니다.

## 출입 QR 화면 밝기

`출입QR` 탭의 **출입 QR 열기**를 누르면 안내창이 열린 동안 최대 밝기를 적용합니다. 닫기, Android 뒤로가기, 화면 이탈, 앱 비활성화 시 원래 상태로 복원하고 QR을 열어 둔 채 앱에 돌아오면 다시 높입니다. Android의 시스템 자동 밝기 사용 상태도 복원하며 시스템 설정 변경 권한은 요청하지 않습니다. QR 발급은 아직 연결되지 않아 내용은 기존 준비 안내입니다.

`expo-brightness`가 추가되었으므로 기존 개발용 앱은 위의 플랫폼별 prebuild·빌드·설치를 다시 수행해야 합니다. **Metro 새로고침만으로는 밝기 모듈이 추가되지 않습니다.** 모듈이 없는 기존 앱에서도 안내창은 열리지만 자동 밝기 변경은 건너뜁니다. Android QR은 Activity 밝기를 적용할 수 있도록 같은 창의 오버레이를 사용합니다.

```bash
pnpm --filter @iambox/mobile test
pnpm typecheck:mobile
```

자동 테스트는 Node 22.18 이상에서 실행하며 별도 테스트 패키지는 필요하지 않습니다. 실제 화면 밝기는 시뮬레이터·번들 검사로 확인할 수 없으므로 iOS·Android 휴대폰에서 다음을 확인합니다.

1. 밝기를 낮춘 뒤 QR 열기 → 최대 밝기, 닫기 → 이전 밝기 복원.
2. QR 빠르게 열기·닫기 반복, Android 뒤로가기 → 밝기가 최대 상태로 남지 않음.
3. QR을 연 채 홈 화면/다른 앱 이동 → 복원, 앱 복귀 → 최대 밝기, 닫기 → 복원.
4. Android 자동 밝기를 켠 상태에서 같은 과정을 수행 → 닫은 뒤 자동 밝기가 계속 작동.
5. 이용 내역·길찾기·문의 안내창 → 밝기 변경 없음.

## 파일 역할

- `index.ts`, `App.tsx`: 앱 등록, 하단 탭 상태와 화면 배치.
- `@iambox/design-tokens/colors.json`: primary 기준 공통 색상 토큰. 원본은 `../packages/design-tokens/src/colors.json`이며 TS·Tailwind가 함께 읽습니다([Design System](../docs/DESIGN_SYSTEM.md)).
- `components/ui/`: Button·Badge는 `@iambox/ui/native` 재수출, Decorative·InfoDialog·DialogCard·useInfoDialog는 모바일 전용 구현. Tailwind가 공유 UI의 shared/native 경로도 탐색합니다.
- `components/layout/`: ScreenContainer, AppHeader, BottomTabBar, PlaceholderContent 화면 뼈대.
- `features/home/HomeContent.tsx`, `EventBanner.tsx`: 홈 소개·서비스 카드·바로가기·이벤트 배너·후기.
- `features/access/AccessContent.tsx`: 출입QR 내 공간 카드·방문 안내·문의.
- `features/access/QrAccessModal.tsx`: QR 안내창과 Android 오버레이·뒤로가기 처리.
- `features/access/useQrBrightness.ts`, `utils/brightnessSession.ts`: 네이티브 밝기 연결, 앱 상태에 따른 적용·복원과 비동기 순서 관리.
- `types/location.ts`: 공통 `LocationData`에 모바일 `photoSource`를 더하는 지점 타입.
- `utils/`: 공통 가격·검색 함수 재수출, 모바일 바텀 시트 높이 계산과 QR 밝기 세션. 실제 가격·검색 구현은 `@iambox/utils`에 있습니다.
- `tests/brightnessSession.test.cjs`: 밝기 복원·앱 전환·빠른 닫기·실패 처리 테스트.
- `features/locations/LocationsContent.tsx`: 헤더·예시 데이터 안내·지도 배치.
- `features/locations/LocationMap.tsx`: 실행 환경과 설정 확인, 준비 안내, 네이버 지도 지연 로드.
- `features/locations/NaverLocationMap.tsx`: 네이버 지도와 기본 마커. 네이버의 `Region`은 중심점이 아닌 남서쪽 좌표를 기준으로 합니다.
- `mocks/locations.ts`: 실제 운영 지점이 아닌 고정 예시 좌표 3개.
- `app.json`: 앱 이름·아이콘 등 공통 Expo 설정.
- `app.config.ts`, `.env.example`: 환경별 앱 식별자·네이버 인증·네이티브 빌드 플러그인 설정.
- `package.json`: 의존성과 개발용 앱 실행·타입 검사 명령.

## 검증 기록

### Button·Badge 공유 (2026-10-02, 4단계)

- 기존 Button·Badge 경로는 native를 재수출하며 화면 호출부는 그대로입니다. props·이벤트·아이콘·접근성과 기존 클래스 문자열을 유지했습니다.
- `pnpm typecheck:shared`(UI web/native 포함), `pnpm typecheck:mobile`, utils 2개·UI 12개·모바일 31개 테스트: 통과.
- 실제 Tailwind 출력에서 기존 두 컴포넌트 utility 34개가 동일하게 생성되며 iOS·Android `expo export`가 통과했습니다.
- **미검증:** 기기·시뮬레이터 화면, 터치·지도·밝기·스크린리더 재실행. 웹 브라우저 확인은 5단계입니다.
- 자세한 변경 링크와 결과는 [4단계 기록](../docs/superpowers/plans/2026-10-02-shared-ui-stage4.md)을 참고하세요.

### 공통 데이터·함수·토큰 연결 (2026-10-02, 3단계)

- `pnpm typecheck:shared`, `pnpm typecheck:mobile`, 공통 테스트 2개와 기존 모바일 테스트 31개: 통과.
- 색상 JSON은 이동 전과 바이트 단위로 동일하며 화면 import와 Tailwind가 같은 공통 파일을 사용합니다.
- 명시적 `.ts` 소스 export를 소비하도록 `tsconfig.json`에 `allowImportingTsExtensions`를 추가했습니다. Metro는 기존 Expo monorepo 자동 설정을 유지했습니다.
- iOS·Android `expo export`: 통과. 기기 화면 실행과 실제 지도·밝기 동작은 이번 단계에서 재검증하지 않았습니다.
- 공통 사용법과 단계 기록은 [packages/README.md](../packages/README.md), [3단계 기록](../docs/superpowers/plans/2026-10-02-shared-packages-stage3.md)을 참고하세요.

2026-09-30 홈·출입QR 화면과 디자인 시스템 정리 후:

- `pnpm typecheck:mobile`, `pnpm --filter @iambox/mobile test`(13개), iOS·Android `expo export`, `git diff --check`: 통과.
- React Native Web 임시 미리보기(390px)에서 홈·출입QR·마이 화면, 좌우 여백 24px, 안내 모달·QR 안내창 열기·닫기를 확인했습니다. 웹 렌더링은 네이티브 화면을 대체하지 않습니다.
- **미검증:** iOS 시뮬레이터·실기기의 홈·출입QR 화면, Android 하드웨어 뒤로가기, 스크린리더(VoiceOver·TalkBack) 탐색, OS 큰 글자 설정(출입QR의 큰 글자 배치), 320px급 좁은 기기의 줄바꿈·그림 잘림.

2026-09-30 출입 QR 밝기 추가 후:

- `pnpm --filter @iambox/mobile test`: 13개 통과. 밝기 0 포함 복원, Android 시스템 밝기 사용 상태 복원, 앱 상태 이벤트·정리, 빠른 닫기·재열기, API 실패 후 복원을 확인했습니다.
- `pnpm typecheck:mobile`, iOS·Android `expo export`, `git diff --check`: 통과. 번들 생성 시 기존 색상 환경변수 경고가 있었습니다.
- `expo-brightness 57.0.2`를 포함해 iPhone 18 Pro / iOS 27.0 시뮬레이터용 개발 앱을 다시 빌드·설치·실행했습니다. 빌드 오류 0개, 기존 Expo Dev Launcher 스크립트 경고 1개입니다.
- 시뮬레이터에서 QR 안내창 열기·닫기·재열기, 배경 접근성 숨김과 복원, QR을 연 채 홈 화면으로 나갔다 앱 복귀 후 안내창 유지·닫기를 확인했습니다.
- **미검증:** 휴대폰의 실제 최대 밝기·복원, Android 네이티브 빌드·오버레이·뒤로가기·자동 밝기 복원. 시뮬레이터 화면 확인은 실기기 밝기 검증을 대체하지 않습니다.

2026-09-30 Xcode 설치 후 추가 확인:

- Xcode 27.0, CocoaPods 1.17.0, iPhone 18 Pro / iOS 27.0 시뮬레이터에서 개발용 앱 빌드·설치·실행 성공.
- 최초 실행의 UIScene 오류를 `ios.enableSceneSupport: true`로 해결했다. 빌드 오류는 0개이며 Expo Dev Launcher 빌드 스크립트의 의존성 경고 1개는 남아 있다.
- 8082 개발 서버를 현재 `.env.local` 설정으로 재시작하고 앱을 연결했다. 홈 화면, 네이버 지도 타일과 강남·서초·성수 예시 마커 3개, 지도에서 홈으로 복귀를 확인했다.
- `pnpm typecheck:mobile`, iOS·Android `expo export`, `git diff --check` 통과.
- **미검증:** Android 네이티브 빌드·실행, 실기기 실행, 마커 터치·지도 확대/이동·출입QR 왕복. 아래 기록은 Xcode 설치 전 상태다.

2026-09-30 네이버 지도 교체 후:

- `pnpm typecheck:mobile`: 통과.
- `pnpm install --frozen-lockfile`: 공급망 정책 검사와 설치 통과. `expo-constants`는 기존 Expo SDK의 `57.0.19`로 고정했으며 신규 배포 대기 정책 예외를 추가하지 않았습니다.
- iOS·Android `expo export`: 두 플랫폼 Hermes 번들 생성 통과. 색상 환경변수 경고만 있었으며 번들 오류는 없었습니다.
- `expo config --type introspect`: Client ID 미설정 및 검증용 임시 값으로 iOS/Android 인증값 주입·앱 식별자·네이버 Maven 저장소·위치 권한 미추가를 확인했습니다. 실제 인증 성공을 확인한 검사는 아닙니다.
- **미검증:** 네이티브 앱 컴파일·설치, 실제 지도 타일 로딩, 마커 터치·탭 왕복. 현재 선택된 Xcode 도구는 Command Line Tools로 `simctl`이 없고 Android `adb`도 명령 경로에 없습니다. 실제 Client ID도 발급 전입니다.

```bash
pnpm typecheck:mobile
pnpm --filter @iambox/mobile exec expo export --platform ios --platform android
```

번들 생성 성공은 네이티브 SDK 빌드·기기 동작 성공을 뜻하지 않습니다. 실제 기기 화면을 검토한 뒤 2단계 행정구역 개수 표시로 진행합니다.

[React Native Naver Map Expo 설정](https://rnnavermap.mjstudio.net/docs/installation/expo)

### 앱·웹 공유 구조 통합 확인 (2026-10-02, 6단계)

- 공통·모바일·웹·API 타입 검사, 공통 14개와 모바일 31개 테스트, API/웹 빌드, iOS·Android export: 통과.
- 설치된 iPhone 18 Pro / iOS 27 개발용 앱을 현재 Metro에 연결했다. 홈 로딩, 출입QR의 공통 primary/link 버튼·solid 배지, 이용 내역 안내 모달 열기, 지점 목록의 compact 배지·가격 표시와 지도 타일을 확인했다.
- **미검증:** Android 기기 화면, 실기기 밝기·복원, 지도 상세 왕복·검색/필터 전체 조작, 스크린리더·큰 글자·좁은 네이티브 화면. export는 네이티브 앱 컴파일이나 기기 동작 검증을 대체하지 않는다.

이번 환경에서 `--localhost`는 Metro를 IPv6 `::1`에 바인딩했지만 번들 URL은 `127.0.0.1`로 생성돼 첫 로딩이 실패했다. 아래 실행 옵션으로 IPv4 우선 해석을 적용하니 현재 코드가 로딩됐다. 시스템 DNS 설정이나 앱 코드는 변경하지 않았다.

```bash
NODE_OPTIONS=--dns-result-order=ipv4first pnpm dev:mobile --port 8082 --localhost
```

Xcode가 설치돼 있으나 `xcode-select -p`가 CommandLineTools를 가리키면 필요한 명령에만 `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer`를 지정할 수 있다. 전역 선택은 이번 작업에서 변경하지 않았다.

[6단계 통합 결과](../docs/superpowers/plans/2026-10-02-monorepo-stage6.md)를 참고한다.
