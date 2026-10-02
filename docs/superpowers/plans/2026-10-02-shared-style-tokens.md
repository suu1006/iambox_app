# 타이포그래피·간격·모서리·그림자 공통 토큰 적용

사용자가 승인한 디자인 시스템 확장 검토를 구현한다. 기존 화면 수치·동작·접근성·반응형 조건을 보존한다. 현재 작업 트리의 기존 변경을 포함한 코드가 기준이며, 별도 checkout으로 이동하거나 기존 변경을 되돌리지 않는다.

## 구현 순서

- [x] 실제 Tailwind 스타일 생성과 토큰 변경 전파를 검증하는 실패 테스트를 추가한다. 간격·모서리·타이포그래피 별칭, 단위 변환, 네이티브 그림자 변환을 검증한다.
- [x] `packages/design-tokens/src/`에 typography·spacing·radii·shadows JSON 원본과 공통 런타임/타입 선언·Tailwind 어댑터를 추가한다. 기존 `colors.json` export를 유지하고 새 진입점을 제공한다. CommonJS 어댑터는 Tailwind require와 모바일·웹 import에서 같은 수치를 소비하며 플랫폼 의존성이 없다.
- [x] 모바일 Tailwind 설정과 전체 화면의 스타일을 연결한다. Button·Badge의 클래스와 웹 수치가 토큰을 사용하게 하고, 직접 지정한 검색 입력·SVG 텍스트·시트·QR 그림자·간격·반경도 연결한다. 웹은 기존 기본 폰트와 전역 margin을 토큰으로 연결한다. 이미지 크기·지도 좌표·safe area·시트 높이 계산은 유지한다.
- [x] 디자인 시스템·구조·아키텍처 문서를 갱신한다. 공통/모바일 전체 테스트, 공통/모바일/웹 타입 검사, 웹 빌드, 모바일 iOS/Android export와 실제 스타일의 전후 수치를 검증한다. 최종 코드 리뷰를 수행한다.

## 검토할 경계

- NativeWind는 완전한 클래스 문자열을 정적으로 탐색한다. 클래스 이름을 실행 중 조합하지 않는다.
- 간격/반경은 단위를 지정하고, 웹 줄 간격은 px로 전달한다. 자간의 em은 기존 의미를 보존한다.
- 같은 글자 크기의 다른 줄 간격·굵기·자간은 합치지 않는다. 반응형 분기와 부모로부터 상속하는 글자 속성을 보존한다.
- 그림자는 기존 iOS shadow와 Android elevation을 유지한다. 실제 사용처가 없는 웹 그림자 값은 새로 만들지 않는다.
- 새 의존성이나 lockfile 변경은 필요하지 않다. 기존 테스트에서 직접 클래스 문자열을 검사하는 부분은 새 이름으로 갱신하고 실제 스타일 출력도 대조한다.

## 실행 기록

- 설계: `docs/DESIGN_SYSTEM.md`의 확장 검토와 사용자의 적용 요청.
- RED→GREEN: 공개 토큰/테마 진입점, 실제 CSS와 원본 변경 전파, 웹 Button/Badge의 글자 조합·간격·반경 전파를 실패 후 구현으로 확인했다.
- 리뷰 수정: 버튼 최소 높이는 간격 단계 변경과 독립적인 기존 48px를 유지한다. 원본 간격 48→52 변경 fixture에서 웹 높이와 네이티브 생성 CSS가 모두 48임을 검증한다.
- 원본 참조에 없는 굵기·자간은 추가하지 않고 상속을 유지한다. 웹 그림자 사용처가 없어 CSS 그림자 변환은 만들지 않았다.

## 최종 검증

- `pnpm test:shared`: utils 2개 + UI 14개(토큰 테스트 2개 포함), 전부 통과.
- `pnpm --filter @iambox/mobile test`: 40개 전부 통과.
- `pnpm typecheck:shared`, `pnpm typecheck:mobile`, `pnpm typecheck:web`: 통과. 토큰 선언도 `tsc --noEmit --skipLibCheck false`로 확인했다.
- `NEXT_TELEMETRY_DISABLED=1 pnpm build:web`: 통과. 기본 실행은 샌드박스 밖 Next.js 텔레메트리 설정 쓰기에서 EPERM이 발생했고, 텔레메트리를 끄고 정상 빌드했다.
- `CI=1 EXPO_NO_TELEMETRY=1 pnpm --filter @iambox/mobile exec expo export --platform ios --platform android --output-dir /private/tmp/iambox-style-token-export`: 두 플랫폼 Hermes 번들 생성 통과.
- 실제 NativeWind/Tailwind CSS의 적용 전후 235개 클래스 조합: 기존 inlineRem 16 기준으로 정규화하여 수치 동일 확인. 일회성 비교 자료는 `/private/tmp`에 두었다.
- 독립 코드 리뷰: 최소 높이 수정 후 남은 수정 사항 없음. 문서 및 범위 diff 공백 검사 통과.
- 미수행: 네이티브 기기/시뮬레이터 화면·큰 글자·VoiceOver/TalkBack·Android 그림자 육안 확인. 번들 생성과 CSS 비교가 이를 대체하지 않는다.
- 작업 트리에 있는 별도 내비게이션 작업과 기존 수정은 보존했다. 이번 토큰 작업은 의존성·lockfile을 변경하지 않았다.


## 이번 토큰 작업의 변경 파일

별도 작업의 내비게이션 구조·의존성 변경은 아래 목록에 포함하지 않는다. 같은 파일에 섞인 경우 위 설명에 해당하는 변경만 이번 작업 범위다.

- [packages/design-tokens/src/typography.json](/Users/jeongsu/Documents/study/iambox_app/packages/design-tokens/src/typography.json) — 공통 JSON 원본 추가
- [packages/design-tokens/src/spacing.json](/Users/jeongsu/Documents/study/iambox_app/packages/design-tokens/src/spacing.json) — 공통 JSON 원본 추가
- [packages/design-tokens/src/radii.json](/Users/jeongsu/Documents/study/iambox_app/packages/design-tokens/src/radii.json) — 공통 JSON 원본 추가
- [packages/design-tokens/src/shadows.json](/Users/jeongsu/Documents/study/iambox_app/packages/design-tokens/src/shadows.json) — 공통 JSON 원본 추가
- [packages/design-tokens/src/index.cjs](/Users/jeongsu/Documents/study/iambox_app/packages/design-tokens/src/index.cjs) — 별칭·타이포그래피·그림자 색상 참조 해석
- [packages/design-tokens/src/index.d.cts](/Users/jeongsu/Documents/study/iambox_app/packages/design-tokens/src/index.d.cts) — 공개 타입 선언
- [packages/design-tokens/src/tailwind.cjs](/Users/jeongsu/Documents/study/iambox_app/packages/design-tokens/src/tailwind.cjs) — 공통 값을 CSS 단위·완전한 클래스 규칙으로 변환
- [packages/design-tokens/package.json](/Users/jeongsu/Documents/study/iambox_app/packages/design-tokens/package.json) — 루트·어댑터·JSON exports 추가
- [packages/design-tokens/tsconfig.json](/Users/jeongsu/Documents/study/iambox_app/packages/design-tokens/tsconfig.json) — 타입 선언 검사 대상 추가
- [mobile/tailwind.config.js](/Users/jeongsu/Documents/study/iambox_app/mobile/tailwind.config.js) — 공통 테마 읽기
- [mobile/components/layout/AppHeader.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/components/layout/AppHeader.tsx) — 타이포그래피·간격·모서리 토큰 적용
- [mobile/components/layout/BottomTabBar.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/components/layout/BottomTabBar.tsx) — 탭 글자·간격·원형 반경과 QR 그림자 토큰 적용
- [mobile/components/layout/PlaceholderContent.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/components/layout/PlaceholderContent.tsx) — 타이포그래피·간격·모서리 토큰 적용
- [mobile/components/layout/ScreenContainer.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/components/layout/ScreenContainer.tsx) — 타이포그래피·간격·모서리 토큰 적용
- [mobile/components/ui/BottomSheet.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/components/ui/BottomSheet.tsx) — 손잡이·시트 반경과 그림자 토큰 적용
- [mobile/components/ui/Dialog.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/components/ui/Dialog.tsx) — 타이포그래피·간격·모서리 토큰 적용
- [mobile/features/access/AccessContent.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/access/AccessContent.tsx) — 타이포그래피·간격·모서리 토큰 적용
- [mobile/features/home/EventBanner.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/home/EventBanner.tsx) — 타이포그래피·간격·모서리 토큰 적용
- [mobile/features/home/HomeContent.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/home/HomeContent.tsx) — 타이포그래피·간격·모서리 토큰 적용
- [mobile/features/locations/LocationDetail.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationDetail.tsx) — 타이포그래피·간격·모서리 토큰 적용
- [mobile/features/locations/LocationFilterModal.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationFilterModal.tsx) — 타이포그래피·간격·모서리 토큰 적용
- [mobile/features/locations/LocationList.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationList.tsx) — 타이포그래피·간격·모서리 토큰 적용
- [mobile/features/locations/LocationLogo.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationLogo.tsx) — 로고 반경 토큰 적용
- [mobile/features/locations/LocationMap.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationMap.tsx) — 타이포그래피·간격·모서리 토큰 적용
- [mobile/features/locations/LocationMarker.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationMarker.tsx) — SVG 글자 크기·굵기 토큰 적용
- [mobile/features/locations/LocationSearchHeader.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationSearchHeader.tsx) — 입력의 글자 크기·padding과 클래스 토큰 적용
- [mobile/features/locations/LocationsContent.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationsContent.tsx) — 타이포그래피·간격·모서리 토큰 적용
- [mobile/features/my/MyContent.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/my/MyContent.tsx) — 타이포그래피·간격·모서리 토큰 적용
- [mobile/navigation/LocationsStack.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/navigation/LocationsStack.tsx) — 지점 누락 안내 글자 크기만 토큰 적용
- [packages/ui/src/shared/button.ts](/Users/jeongsu/Documents/study/iambox_app/packages/ui/src/shared/button.ts) — Button 클래스·웹 수치의 공통 원본 연결
- [packages/ui/src/shared/badge.ts](/Users/jeongsu/Documents/study/iambox_app/packages/ui/src/shared/badge.ts) — Badge 클래스·웹 수치의 공통 원본 연결
- [packages/ui/src/native/Badge.tsx](/Users/jeongsu/Documents/study/iambox_app/packages/ui/src/native/Badge.tsx) — 용도별 글자 클래스 적용
- [packages/ui/src/web/Button.tsx](/Users/jeongsu/Documents/study/iambox_app/packages/ui/src/web/Button.tsx) — variant별 글자 조합 소비
- [packages/ui/src/web/Badge.tsx](/Users/jeongsu/Documents/study/iambox_app/packages/ui/src/web/Badge.tsx) — size별 글자 조합 소비
- [packages/ui/tests/components.test.cjs](/Users/jeongsu/Documents/study/iambox_app/packages/ui/tests/components.test.cjs) — 새 클래스 이름으로 기존 렌더러 경계 검증
- [packages/ui/tests/loadUI.cjs](/Users/jeongsu/Documents/study/iambox_app/packages/ui/tests/loadUI.cjs) — 실제 fixture 토큰 로딩 지원
- [packages/ui/tests/tokens.test.cjs](/Users/jeongsu/Documents/study/iambox_app/packages/ui/tests/tokens.test.cjs) — 실제 CSS·원본 변경 전파·터치 최소 높이 검증
- [web/src/app/layout.tsx](/Users/jeongsu/Documents/study/iambox_app/web/src/app/layout.tsx) — 웹 폰트·기본 margin의 CSS 변수 연결
- [web/src/app/globals.css](/Users/jeongsu/Documents/study/iambox_app/web/src/app/globals.css) — 토큰 CSS 변수 소비
- [docs/DESIGN_SYSTEM.md](/Users/jeongsu/Documents/study/iambox_app/docs/DESIGN_SYSTEM.md) — 구현된 토큰·사용법·미정 범위 갱신
- [docs/PROJECT_STRUCTURE.md](/Users/jeongsu/Documents/study/iambox_app/docs/PROJECT_STRUCTURE.md) — 새 파일 책임·배치 기준 갱신
- [docs/ARCHITECTURE.md](/Users/jeongsu/Documents/study/iambox_app/docs/ARCHITECTURE.md) — 공통 토큰 소비 흐름 갱신
- [packages/README.md](/Users/jeongsu/Documents/study/iambox_app/packages/README.md) — 공개 진입점·사용 예·검증 안내 갱신


## 기존 화면 스타일 복구 (2026-10-02)

- 사용자가 기존 화면 깨짐을 보고했다. 실제 iOS 앱에서 여백 소실·사각형 카드/아이콘·기본 글자 크기를 확인했다. 실행 중인 Metro의 번들에는 새 클래스가 있지만 NativeWind 가상 스타일 모듈은 이전 CSS를 제공했다. 최초 일회성 CSS 비교·export만으로 실행 중 캐시 문제를 잡지 못했다.
- 실제 앱이 연결된 8081 개발 서버를 `--clear`로 재시작하고 앱을 전체 Reload하여 스타일을 복구했다.
- Tailwind 3의 감시 의존성 탐색은 패키지 이름의 require를 제외한다. `mobile/tailwind.config.js`를 상대 어댑터 경로로 연결해 공통 런타임과 5개 JSON을 추적하게 했다.
- [packages/ui/tests/tokens.watch.test.cjs](/Users/jeongsu/Documents/study/iambox_app/packages/ui/tests/tokens.watch.test.cjs) — 실제 CLI watch에서 복사한 공통 JSON의 간격 24→26 변경을 검증한다. 기존 패키지 이름 연결로는 26px 생성에 실패하고 수정된 상대 연결에서는 통과한다. 임시 fixture만 수정하고 실제 토큰·실행 중 앱의 캐시를 건드리지 않는다.
- 복구 후 `pnpm test:shared` 17개, `pnpm --filter @iambox/mobile test` 41개, `pnpm typecheck:shared`, `pnpm typecheck:mobile`, `pnpm typecheck:web` 통과. 모바일 테스트 수에는 별도 작업에서 추가한 내비게이션 회귀 테스트도 포함된다.
- iPhone 18 Pro / iOS 27.0 실제 앱에서 홈·출입QR·마이·택배·지점 지도/목록/상세·시트 펼침·필터와 안내 모달을 캡처해 글자 크기·여백·모서리 복구를 확인했다. 상세 이동/복귀와 모달 열기/닫기도 확인했다.
- 이번 복구에서 Android 화면·큰 글자·VoiceOver/TalkBack을 확인하거나 웹 빌드·모바일 export를 다시 실행하지 않았다. 이전 빌드 통과와 실제 화면 검증을 구분한다.

- 복구 후 CSS 전후 재비교: 196개 조합의 수치 동일. 별도 마이페이지 구조 변경으로 클래스 조합 수가 달라진 `MyContent.tsx`는 이번 자동 전후 비교에서 제외하고 실제 화면을 확인했다. 최초 235개 비교 기록과 구분한다.
- 복구 수정에 대한 독립 코드 리뷰: 상대 require 감시 의존성·CLI 테스트 격리/정리 확인, 추가 수정 사항 없음. `git diff --check` 통과.
