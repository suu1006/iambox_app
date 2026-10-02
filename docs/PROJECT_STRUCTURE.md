# Project Structure

> 기준일: 2026-10-02. 루트 `mobile/`, `api/`, `web/`와 `packages/*`의 pnpm 워크스페이스다. 웹은 홈 화면이 비어 있는 Next.js 기본 구조다.

## 현재 디렉토리 구조

```text
iambox_app/
├── AGENTS.md
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .gitignore
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── ADR.md
│   ├── PROJECT_STRUCTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── DESIGN_SYSTEM.md
│   └── superpowers/
│       ├── specs/2026-10-02-nextjs-shared-packages-design.md
│       ├── plans/2026-10-02-shared-packages-stage2.md
│       ├── plans/2026-10-02-shared-packages-stage3.md
│       ├── plans/2026-10-02-shared-ui-stage4.md
│       └── plans/2026-10-02-nextjs-web-stage5.md
├── packages/
│   ├── README.md                 # 공통 코드 사용법과 검증 안내
│   ├── tsconfig.base.json        # 공통 패키지 전용 TypeScript 설정
│   ├── contracts/               # src/location.ts, index.ts, package.json, tsconfig.json
│   ├── utils/                   # src/의 가격·검색 함수와 index.ts, tests/, package.json, tsconfig.json
│   ├── design-tokens/           # src/의 색상·타이포그래피·간격·반경·그림자 JSON과 런타임/타입/Tailwind 어댑터
│   └── ui/                      # package.json, tsconfig.json, tsconfig.native.json
│       ├── src/shared/           # button.ts, badge.ts: props·규칙
│       ├── src/native/           # Button.tsx, Badge.tsx, index.ts
│       ├── src/web/              # Button.tsx, Badge.tsx, index.ts, styles.css
│       └── tests/                # 경계 동작·플랫폼별 props 검사
├── web/                         # Next.js / App Router / 기본 3001
│   ├── package.json, tsconfig.json, next.config.mjs
│   ├── AGENTS.md, CLAUDE.md       # Next dev 생성 가이드
│   ├── src/app/                  # layout.tsx, page.tsx, globals.css
│   └── README.md
├── mobile/
│   ├── index.ts
│   ├── App.tsx
│   ├── app.json
│   ├── app.config.ts              # 네이버 인증·앱 식별자·네이티브 플러그인
│   ├── .env.example               # 공유 가능한 모바일 환경변수 예시
│   ├── .env.local                 # 로컬 Client ID / Git 제외
│   ├── package.json
│   ├── metro.config.js             # SVG + NativeWind 설정
│   ├── babel.config.js             # Expo + NativeWind preset
│   ├── tailwind.config.js          # 클래스 탐색 경로와 공통 디자인 토큰
│   ├── global.css                  # Tailwind 진입점
│   ├── nativewind-env.d.ts         # className과 CSS import 타입
│   ├── components/ui/             # Button, Badge, Decorative, Dialog, BottomSheet
│   ├── components/layout/         # ScreenContainer, AppHeader, BrandLogo, BottomTabBar, PlaceholderContent
│   ├── features/home/             # HomeContent, EventBanner
│   ├── features/locations/        # 지도·커스텀 마커·지점 상세·시트 목록
│   ├── features/access/           # AccessContent, QrAccessModal, useQrBrightness
│   ├── features/my/               # MyContent: 프로필·바로가기·메뉴·법적 문서 모달
│   ├── features/delivery/         # DeliveryContent: 서비스 소개 / DeliveryModal: 빈 중앙 팝업
│   ├── tests/                     # Node 내장 테스트: QR 밝기, 지점 요금·목록, 시트 높이
│   ├── mocks/                     # access.ts: 이용 정보 / locations.ts: mock 좌표·이름·주소·가격·이미지·배지 / my.ts: 마이 메뉴 안내
│   ├── types/location.ts          # 공통 LocationData + 모바일 이미지 타입
│   ├── utils/                     # 공통 가격·검색 함수 재수출, 모바일 시트 높이·QR 밝기
│   ├── navigation/
│   │   ├── tabs.ts                # 탭 정의와 TabKey
│   │   └── LocationsStack.tsx     # 지도·상세 경로와 지점 ID 전달
│   ├── svg.d.ts                    # SVG import 타입
│   ├── tsconfig.json
│   ├── README.md
│   └── assets/                    # my/: 마이페이지 벡터 SVG 12개와 사용 안내, locations/: 지점 목록 mock 사진
└── api/
    ├── package.json
    ├── tsconfig.json
    ├── nest-cli.json
    ├── README.md
    ├── .env.example
    ├── .env                         # 로컬 설정 / Git 제외
    ├── prisma.config.ts
    ├── prisma/
    │   └── schema.prisma
    └── src/
        ├── main.ts
        ├── app.module.ts
        ├── app.controller.ts
        ├── app.service.ts
        ├── prisma/
        │   ├── prisma.module.ts
        │   ├── prisma.service.ts
        │   └── check-connection.ts
        └── generated/prisma/        # 자동 생성 / Git 제외
```

트리는 소스·설정 중심이다. 로컬 `node_modules/`, `mobile/.expo/`, `mobile/dist/`, `api/dist/`는 생략했다. `.env`, `.env.local`과 생성 클라이언트는 로컬에 있어도 새 checkout에 포함되지 않는다. Expo prebuild가 생성하는 `mobile/android/`, `mobile/ios/`도 Git에서 제외한다.

## 디렉토리와 파일 책임

| 위치 | 역할 / 둘 파일 | 두지 않을 파일·내용 |
| --- | --- | --- |
| 루트 | 워크스페이스 설정, 공통 실행 명령, lockfile, 개요 | 화면 구현, 서버 도메인 코드, 비밀값 |
| `AGENTS.md` | 에이전트 작업 지침, 한글 커밋 메시지 규칙, 문서 참조 | 상세 API 계약이나 데이터 모델의 중복 정의 |
| `docs/` | 제품·구조·DB·API·디자인 시스템 기준 문서 | 런타임 코드, 실제 인증정보 |
| `docs/ADR.md` | 구조와 코드 배치 결정의 배경·대안·적용 현황·재검토 조건 | 현재 구현 상태를 확인하지 않은 완료 기록 |
| `web/` | Next.js 빈 홈 화면·로컬 3001 실행·공유 패키지 연결 설정 | 모바일 mock·네이티브 모듈, 미구현 업무 기능 완료 주장 |
| `packages/` | 공통 데이터·순수 함수·디자인 토큰과 플랫폼별 UI | 앱·서버 전용 코드 배치 |
| `packages/tsconfig.base.json` | 공통 패키지 전용 strict·noEmit·Bundler 설정 | 모바일 Expo 설정이나 API NodeNext 설정 대체 |
| `packages/contracts/` | LocationData 등 플랫폼 중립 데이터 타입 | 네이티브 이미지 타입, 미확정 API 계약을 실제 계약으로 설명 |
| `packages/utils/` | contracts를 참조하는 가격 표시·지점 검색과 테스트 | 네트워크·기기 API, 모바일 시트·밝기 규칙 |
| `packages/design-tokens/` | 색상·타이포그래피·간격·반경·그림자 JSON 원본과 소비 어댑터 | 앱 내부에 토큰 원본 복제 |
| `packages/ui/` | Button·Badge 공통 props·규칙과 native/web 렌더러 | shared의 플랫폼 모듈 의존, 두 렌더러 루트 export |
| `mobile/` | 앱 진입점, 모바일 소스와 설정 | DB 접속 코드, 서버 비밀키 |
| `mobile/index.ts` | Expo 루트 등록 | 업무 처리 |
| `mobile/App.tsx` | 앱 구성 진입점, 탭 상태와 컴포넌트 배치 | 기능이 커진 뒤 모든 업무 로직을 한 파일에 누적 |
| `mobile/components/ui/` | 여러 화면에서 쓰는 기본 UI: 버튼, 배지, 장식 래퍼, 안내 모달 | 특정 기능의 문구·mock 데이터, API 요청, 전역 상태 |
| `mobile/components/layout/` | 화면 뼈대: 스크롤 컨테이너, 헤더, 하단 탭, 임시 화면 | 기능별 업무 UI |
| `mobile/features/home/` | 홈 화면과 이벤트 배너 | 다른 탭의 업무 로직 |
| `mobile/features/locations/` | 지점찾기 화면, 지도 SDK 연결 | 서버 DB 연결, 다른 탭의 업무 로직 |
| `mobile/features/access/` | 출입QR 내 공간 화면, QR 안내창, 화면 밝기 hook | QR 발급 API, 서버 출입 인증 |
| `mobile/features/my/` | 마이페이지 UI, 기존 내 공간 탭 이동, 메뉴·약관 안내 모달 | 실제 인증·로그아웃, 예약·결제·문의 처리, 정식 법적 본문 |
| `mobile/features/delivery/` | 택배 소개 UI·이용하기/이용 방법 빈 중앙 팝업 | 실제 접수·배송 조회·API 요청 |
| `mobile/tests/` | Node 내장 테스트로 밝기 복원·비동기 경합·지점 요금 표시 검증 | 실제 기기 밝기 검증을 대체하는 주장 |
| `mobile/mocks/` | 화면 확인용 예시 이용 정보·안내·지점 좌표·요금 데이터 | 실제 계약·인증 정보, API 호출 |
| `mobile/types/` | 공통 타입에 네이티브 필드를 더하는 모델 등 | 공통 타입 중복 정의, 런타임 업무 로직, UI 구현 |
| `mobile/utils/` | 공통 함수 재수출과 모바일 시트 높이·QR 밝기 규칙 | 공통 구현 복제, React hooks, 화면 렌더링 |
| `mobile/navigation/` | 탭 정의·타입과 지점찾기 Native Stack·경로 타입 | 화면 업무 로직 |
| `mobile/assets/` | 아이콘 등 번들 정적 이미지 | API 응답, TS 업무 로직 |
| `api/` | 서버 패키지·환경·빌드·Prisma CLI 설정 | 모바일 UI |
| `api/src/` | 부팅, 모듈, Controller, Service | DB migration SQL, 빌드 출력 |
| `api/src/prisma/` | DB 연결 수명 주기, 모듈 제공, 연결 확인 CLI | 결제·예약 등 개별 업무 규칙 |
| `api/prisma/` | Prisma 스키마, 향후 migration 이력 | HTTP 처리 코드, 생성 클라이언트 |
| `api/src/generated/prisma/` | Prisma 생성물 | 직접 작성·수정한 코드; Git에 추가하지 않음 |
| `node_modules/`, `dist/`, `.expo/` | 의존성, 빌드 출력, 로컬 Expo 상태 | 직접 유지할 소스; Git에 추가하지 않음 |

`api/.env.example`에는 공유 가능한 설정 예시, `.env`에는 실제 로컬 설정을 둔다. `mobile/app.json`은 공통 Expo 설정, `mobile/app.config.ts`는 이를 확장해 네이버 지도 인증·Maven 저장소·개발용 앱 식별자를 설정한다. `mobile/.env.example`을 바탕으로 `.env.local`에 Client ID를 입력한다. 각 `tsconfig.json`은 TypeScript 설정을 관리한다.

## 대량 지점 마커 파일 (2026-10-02)

- `NaverLocationMap.tsx`·`useBranchClusters.ts`: idle bbox/zoom·카메라·Supercluster memo 인덱스·150ms 진입 전환. `LocationMap.tsx`는 SDK 준비 검사만 담당한다.
- `ClusterMarker.tsx`·`LocationMarker.tsx`: 캐시된 이미지/기본 핀과 클릭 전달. `LocationsContent.tsx`는 검색·필터·선택 ID·기존 시트 상태를 관리하고 지점 선택을 바로 상세 이동 콜백에 전달한다.
- `MarkerArtwork.tsx`·`MarkerImageRenderer.tsx`·`useMarkerImages.ts`: SVG, 실측 기반 가변 폭, 단일 PNG export와 파일 수명 관리.
- `mobile/utils/branchClusters.ts`·`markerArtworkLayout.ts`·`markerImageCache.ts`: GeoJSON·bbox·실제 클러스터 결과, 측정 레이아웃, URI/크기 LRU 캐시. 기존 `selectMapMarkers.ts`의 격자 선택은 제거했다.
- `packages/contracts/src/location.ts`의 `LocationData`가 선택적 district/thumbnailUrl을 정의하고 모바일 `LocationPoint`가 photoSource를 더한다. Branch 모델을 중복 만들지 않는다.
- `mobile/mocks/locationMarkerStress.ts`·`locations.ts`: 개발 전용 350개 분산/동일 좌표와 기본 3개 선택. 실제 API 연결은 없다.
- `mobile/tests/branchClusters.test.cjs`·`clusterHooks.test.cjs`·`locationMarkers.test.cjs`: 실제 라이브러리·hook 인덱스/전환·지도 경계. `markerImages`·`markerLayout`·`markerRenderer`·`locationNavigation`·`locationStress` 테스트는 캐시·텍스트·선택·규모를 확인한다. `tests/helpers/mountComponent.cjs`는 Node에서 React 수명주기와 네이티브 경계를 대체하는 공용 테스트 도구다.
- `patches/@mj-studio__react-native-naver-map@2.9.0.patch`: SDK 캐시 상한·오래된 이미지 응답 차단·alpha 보존. pnpm patchedDependencies/lockfile로 적용하며 앱을 네이티브 재빌드한다. `markerNativeCache.check.cjs`는 실제 iOS C++ 캐시 헤더를 컴파일해 검사한다.

## 새로운 파일 배치 기준

2026-10-02에 Next.js `web/`과 `packages/`를 같은 저장소에 추가하는 설계를 채택했다([ADR-003](ADR.md#adr-003-nextjs-웹과-모바일의-공통-패키지를-구성한다), [상세 설계](superpowers/specs/2026-10-02-nextjs-shared-packages-design.md)). 3단계에서 공통 데이터·가격·검색·색상 소스와 exports를 모바일에 연결했다. 4단계에서 Button·Badge 공통 규칙과 native/web 렌더러를 연결했다. 5단계에서 Next.js 기본 확인 화면과 실행 명령을 연결했다. 웹 업무 기능은 후속 범위다.

1. 제품·계약·설계 설명은 이 문서 목록 중 해당 문서를 수정한다.
2. 모바일 소스는 `mobile/`, 서버 소스는 `api/src/` 아래에 둔다.
3. 서버 기능이 실제로 추가될 때 `api/src/<domain>/`에 Module·Controller·Service와 필요한 DTO를 함께 둔다. 현재 도메인 폴더는 없다.
4. 모바일 새 화면의 경로·전환은 `mobile/navigation/`의 React Navigation Native Stack에 정의한다. 현재 Expo Router가 없으므로 `app/` 폴더가 자동 라우팅된다고 가정하지 않는다.
5. 기능별 UI·hooks·API 연동은 `mobile/features/<feature>/`에 둔다. 현재 `features/home/`, `features/locations/`, `features/access/`를 사용한다. 여러 기능에서 실제로 재사용하는 기본 UI는 `mobile/components/ui/`에 두되 공유 Button·Badge는 `@iambox/ui/native`를 재수출한다. 나머지 모바일 전용 UI는 기존 위치를 유지하고, 화면 뼈대는 `mobile/components/layout/`에 두고 각 폴더의 `index.ts`로 내보낸다. 공통 HTTP 처리가 필요해지면 `mobile/services/`로 분리할 수 있다. `services/`는 **예정 배치 지침**이다.
6. 색상은 `@iambox/design-tokens/colors.json`, 타이포그래피·간격·반경·그림자는 `@iambox/design-tokens` 토큰을 사용한다. JSON 원본은 `packages/design-tokens/src/`에 있고 모바일 Tailwind는 JSON 변경 감시를 위해 상대 경로 `../packages/design-tokens/src/tailwind.cjs`로 공통 어댑터를 읽는다. 화면에 hex·글자 크기·간격·반경·그림자 원본을 복제하지 않는다. 이미지·지도·반응형 계산 등 전용 수치는 화면에 유지한다. 기준은 [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)를 따른다.
7. 모바일 전용 타입·유틸리티는 `mobile/types/`, `mobile/utils/`에 둔다. 공유 데이터 타입·함수는 `packages/contracts`, `packages/utils`에 두고 모바일 이미지 타입은 모바일에서 확장한다. 기존 가격·검색 유틸리티 경로는 공통 함수를 재수출한다. 컴포넌트 내부 props 타입·구현 파생 타입·도구 선언은 기존 위치에 유지하고 React hooks는 `features/<feature>/`에 둔다([ADR-002](ADR.md#adr-002-타입과-유틸리티를-별도-폴더로-분리한다), [ADR-003](ADR.md#adr-003-nextjs-웹과-모바일의-공통-패키지를-구성한다)).
8. 데이터 모델은 `api/prisma/schema.prisma`를 수정한다. 생성물을 직접 수정하지 않는다.

미사용 폴더, 공유 패키지, Repository 계층을 선행 생성하지 않는다. 실제 구조가 바뀌면 이 문서의 트리와 책임 표를 갱신한다.

- `tests/locationNavigation.test.cjs`는 실제 지도 컴포넌트의 선택 전달·포커스에 따른 뒤로가기 등록·필터/시트/탭 복귀 순서·화면 복귀 상태와 Stack 경로의 지점 ID 전달·조회·잘못된 ID 안내를 검증한다. `tailwind.config.js`는 `navigation/`도 클래스 탐색에 포함한다.

## 주요 명령 (루트에서 실행)

| 명령 | 역할 |
| --- | --- |
| `pnpm dev:mobile --port 8082` | 설치한 개발용 앱에 연결하는 Expo 개발 서버 |
| `pnpm --filter @iambox/mobile android --port 8082` | Android 개발용 앱 빌드·설치 (SDK/기기 필요) |
| `pnpm --filter @iambox/mobile ios --port 8082` | iOS 개발용 앱 빌드·설치 (Xcode 필요) |
| `pnpm typecheck:mobile` | 모바일 타입 검사 |
| `pnpm dev:web` | 로컬 3001 Next.js 개발 서버 |
| `pnpm typecheck:web` | Next 타입 생성 후 웹 타입 검사 |
| `pnpm build:web` | Next.js 프로덕션 빌드 |
| `pnpm typecheck:shared` | 공통 4패키지 타입 검사, UI web/native 분리 검사 |
| `pnpm test:shared` | utils 공개 진입점·UI 렌더러 경계 테스트 |
| `pnpm --filter @iambox/mobile test` | QR 밝기 복원·앱 상태·비동기 경합 테스트 (Node 22.18 이상) |
| `pnpm dev:api` | Prisma 생성 후 Nest 개발 서버 |
| `pnpm typecheck:api` | Prisma 생성 후 서버 타입 검사 |
| `pnpm build:api` | Prisma 생성 후 서버 빌드 |
| `pnpm --filter @iambox/api db:check` | 빌드 후 DB 연결·DB 이름 확인 |

서버 실행에는 `DATABASE_URL`과 접근 가능한 PostgreSQL이 필요하다. 상세 실행 안내는 기존 mobile/api README를 참고한다.

홈의 `features/home/HomeContent.tsx`는 소개, 큰 물품 보관 카드와 오른쪽 택배요청·사전방문 카드, 원형 바로가기 4개(창업문의·지점 찾기·AI 견적·공지사항), 이벤트·후기 예시를 순서대로 표시한다. 물품 보관 카드는 출입QR과 같은 `assets/imbox_storage_A-024.svg`(PNG 내장)를 정적 import하며 기존 `assets/home-storage.svg`는 홈 카드에서 사용하지 않는다. 사전방문은 사용자 제공 PNG의 형태와 색상을 추적한 `assets/home-pre-visit.svg`를 사용하며, 택배요청의 `assets/home-delivery.svg`와 같이 정적 벡터로 표시한다. 물품 보관은 그림 높이 126px·장식 영역 최소 높이 126px·전체 너비 안에 원본 비율로 표시한 뒤 `scale: 1.25`로 그림만 25% 확대하며, 사전방문은 기존 62px 높이·최대 114px 너비를 유지한다. 원본 PNG는 참고용으로 보관한다. `tests/homeIllustrations.test.cjs`는 320px·390px 화면의 첫 렌더와 재진입에서 물품 보관이 출입QR과 같은 내장 이미지를, 택배요청·사전방문이 벡터 경로를 제공하는지 검증한다. 바로가기 4개는 선택 라인 시안의 윤곽을 재구성한 경량 SVG 파일이다. 바로가기는 32×32로 표시하고 `color` prop으로 브랜드 토큰을 전달한다. 기존 `01_storage_boxes.svg`와 `04_startup_store.svg`는 헤더·후기에 유지한다. 이전 이벤트 예시에서 쓰던 `02_moving_truck.svg`, `03_branch_map_pin.svg`는 현재 import하지 않는다. 지점 찾기는 `App.tsx`에서 전달한 콜백으로 기존 탭을 열고, 나머지는 공통 `InfoDialog`로 준비 안내 모달을 표시한다. 실제 신청·문의·공지 데이터와 API 연동은 없다.

`features/home/EventBanner.tsx`는 시안 이벤트 배너 3개(부산 첫 결제 할인·보관함 묶음 할인·이용후기 쿠폰)를 4초 간격으로 왼쪽으로 슬라이드 전환한다. 배너는 `assets/home-event-busan-discount.png`, `home-event-storage-bundle.png`, `home-event-review-coupon.png`이며 문구가 이미지에 포함되어 있어 같은 문구를 접근성 라벨로 제공한다. 컨테이너는 원본 2022×778 비율로 높이를 정하고, 슬라이드 행은 측정한 너비가 컨테이너 크기에 다시 영향을 주지 않도록 절대 위치로 배치한다. 이미지 안의 `혜택 확인하기` 등은 그림일 뿐 터치 동작과 실제 이벤트 데이터는 연결하지 않았다. 실제 배너 너비만큼 500ms 동안 이동하며, 마지막에 첫 카드의 복제본을 배치해 마지막 → 첫 이벤트도 같은 방향으로 이어진다. 오른쪽 하단의 연한 회색 타원형 배지에 현재 페이지/전체 개수를 표시하고 화면 밖 카드와 복제본은 접근성 탐색에서 제외한다. 배너 너비가 바뀌면 현재 페이지에 맞춰 위치를 조정하고, 홈을 벗어나면 타이머와 애니메이션을 정리한다.

지점찾기의 `features/locations/LocationsContent.tsx`는 상단 검색·필터·선택 ID·시트 상태를 관리하고 지점 선택을 바로 Navigator에 전달한다. 지도는 상세 뒤에도 마운트된 상태로 유지하여 카메라를 보존하고 배경 지도 터치·접근성 탐색을 막는다. `LocationMap.tsx`는 실행 환경·설정을 확인한 뒤 `NaverLocationMap.tsx`를 지연 로드한다. 네이버 지도에 `LocationMarker.tsx`가 캐시된 말풍선 PNG 또는 SDK 기본 핀·캡션을 전달하며, `navigation/LocationsStack.tsx`는 지도·상세 경로와 ID 전달을 관리하고, `LocationDetail.tsx`가 선택한 지점의 예시 주소·요금과 뒤로가기를 제공한다. 상세 이동과 복귀는 Native Stack을 사용하며 지도 컴포넌트 상태를 유지한다. `LocationLogo.tsx`는 상세용 벡터 SVG 심볼 표시, `utils/formatLocationPrice.ts`는 마커·상세 공용 원화 표시와 요금 없음 안내를 담당한다. `types/location.ts`는 `LocationPoint`, `mocks/locations.ts`의 `mockLocations`는 기본 mock ID·좌표·이름·주소·요금 3개를 제공하고 개발 검증 플래그 사용 시 가상 지점 350개를 제공한다. 로고 원본은 `assets/iambox-logo-source.png`, 전체 로고와 심볼은 `assets/iambox-logo.svg`, `assets/iambox-logo-symbol.svg`이다. `components/layout/BrandLogo.tsx`는 홈에서 전체 로고를 원본 비율로 표시하며 공통 헤더의 선택적 로고에도 사용한다. 마이페이지와 택배 탭에는 전체 로고를 표시하지 않는다. `tests/locationPrice.test.cjs`는 요금이 없을 때 0원으로 오인하지 않는 표시를 검증한다. `LocationList.tsx`는 선택적인 이미지와 주소 → 이용 가능한 사이즈 → 최저가를 표시한다. 시트 인덱스에 따른 숨김 없이 접힌 상태에서도 행 일부를 유지하고 초기 10개·후속 최대 10개 배치·5개 화면 높이 윈도우로 가상화한다. 전체 데이터를 전달하고 스크롤에 따라 추가 렌더링하며 API 페이지 조회는 미구현이다. 행 전체를 선택하면 바로 상세를 연다. 상세 복귀 시 기존 시트 높이와 클러스터 구성 목록을 유지한다. `LocationSearchHeader.tsx`는 고정 검색창·필터 버튼, `LocationFilterModal.tsx`는 사이즈 임시 선택·초기화·적용·취소를 표시한다. `utils/filterLocations.ts`는 이름·주소 검색과 OR 사이즈 필터를 결합하고 부모가 같은 결과를 지도·목록에 전달한다. `tests/locationFilters.test.cjs`는 검색 정규화·조건 결합·누락 데이터·원본 보존을 검증한다. 시설 배지 영역은 표시하지 않는다. 강남·서초·성수 mock 사진은 `assets/locations/`의 지점 내부 JPEG 3장이다. `tests/locationList.test.cjs`는 선택과 이벤트 전달·데이터 누락·빈 목록·접힘/펼침 시 표시 유지·가상화 전달 설정을 검증한다. Node 테스트는 실제 네이티브 스크롤 성능 검증을 대신하지 않는다. 좌표 기반 클러스터와 선택 카메라 이동은 구현했다. 특가·지도/목록 모드 전환·실제 API는 후속 단계다. `tailwind.config.js`는 `features/`도 클래스 탐색 대상으로 포함한다.

출입QR의 `features/access/AccessContent.tsx`는 보관 공간 카드, 이용 기간, 방문 안내, 문의 영역을 표시한다. `mocks/access.ts`의 mock 데이터를 사용하고 각 버튼은 공통 `InfoDialog`로 예시 안내 모달을 연다. `assets/arrow-right.svg`, `chevron-right.svg`, `guide.svg`, `headset.svg`, `location.svg`, `qr-scan.svg`와 사용자 제공 원본 `assets/imbox_storage_A-024.svg`를 정적 import해 사용하며 실제 QR·지도·문의 기능은 연결하지 않았다.

QR 안내는 `App.tsx`가 표시 상태를 관리하는 `features/access/QrAccessModal.tsx`로 분리한다. Android는 앱 루트 오버레이(`DialogBackdrop` + `DialogCard`), iOS는 공통 `InfoDialog`의 네이티브 모달을 사용한다. `useQrBrightness.ts`는 모듈 지원 여부 확인과 React 수명 주기를 연결하고, `utils/brightnessSession.ts`는 앱 상태 구독·최대 밝기 적용·이전 밝기 복원을 직렬화한다. `tests/brightnessSession.test.cjs`는 네이티브 밝기 API만 대체해 빠른 열기·닫기와 앱 전환 및 실패 후 복원 동작을 검증한다.


### 지도 하단 공통 바텀 시트 (2026-10-01)

- `components/ui/BottomSheet.tsx`는 지도와 무관한 상시 시트 외형·높이 전환·손잡이 접근성을 제공한다. `utils/bottomSheetLayout.ts`는 부모 영역 기준 기본 높이 계산만 담당한다. `components/ui/index.ts`에서 시트·타입과 라이브러리의 `BottomSheetScrollView`, `BottomSheetFlatList`, `BottomSheetView`를 함께 제공한다.
- `features/locations/LocationsContent.tsx`는 화면 최상단 지도 바로 위에 `LocationSearchHeader`만 배치하고, 지도 영역 안에서 시트를 배치해 높이 상태·Android 뒤로가기를 관리한다. 지점 수 제목·펼치기/접기 버튼은 표시하지 않으며 손잡이로 높이를 조절한다. `LocationList.tsx`는 기존 안내 예시 `LocationSheetContent.tsx`를 대체한 실제 목록 UI이며 현재 데이터는 예시다. 부모는 강조 ID·상세 표시·검색어·적용 사이즈·필터 임시 사이즈를 관리한다. 검색은 일반 `TextInput`을 사용하고 시트에는 검색·입력 측정 헤더를 전달하지 않는다.
- `App.tsx`에 `GestureHandlerRootView`를 배치한다. `package.json`과 루트 lockfile에 `@gorhom/bottom-sheet 5.2.14`, Expo SDK 57 호환 `react-native-gesture-handler ~2.32.0`을 추가했다. 기존 Reanimated/Worklets 버전은 유지하며, 새 네이티브 모듈을 포함한 개발용 앱 재빌드가 필요하다.
- `tests/bottomSheetLayout.test.cjs`는 부모 높이 600/200, 실제 헤더 높이·큰 글자·부족한 영역, 측정 전·잘못된 높이의 계산을 6개 테스트로 검증한다. 네이티브 제스처와 접근성은 기기에서 별도로 확인한다.

## 공통 구조 확정과 후속 작업 (2026-10-02, 6단계)

`api/`, `mobile/`, `web/`은 독립 실행 앱이며 `packages/`는 두 프런트엔드의 재사용 코드다. 디렉토리 이동·새 프레임워크·의존성 변경 없이 통합 검증을 마쳤다. 웹 추가를 위해 별도 저장소를 만들 필요가 없으며 후속 웹 기능은 `web/src/`에서 확장한다.

현재 공통 범위는 LocationData·가격/검색·디자인 토큰·Button/Badge 규칙과 플랫폼별 렌더러다. 실제 API DTO·인증·라우팅·예약/결제와 복잡한 UI 공유는 요구사항이 생길 때 추가한다. API는 공통 타입을 아직 소비하지 않는다. 실행 명령·빌드/테스트·iOS 화면과 남은 기기 검증은 [6단계 결과](superpowers/plans/2026-10-02-monorepo-stage6.md)에 기록했다.
