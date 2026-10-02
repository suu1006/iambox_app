# 공통 데이터·함수·토큰 3단계 구현 계획

**Goal:** contracts·utils·design-tokens에 실제 소스를 연결하고 모바일이 같은 원본을 사용하게 한다.

**Spec:** [공통 패키지 설계](../specs/2026-10-02-nextjs-shared-packages-design.md)

## 범위와 인터페이스

- 공통 `LocationData`에서 모바일 이미지 타입을 제외한다. 모바일 `LocationPoint = LocationData & { photoSource?: ImageSourcePropType }`로 기존 소비자를 유지한다.
- utils는 `formatLocationPrice(number | null): string`과 `filterLocations<T extends LocationData>(readonly T[], string, readonly string[]): T[]`를 export한다.
- 모바일의 기존 유틸리티 경로는 재수출로 유지하고 실제 구현을 공통 패키지에만 둔다. 기존 모바일 테스트와 화면이 같은 함수를 사용한다.
- 색상은 `packages/design-tokens/src/colors.json`으로 내용 그대로 이동하고 `@iambox/design-tokens/colors.json`을 TS import와 Tailwind require에서 사용한다.
- utils의 내부 export에는 명시적인 `.ts` 확장자를 사용해 Expo·향후 Next.js 변환과 Node 22의 기존 strip-types 테스트를 함께 지원한다. 공통 tsconfig와 이를 소비하는 모바일 tsconfig에 `allowImportingTsExtensions`를 추가한다.
- 실제 소스가 생긴 세 패키지에만 typecheck 스크립트를 추가한다. UI 구현·렌더러·웹 생성은 후속 단계다.
- 기존 앱과 API의 외부 의존성 버전을 바꾸지 않는다. 일반 권한 설치로 기존 store를 사용해 2단계에서 확인한 샌드박스 캐시 접근 문제를 피한다.

## 구현 순서

- [x] 작업 전 모바일 타입 검사와 전체 모바일 테스트를 실행하고 색상·파일·lockfile 기준을 보관한다.
- [x] utils 공개 진입점으로 확장 데이터 보존과 한글 NFC 검색을 검증하는 테스트를 작성하고 미구현 패키지 진입점으로 실패하는 것을 확인한다.
- [x] `packages/contracts/src/location.ts`, `src/index.ts`를 만들고 source exports와 typecheck를 연결한다.
- [x] `packages/utils/src/formatLocationPrice.ts`, `filterLocations.ts`, `index.ts`에 실제 함수를 이동한다. 제네릭 반환 타입을 컴파일로 검증하는 fixture를 추가한다.
- [x] 색상 JSON을 공통 토큰으로 이동하고 JSON subpath export와 typecheck를 연결한다.
- [x] 모바일의 공통 패키지 dependencies, 타입 확장, 함수 재수출, 모든 색상 import와 Tailwind require를 연결한다. 루트에 shared typecheck·test 명령을 추가한다.
- [x] pnpm lockfile 갱신 후 frozen 설치로 로컬 연결을 구성한다.
- [x] 세 패키지 타입 검사, 공통 테스트, 기존 모바일 전체 테스트, 모바일 타입 검사를 실행한다.
- [x] Expo iOS·Android export로 Metro와 NativeWind의 공통 패키지 해석을 검증한다. 기존 Expo monorepo 자동 설정을 사용하고 불필요한 수동 Metro 설정을 추가하지 않는다.
- [x] 문서의 현재 소스 위치·진입점·사용법·단계 상태를 갱신하고 결과를 보고한다.

## 검토할 조건

- 필터가 원본 순서와 객체 참조·모바일 확장 필드를 보존하는지 확인한다.
- null 요금과 실제 0원, 빈 검색·사이즈 누락 등 기존 테스트 결과를 유지한다.
- JSON 색상은 작업 전 원본과 바이트 단위로 비교하고 Tailwind가 실제 공통 파일을 읽는지 확인한다.
- Node 테스트와 Metro가 같은 source exports를 읽으며 플랫폼 중립 패키지에 네이티브 모듈을 포함하지 않는지 확인한다.
- 이동한 코드의 단일 원본, UI 미구현 상태와 Next.js 미생성 상태를 문서에서 구분한다.

## 실행 결과

3단계 구현을 완료했다. 모바일은 공통 타입·순수 함수·색상 원본을 패키지 이름으로 소비한다. 모바일 유틸리티 경로는 재수출 어댑터로 유지한다. UI 렌더러와 Next.js 웹은 아직 생성하지 않았다.

### 구현과 조정

- 공개 진입점을 읽는 새 테스트를 먼저 작성했다. 2단계 패키지에는 exports가 없어 `MODULE_NOT_FOUND`로 실패했고, 실제 소스와 exports 연결 후 2개가 통과했다. 미구현 진입점의 실패이며 기존 검색 동작의 버그를 수정한 것은 아니다.
- 공통 `LocationData`는 모바일 `ImageSourcePropType`을 포함하지 않는다. 모바일에서 `LocationPoint`로 확장하고 필터의 제네릭 반환이 확장 필드 타입·객체 참조·순서를 보존하도록 했다.
- utils의 명시적 `.ts` export 때문에 첫 모바일 타입 검사에서 TS5097을 확인했다. 모바일 tsconfig에도 `allowImportingTsExtensions: true`를 추가한 후 통과했다. 향후 Next.js 소비자에서도 이 옵션과 `transpilePackages`를 설정한다.
- 색상 JSON은 위치만 옮겼고 바이트 단위로 동일하다. TSX 13곳과 Tailwind가 같은 JSON subpath를 읽는다. UI 마크업과 색상 값은 이번 단계에서 바꾸지 않았다.
- lockfile만 offline으로 먼저 갱신하고 frozen 설치로 workspace 링크를 구성했다. 외부 packages·snapshots·settings·overrides, API importer, 기존 모바일 의존성의 선언·해석 버전은 작업 전과 동일함을 비교했다.
- Expo의 기존 monorepo 자동 설정으로 양 플랫폼 번들이 생성되어 Metro 수동 설정은 추가하지 않았다. 근거: [Expo monorepo 문서](https://docs.expo.dev/guides/monorepos/).

### 검증 결과

| 검증 | 결과 |
| --- | --- |
| 작업 전 `pnpm typecheck:mobile`, 모바일 test | 통과, 기존 테스트 31개 |
| `pnpm install --offline --lockfile-only --ignore-scripts` | 통과 |
| `pnpm install --frozen-lockfile --ignore-scripts` | 통과, 기존 버전으로 workspace 연결 |
| `pnpm typecheck:shared` | contracts·utils·design-tokens 모두 통과. utils의 소비자 타입 fixture 포함 |
| `pnpm test:shared` | 실제 package exports 테스트 2개 통과 |
| `pnpm typecheck:mobile` | 소비자 설정 보완 후 통과 |
| `pnpm --filter @iambox/mobile test` | 기존 테스트 31개 통과 |
| `CI=1 EXPO_NO_TELEMETRY=1 pnpm --filter @iambox/mobile exec expo export --platform ios --platform android --output-dir /tmp/iambox-stage3-export --clear --max-workers 2` | exit 0. iOS·Android Hermes 번들 생성 |
| 이전 색상 JSON과 byte 비교, Tailwind require 원본 비교 | 동일 |
| 작업 전후 lockfile의 외부 의존성·API importer 비교 | 동일 |
| `git diff --check` | 통과 |

기기·시뮬레이터에서 화면, 지도, 네이티브 제스처·밝기를 재실행하지 않았다. API 구현을 변경하지 않아 서버 타입 검사·DB 검증은 이번 단계에서 다시 수행하지 않았다. 웹 생성·웹 빌드·UI 렌더러 검증은 후속 단계다. 기존 작업과 별도로 생성된 배너 파일은 이번 변경 목록에서 제외했다. 커밋은 생성하지 않았다.

### 코드 검토

읽기 전용 독립 검토에서 필수 수정 사항은 발견하지 않았다. 공통 타입 경계·제네릭 반환·source exports·모바일 소비자 설정을 확인했고, 13개 TSX 파일의 변경이 색상 import뿐임과 색상 원본·외부 의존성 보존도 확인했다. 검토자가 공통 3패키지·모바일 타입 검사와 공통 테스트 2개를 별도로 실행해 통과했다.

선택적 문서 지적은 공통 tsconfig를 상속하지 않는 것과 모바일 소비자 옵션을 추가한 것을 구분해 설명하라는 내용이며 `packages/README.md`에 반영했다. 이전부터 존재한 화면·지도·QR 밝기·에셋과 별도 배너 작업, 후속 단계의 UI 렌더러·Next.js 앱은 이번 변경과 무관하므로 검토 제외가 적절함을 확인했다.

### 변경 파일 전체

아래는 작업 시작 시 보관한 파일 기준과 비교한 이번 단계의 변경 경로다. 총 45개 경로이며, 삭제된 모바일 색상 파일과 새 공통 색상 파일을 각각 포함한다. 각 링크는 현재 작업 디렉터리의 실제 파일을 가리킨다.

| 파일 | 변경 |
| --- | --- |
| [README.md](/Users/jeongsu/Documents/study/iambox_app/README.md) | 3단계 현재 구조와 공통 검사 명령 안내 |
| [docs/ADR.md](/Users/jeongsu/Documents/study/iambox_app/docs/ADR.md) | ADR-003에 공통 코드 적용 상태와 경계 기록 |
| [docs/ARCHITECTURE.md](/Users/jeongsu/Documents/study/iambox_app/docs/ARCHITECTURE.md) | 공통 패키지 연결·색상 원본·검증 상태 반영 |
| [docs/DESIGN_SYSTEM.md](/Users/jeongsu/Documents/study/iambox_app/docs/DESIGN_SYSTEM.md) | 공통 색상 원본과 import 예시 갱신, UI 후속 단계 구분 |
| [docs/PROJECT_STRUCTURE.md](/Users/jeongsu/Documents/study/iambox_app/docs/PROJECT_STRUCTURE.md) | 실제 소스 트리·패키지 책임·검사 명령 갱신 |
| [docs/superpowers/plans/2026-10-02-shared-packages-stage3.md](/Users/jeongsu/Documents/study/iambox_app/docs/superpowers/plans/2026-10-02-shared-packages-stage3.md) | 이번 단계 계획·검증 결과·전체 변경 파일 기록 |
| [docs/superpowers/specs/2026-10-02-nextjs-shared-packages-design.md](/Users/jeongsu/Documents/study/iambox_app/docs/superpowers/specs/2026-10-02-nextjs-shared-packages-design.md) | 3단계 완료 상태와 소비자 TypeScript 설정 기록 |
| [mobile/README.md](/Users/jeongsu/Documents/study/iambox_app/mobile/README.md) | 모바일 재수출·공통 패키지 사용과 검증 결과 안내 |
| [mobile/assets/my/README.md](/Users/jeongsu/Documents/study/iambox_app/mobile/assets/my/README.md) | 색상 import 예시를 공통 패키지 경로로 변경 |
| [mobile/components/layout/BottomTabBar.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/components/layout/BottomTabBar.tsx) | 색상 import만 @iambox/design-tokens/colors.json으로 변경 |
| [mobile/components/layout/PlaceholderContent.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/components/layout/PlaceholderContent.tsx) | 색상 import만 @iambox/design-tokens/colors.json으로 변경 |
| [mobile/components/ui/BottomSheet.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/components/ui/BottomSheet.tsx) | 색상 import만 @iambox/design-tokens/colors.json으로 변경 |
| [mobile/components/ui/Button.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/components/ui/Button.tsx) | 색상 import만 @iambox/design-tokens/colors.json으로 변경 |
| [mobile/features/access/AccessContent.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/access/AccessContent.tsx) | 색상 import만 @iambox/design-tokens/colors.json으로 변경 |
| [mobile/features/home/HomeContent.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/home/HomeContent.tsx) | 색상 import만 @iambox/design-tokens/colors.json으로 변경 |
| [mobile/features/locations/LocationFilterModal.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationFilterModal.tsx) | 색상 import만 @iambox/design-tokens/colors.json으로 변경 |
| [mobile/features/locations/LocationList.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationList.tsx) | 색상 import만 @iambox/design-tokens/colors.json으로 변경 |
| [mobile/features/locations/LocationLogo.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationLogo.tsx) | 색상 import만 @iambox/design-tokens/colors.json으로 변경 |
| [mobile/features/locations/LocationMarker.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationMarker.tsx) | 색상 import만 @iambox/design-tokens/colors.json으로 변경 |
| [mobile/features/locations/LocationSearchHeader.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationSearchHeader.tsx) | 색상 import만 @iambox/design-tokens/colors.json으로 변경 |
| [mobile/features/locations/LocationsContent.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationsContent.tsx) | 색상 import만 @iambox/design-tokens/colors.json으로 변경 |
| [mobile/features/my/MyContent.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/my/MyContent.tsx) | 색상 import만 @iambox/design-tokens/colors.json으로 변경 |
| [mobile/package.json](/Users/jeongsu/Documents/study/iambox_app/mobile/package.json) | 공통 패키지 3개의 workspace 의존성 연결 |
| [mobile/tailwind.config.js](/Users/jeongsu/Documents/study/iambox_app/mobile/tailwind.config.js) | 공통 JSON subpath를 require |
| `mobile/theme/colors.json` (삭제) | [공통 colors.json](/Users/jeongsu/Documents/study/iambox_app/packages/design-tokens/src/colors.json)으로 원본 이동 |
| [mobile/tsconfig.json](/Users/jeongsu/Documents/study/iambox_app/mobile/tsconfig.json) | 공통 .ts exports를 위한 allowImportingTsExtensions 추가 |
| [mobile/types/location.ts](/Users/jeongsu/Documents/study/iambox_app/mobile/types/location.ts) | LocationData를 모바일 이미지 타입으로 확장 |
| [mobile/utils/filterLocations.ts](/Users/jeongsu/Documents/study/iambox_app/mobile/utils/filterLocations.ts) | 기존 경로를 유지하고 공통 검색 함수를 재수출 |
| [mobile/utils/formatLocationPrice.ts](/Users/jeongsu/Documents/study/iambox_app/mobile/utils/formatLocationPrice.ts) | 기존 경로를 유지하고 공통 요금 함수를 재수출 |
| [package.json](/Users/jeongsu/Documents/study/iambox_app/package.json) | typecheck:shared와 test:shared 명령 추가 |
| [packages/README.md](/Users/jeongsu/Documents/study/iambox_app/packages/README.md) | 실제 진입점·사용법·플랫폼 경계·검증 결과 안내 |
| [packages/contracts/package.json](/Users/jeongsu/Documents/study/iambox_app/packages/contracts/package.json) | 타입 소스 exports와 typecheck 연결 |
| [packages/contracts/src/index.ts](/Users/jeongsu/Documents/study/iambox_app/packages/contracts/src/index.ts) | LocationData 공개 진입점 추가 |
| [packages/contracts/src/location.ts](/Users/jeongsu/Documents/study/iambox_app/packages/contracts/src/location.ts) | 플랫폼 중립 지점 표시 타입 추가 |
| [packages/design-tokens/package.json](/Users/jeongsu/Documents/study/iambox_app/packages/design-tokens/package.json) | colors.json subpath exports와 typecheck 연결 |
| [packages/design-tokens/src/colors.json](/Users/jeongsu/Documents/study/iambox_app/packages/design-tokens/src/colors.json) | 기존 모바일 색상 JSON을 변경 없이 이동 |
| [packages/tsconfig.base.json](/Users/jeongsu/Documents/study/iambox_app/packages/tsconfig.base.json) | allowImportingTsExtensions 추가 |
| [packages/utils/package.json](/Users/jeongsu/Documents/study/iambox_app/packages/utils/package.json) | 소스 exports·typecheck·실제 진입점 test 연결 |
| [packages/utils/src/filterLocations.ts](/Users/jeongsu/Documents/study/iambox_app/packages/utils/src/filterLocations.ts) | 기존 검색 구현 이동, 제네릭으로 확장 타입 보존 |
| [packages/utils/src/formatLocationPrice.ts](/Users/jeongsu/Documents/study/iambox_app/packages/utils/src/formatLocationPrice.ts) | 기존 요금 표시 구현 이동 |
| [packages/utils/src/index.ts](/Users/jeongsu/Documents/study/iambox_app/packages/utils/src/index.ts) | 검색·요금 함수의 공개 진입점 추가 |
| [packages/utils/tests/filterLocations.types.ts](/Users/jeongsu/Documents/study/iambox_app/packages/utils/tests/filterLocations.types.ts) | 소비자 확장 타입을 반환하는지 컴파일로 검증 |
| [packages/utils/tests/package.test.cjs](/Users/jeongsu/Documents/study/iambox_app/packages/utils/tests/package.test.cjs) | 실제 패키지의 확장 데이터·객체 참조·NFC 검색 테스트 2개 |
| [packages/utils/tsconfig.json](/Users/jeongsu/Documents/study/iambox_app/packages/utils/tsconfig.json) | 소비자 타입 fixture를 검사 범위에 포함 |
| [pnpm-lock.yaml](/Users/jeongsu/Documents/study/iambox_app/pnpm-lock.yaml) | 모바일의 공통 workspace 링크 기록, 외부 의존성 버전 유지 |
