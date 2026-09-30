# Project Structure

> 기준일: 2026-09-30. 루트 `mobile/`, `api/`의 pnpm 워크스페이스다. `apps/` 구조가 아니다.

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
│   ├── PROJECT_STRUCTURE.md
│   ├── DATABASE.md
│   └── API.md
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
│   ├── tailwind.config.js          # 클래스 탐색 경로와 색상
│   ├── global.css                  # Tailwind 진입점
│   ├── nativewind-env.d.ts         # className과 CSS import 타입
│   ├── components/                # AppHeader, HomeContent, EventBanner, AccessContent, BottomTabBar, PlaceholderContent
│   ├── features/locations/        # LocationsContent, LocationMap, NaverLocationMap, types
│   ├── features/access/           # QrAccessModal, useQrBrightness, brightnessSession
│   ├── tests/                     # Node 내장 테스트: QR 밝기 수명 주기와 경합
│   ├── mocks/                     # access.ts: 예시 이용 정보 / locations.ts: 지도 예시 좌표
│   ├── navigation/tabs.ts         # 탭 정의와 TabKey
│   ├── theme/colors.json          # Tailwind/SVG 공통 색상
│   ├── svg.d.ts                    # SVG import 타입
│   ├── tsconfig.json
│   ├── README.md
│   ├── LICENSE
│   └── assets/
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
| `docs/` | 제품·구조·DB·API 기준 문서 | 런타임 코드, 실제 인증정보 |
| `mobile/` | 앱 진입점, 모바일 소스와 설정 | DB 접속 코드, 서버 비밀키 |
| `mobile/index.ts` | Expo 루트 등록 | 업무 처리 |
| `mobile/App.tsx` | 앱 구성 진입점, 탭 상태와 컴포넌트 배치 | 기능이 커진 뒤 모든 업무 로직을 한 파일에 누적 |
| `mobile/components/` | 헤더, 홈 블록, 출입QR 내 공간·안내 모달, 하단 탭, 임시 콘텐츠 UI와 전용 스타일 | API 요청, 전역 상태 |
| `mobile/features/locations/` | 지점찾기 화면, 지도 SDK 연결, 기능 전용 타입 | 서버 DB 연결, 다른 탭의 업무 로직 |
| `mobile/features/access/` | QR 안내창, 화면 밝기 적용·복원과 앱 상태 연결 | QR 발급 API, 서버 출입 인증 |
| `mobile/tests/` | Node 내장 테스트로 밝기 복원·비동기 경합 검증 | 실제 기기 밝기 검증을 대체하는 주장 |
| `mobile/mocks/` | 화면 확인용 예시 이용 정보·안내·지점 좌표 데이터 | 실제 계약·인증 정보, API 호출 |
| `mobile/navigation/` | 탭 정의와 타입 (라우터 아님) | 화면 업무 로직 |
| `mobile/theme/` | 공통 색상 | 화면 전용 배치 |
| `mobile/assets/` | 아이콘 등 번들 정적 이미지 | API 응답, TS 업무 로직 |
| `api/` | 서버 패키지·환경·빌드·Prisma CLI 설정 | 모바일 UI |
| `api/src/` | 부팅, 모듈, Controller, Service | DB migration SQL, 빌드 출력 |
| `api/src/prisma/` | DB 연결 수명 주기, 모듈 제공, 연결 확인 CLI | 결제·예약 등 개별 업무 규칙 |
| `api/prisma/` | Prisma 스키마, 향후 migration 이력 | HTTP 처리 코드, 생성 클라이언트 |
| `api/src/generated/prisma/` | Prisma 생성물 | 직접 작성·수정한 코드; Git에 추가하지 않음 |
| `node_modules/`, `dist/`, `.expo/` | 의존성, 빌드 출력, 로컬 Expo 상태 | 직접 유지할 소스; Git에 추가하지 않음 |

`api/.env.example`에는 공유 가능한 설정 예시, `.env`에는 실제 로컬 설정을 둔다. `mobile/app.json`은 공통 Expo 설정, `mobile/app.config.ts`는 이를 확장해 네이버 지도 인증·Maven 저장소·개발용 앱 식별자를 설정한다. `mobile/.env.example`을 바탕으로 `.env.local`에 Client ID를 입력한다. 각 `tsconfig.json`은 TypeScript 설정을 관리한다.

## 새로운 파일 배치 기준

1. 제품·계약·설계 설명은 이 문서 목록 중 해당 문서를 수정한다.
2. 모바일 소스는 `mobile/`, 서버 소스는 `api/src/` 아래에 둔다.
3. 서버 기능이 실제로 추가될 때 `api/src/<domain>/`에 Module·Controller·Service와 필요한 DTO를 함께 둔다. 현재 도메인 폴더는 없다.
4. 모바일에 화면 분리가 필요하면 라우팅 방식을 먼저 결정한다. 현재 Expo Router가 없으므로 `app/` 폴더가 자동 라우팅된다고 가정하지 않는다.
5. 기능별 UI·hooks·API 연동은 `mobile/features/<feature>/`에 둘 수 있다. 현재 `features/locations/`를 지점찾기에 사용한다. 여러 기능에서 실제로 재사용하는 UI는 `mobile/components/`, 공통 HTTP 처리가 필요해지면 `mobile/services/`로 분리할 수 있다. `services/`는 **예정 배치 지침**이다.
6. 기능 전용 타입은 해당 기능 가까이에 둔다. 공용 `types/`는 실제 공유 필요가 생길 때만 만든다.
7. 데이터 모델은 `api/prisma/schema.prisma`를 수정한다. 생성물을 직접 수정하지 않는다.

미사용 폴더, 공유 패키지, Repository 계층을 선행 생성하지 않는다. 실제 구조가 바뀌면 이 문서의 트리와 책임 표를 갱신한다.

## 주요 명령 (루트에서 실행)

| 명령 | 역할 |
| --- | --- |
| `pnpm dev:mobile --port 8082` | 설치한 개발용 앱에 연결하는 Expo 개발 서버 |
| `pnpm --filter @iambox/mobile android --port 8082` | Android 개발용 앱 빌드·설치 (SDK/기기 필요) |
| `pnpm --filter @iambox/mobile ios --port 8082` | iOS 개발용 앱 빌드·설치 (Xcode 필요) |
| `pnpm typecheck:mobile` | 모바일 타입 검사 |
| `pnpm --filter @iambox/mobile test` | QR 밝기 복원·앱 상태·비동기 경합 테스트 (Node 22.18 이상) |
| `pnpm dev:api` | Prisma 생성 후 Nest 개발 서버 |
| `pnpm typecheck:api` | Prisma 생성 후 서버 타입 검사 |
| `pnpm build:api` | Prisma 생성 후 서버 빌드 |
| `pnpm --filter @iambox/api db:check` | 빌드 후 DB 연결·DB 이름 확인 |

서버 실행에는 `DATABASE_URL`과 접근 가능한 PostgreSQL이 필요하다. 상세 실행 안내는 기존 mobile/api README를 참고한다.

홈의 `HomeContent.tsx`는 소개, 큰 물품 보관 카드와 오른쪽 택배요청·케어서비스 카드, 원형 바로가기 4개, 이벤트·후기 예시를 순서대로 표시한다. `assets/home-*.svg` 7개는 선택된 시안에서 배경을 분리하고 추적한 벡터 경로이며, 사용법과 원본·변환 한계는 `assets/HOME_ASSETS.md`에 기록했다. 기존 `01_storage_boxes.svg` 등은 헤더·배너·후기에 유지한다. 지점 찾기는 `App.tsx`에서 전달한 콜백으로 기존 탭을 열고, 나머지는 로컬 상태의 준비 안내 모달을 표시한다. 실제 신청·문의·공지 데이터와 API 연동은 없다.

`EventBanner.tsx`는 이벤트 예시 4개를 4초 간격으로 왼쪽으로 슬라이드 전환한다. 실제 배너 너비만큼 650ms 동안 이동하며, 마지막에 첫 카드의 복제본을 배치해 마지막 → 첫 이벤트도 같은 방향으로 이어진다. 오른쪽 하단의 연한 회색 타원형 배지에 현재 페이지/전체 개수를 표시하고 화면 밖 카드와 복제본은 접근성 탐색에서 제외한다. 배너 너비가 바뀌면 현재 페이지에 맞춰 위치를 조정하고, 홈을 벗어나면 타이머와 애니메이션을 정리한다.

지점찾기의 `features/locations/LocationsContent.tsx`는 헤더·예시 데이터 안내·지도를 배치하고, `LocationMap.tsx`는 Expo Go·네이티브 모듈·인증 설정을 확인한 뒤 준비 안내 또는 `NaverLocationMap.tsx`를 지연 로드한다. `NaverLocationMap.tsx`는 네이버 기본 지도·한국어 캡션·기본 마커와 터치 안내를 렌더링한다. `types.ts`는 `LocationPoint` 타입, `mocks/locations.ts`는 실제 지점이 아닌 예시 좌표 3개를 제공한다. 행정구역 집계·가격·목록은 아직 구현하지 않았다. `tailwind.config.js`는 `features/`도 클래스 탐색 대상으로 포함한다.

출입QR의 `AccessContent.tsx`는 보관 공간 카드, 이용 기간, 방문 안내, 문의 영역을 표시한다. `mocks/access.ts`의 mock 데이터를 사용하고 각 버튼은 예시 안내 모달을 연다. `assets/arrow-right.svg`, `chevron-right.svg`, `guide.svg`, `headset.svg`, `location.svg`, `qr-scan.svg`와 제공 SVG에서 추출한 `imbox_storage_A-024.png`를 사용하며 실제 QR·지도·문의 기능은 연결하지 않았다.

QR 안내는 `App.tsx`가 표시 상태를 관리하는 `features/access/QrAccessModal.tsx`로 분리한다. Android는 앱 루트 오버레이, iOS는 네이티브 모달을 사용한다. `useQrBrightness.ts`는 모듈 지원 여부 확인과 React 수명 주기를 연결하고, `brightnessSession.ts`는 앱 상태 구독·최대 밝기 적용·이전 밝기 복원을 직렬화한다. `tests/brightnessSession.test.cjs`는 네이티브 밝기 API만 대체해 빠른 열기·닫기와 앱 전환 및 실패 후 복원 동작을 검증한다.
