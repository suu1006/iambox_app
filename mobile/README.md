# Mobile

React Native + Expo + TypeScript 앱입니다. Expo SDK 57을 사용하며 홈·지점찾기·출입QR·이삿짐·마이 하단 탭이 있습니다.
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

Client ID·앱 식별자·네이티브 의존성을 변경하면 **prebuild와 앱 빌드·설치를 다시 수행**해야 합니다. Metro 새로고침만으로 네이티브 인증 설정은 바뀌지 않습니다. JS 화면 코드만 변경한 경우에는 보통 다시 빌드하지 않습니다.

홈 등 다른 화면만 Expo Go로 확인하려면 `pnpm --filter @iambox/mobile start:go --port 8082`를 실행할 수 있습니다. 이 경우 지점찾기에는 개발용 앱 안내가 표시되며 지도 SDK는 로드하지 않습니다.

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
- `features/access/QrAccessModal.tsx`: QR 안내창과 Android 오버레이·뒤로가기 처리.
- `features/access/useQrBrightness.ts`, `brightnessSession.ts`: 네이티브 밝기 연결, 앱 상태에 따른 적용·복원과 비동기 순서 관리.
- `tests/brightnessSession.test.cjs`: 밝기 복원·앱 전환·빠른 닫기·실패 처리 테스트.
- `features/locations/LocationsContent.tsx`: 헤더·예시 데이터 안내·지도 배치.
- `features/locations/LocationMap.tsx`: 실행 환경과 설정 확인, 준비 안내, 네이버 지도 지연 로드.
- `features/locations/NaverLocationMap.tsx`: 네이버 지도와 기본 마커. 네이버의 `Region`은 중심점이 아닌 남서쪽 좌표를 기준으로 합니다.
- `mocks/locations.ts`: 실제 운영 지점이 아닌 고정 예시 좌표 3개.
- `app.json`: 앱 이름·아이콘 등 공통 Expo 설정.
- `app.config.ts`, `.env.example`: 환경별 앱 식별자·네이버 인증·네이티브 빌드 플러그인 설정.
- `package.json`: 의존성과 개발용 앱 실행·타입 검사 명령.

## 검증 기록

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
