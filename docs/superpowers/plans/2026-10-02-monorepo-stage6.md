# 모노레포 6단계 통합 검증·문서 정리 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 기존 api/mobile과 Next.js 기본 웹의 공유 경계·타입·빌드·실행을 검증하고 최종 사용법을 기록한다.

**Architecture:** 기존 api/, mobile/, web/, packages/를 유지한다. 웹은 플랫폼별 UI 렌더러와 공통 타입·함수·토큰을 사용하는 로컬 예시이며 업무 API는 연결하지 않는다.

**Tech Stack:** pnpm 12.6.0, TypeScript 6.0.3, Expo 57, React 19.2.3, Next.js 16.3.8, NestJS 12, Prisma 7.10.0.

**Spec:** [공통 패키지 설계](../specs/2026-10-02-nextjs-shared-packages-design.md).

## Global Constraints

- 사용자 요청에 따라 이번 6단계만 수행하고 변경 파일·검증 근거를 보고한다.
- 기존 외부 의존성, 화면 기능, API 계약과 DB 스키마를 변경하지 않는다.
- 웹은 API·DB 없이 로컬 3001, API는 기존 3000 설정을 유지한다.
- native/web 진입점 분리와 색상 단일 원본을 유지한다.
- 기기·시뮬레이터 검증은 가능한 환경에서 수행하고 export/테스트로 대체했다고 주장하지 않는다.

## Review Focus

1. 문서에 웹 기본 구조와 제품 기능 완료가 혼동되지 않는가.
2. API가 공통 화면 데이터 타입을 실제 응답 계약으로 오인하지 않는가.
3. 웹 진입점이 네이티브 패키지를 로드하거나 모바일이 DOM 렌더러를 소비하지 않는가.
4. 새 checkout의 명령·포트·생성 파일 안내가 실제 manifest와 맞는가.
5. 실행·빌드·기기 확인의 증거와 미검증 범위를 정확하게 구분하는가.

## Task 1: 통합 검증과 최종 문서

**Files:** README.md, packages/README.md, web/README.md, mobile/README.md, api/README.md, docs/PRD.md, docs/ARCHITECTURE.md, docs/PROJECT_STRUCTURE.md, docs/API.md, docs/ADR.md, docs/DESIGN_SYSTEM.md, 공통 설계, 이 계획. 실제 변경이 필요한 문서만 수정한다. 화면 확인 증거는 output/ 아래에 추가한다.

**Interfaces:** 이전 단계의 package exports·루트 실행 명령을 소비하고, 다음 제품 작업에 현재 공유 경계·사용법·검증 한계를 제공한다.

- [x] workspace·공통 소비자·React 해석·생성 파일 제외를 확인한다. 기대: 8프로젝트, 앱/웹의 공통 패키지 연결, 플랫폼 진입점 분리.
- [x] pnpm typecheck:shared, typecheck:mobile, typecheck:api, typecheck:web를 실행한다. 기대: 모두 종료 코드 0.
- [x] pnpm test:shared와 모바일 test를 실행한다. 기대: 총 45개 이상 통과, 실패 0.
- [x] pnpm build:api와 build:web, iOS/Android expo export를 수행한다. 기대: 빌드 성공, 공통 패키지 해석 성공.
- [x] 실제 브라우저에서 프로덕션 웹을 확인하고 가능한 iOS 시뮬레이터에서 앱을 확인한다. 기대: 공통 버튼·배지·검색 동작, 런타임 오류 없음. 환경 한계는 별도 기록.
- [x] 실행/사용법·현재 구현 상태·후속 범위를 갱신하고 문서 링크와 git diff --check를 확인한다.
- [x] 최종 독립 검토 후 결과·전체 변경 파일 링크를 남긴다.

## 실행 기록과 판단

- Ruling: 기존 checkout에서 이어서 검증 — 앞선 단계와 사용자 요청이 현재 미커밋 구조를 대상으로 하며 다른 작업도 존재한다 — 다른 작업의 변경은 커밋하거나 되돌리지 않는다.
- Ruling: 별도 기능·테스트 코드를 선행 추가하지 않는다 — 이번 단계는 검증·문서 작업이며 기능 변경이 발견될 때만 재현 검사와 수정이 필요하다 — 현재 기능 요구가 달라지면 별도 승인 단계가 필요하다.
- Pre-flight: mobile/web는 같은 4개 공통 패키지를 소비한다. UI는 native/web subpath로 분리되고 API는 아직 공통 데이터 타입을 소비하지 않는다. 검증 후 문서는 이 실제 경계를 따른다.

### 검증 결과

| 검증 | 결과 |
| --- | --- |
| workspace/공통 해석 | 루트 포함 8프로젝트, 앱·웹의 contracts/utils/색상 동일 경로, React 동일 인스턴스 |
| 공통·모바일·API·웹 타입 검사 | 모두 통과. API는 Prisma 생성 후 검사, 웹은 next typegen 후 검사 |
| 공통·모바일 테스트 | utils 2개·UI 12개·모바일 31개: 총 45개 통과, 실패 0 |
| API·Next.js 빌드 | 모두 통과. Next / 및 기본 404 정적 생성 |
| iOS·Android expo export | 각 플랫폼 Hermes 번들 생성 성공. 네이티브 앱 재컴파일을 뜻하지 않음 |
| 프로덕션 Chrome | 21개 동작 검사 통과, 콘솔 메시지·오류·경고 0 |
| 웹 화면 | 1280px 전체·375px viewport 캡처 확인, 가로 넘침 없음 |
| 웹 프로덕션 trace | react-native/nativewind/expo-brightness/gorhom 없음 |
| API/웹 동시 응답 | API 3000 Hello World!·200, 웹 dev 3001 및 검증용 production 3002 모두 200 |
| 기존 DB 연결 | 빌드된 check-connection의 SELECT current_database() → iambox. 읽기 전용, 스키마·테이블 상태는 조회하지 않음 |
| iOS 시뮬레이터 | 설치된 iPhone 18 Pro/iOS 27 개발용 앱에서 현재 Metro 번들 로딩, 홈·출입QR 버튼/배지·이용 내역 모달 열기·지점 목록 배지/가격·지도 타일 표시 확인 |

### 실행 조건 조정과 한계

- API 첫 검사는 Prisma 사용자 캐시 utime의 EPERM으로 중단됐고 캐시 접근이 허용된 실행에서 타입·빌드가 통과했다. 웹 첫 빌드도 Next telemetry 사용자 설정 쓰기 권한에서 실패했고 NEXT_TELEMETRY_DISABLED=1로 빌드했다. 소스 오류로 처리하지 않았다.
- Expo --platform all은 기존 mobile 설정의 웹까지 포함해 react-native-web 미설치로 실패했다. iOS와 Android를 각각 export해 통과했다. Next.js를 쓰는 설계에 RN Web 의존성을 추가하지 않았다.
- xcode-select는 CommandLineTools를 가리켰다. 실제 설치된 Xcode의 DEVELOPER_DIR를 명령에만 지정하고 sandbox의 CoreSimulator 제한은 허용된 실행으로 확인했다. 전역 Xcode 선택은 변경하지 않았다.
- 시뮬레이터 연결 첫 실행: Metro --localhost가 ::1에서 수신하고 manifest 번들 주소는 127.0.0.1이었다. curl IPv4 실패와 lsof ::1 수신을 확인했다. NODE_OPTIONS=--dns-result-order=ipv4first로 실행해 127.0.0.1 수신·현재 번들 로딩을 확인했다. 시스템 DNS나 앱 코드는 변경하지 않았다.
- Simulator 이름은 이 환경에서 Device Hub(com.apple.dt.Devices)였다. UI 도구의 첫 앱 읽기가 약 10분 지연됐고 이후 정상 응답했다. 일부 전환에서 UI 도구가 상태 변경을 보고해 새 상태를 읽었다. 지점 상세 왕복·모달 닫기 뒤 선택 탭 보존은 이 도구 실행 결과로 확정하지 않았다.
- 접근성 트리에 이전 launcher 연결 오류 텍스트가 남았지만 재연결 뒤 캡처에는 앱이 표시되고 현재 Metro의 iOS Bundled를 확인했다. 네이티브 전체 런타임 로그 오류 0이라고 주장하지 않는다.
- Ruling: 프로덕션 웹은 검증용 3002에 실행 — 사용자가 열어둔 기본 dev 3001을 유지하기 위해 임시 포트 사용 — 기본 start는 여전히 3001이며 안내 없이 동시에 시작하면 포트가 충돌한다.
- Ruling: 설치된 iOS 개발용 앱으로 공통 JS/UI를 확인 — 이번 단계는 네이티브 의존성 변경이 없으며 현재 Metro가 새 소스를 번들했다 — native 앱 재컴파일/Android·실기기 확인을 대체하지 않는다.

### 미검증·후속 범위

Android 기기·실기기 밝기/복원·전체 지도 상세/검색/필터·스크린리더·큰 글자·좁은 native 화면, 새 checkout의 전체 네이티브 빌드, 실제 업무 API/인증/예약/결제/QR/배포는 미검증 또는 미구현이다. DB 연결은 확인했지만 실제 스키마·테이블 상태는 이번에 조회하지 않았다. 현재 LocationData는 API DTO가 아니며 API는 공통 packages를 소비하지 않는다.

검증 전용 API·프로덕션 웹은 종료하고 사용자가 열어둔 웹 dev 3001은 유지한다. Metro도 이 단계의 화면 확인 후 종료한다. 커밋은 생성하지 않는다.

### 검증 로그

/tmp/iambox-stage6-{shared-types,shared-tests,mobile-types,mobile-tests,api-types,api-build,web-types,web-build,ios-export,android-export,browser,console,api-start,db,metro}.log. 로그는 로컬 임시 증거이며 영구 저장소의 기록·화면 캡처는 아래 목록을 따른다.


문서 정리 중 기존 BRAND_ASSETS.md 링크 대상이 현재 checkout에 없음을 확인했다. 해당 문서를 복원하거나 다른 작업의 에셋을 수정하지 않고 현재 존재하는 SVG 코드 링크로 안내를 바로잡았다. 5단계 웹 검증 제목·미검증 문구도 단계 번호를 명시해 6단계 추가 결과와 구분했다.

## 전체 변경 파일

이번 단계는 문서 13개와 검증 캡처 4개를 변경했다. 코드·의존성·lockfile은 수정하지 않았다. 아래는 이번 단계 파일만 나열한다.

| 파일 | 변경 내용 |
| --- | --- |
| [README.md](/Users/jeongsu/Documents/study/iambox_app/README.md) | 전체 검사 명령·통합 결과 안내 |
| [packages/README.md](/Users/jeongsu/Documents/study/iambox_app/packages/README.md) | 공유 경계·변경 시 검사 기준 |
| [web/README.md](/Users/jeongsu/Documents/study/iambox_app/web/README.md) | 5단계/6단계 결과 구분·프로덕션 실행 확인 |
| [mobile/README.md](/Users/jeongsu/Documents/study/iambox_app/mobile/README.md) | iOS 확인 범위·Metro IPv4 실행 방법·미검증 항목 |
| [api/README.md](/Users/jeongsu/Documents/study/iambox_app/api/README.md) | 타입/빌드·DB 읽기 연결·동시 실행 기록 |
| [docs/PRD.md](/Users/jeongsu/Documents/study/iambox_app/docs/PRD.md) | 웹 기본 화면과 제품 범위 구분·기술 표 |
| [docs/ARCHITECTURE.md](/Users/jeongsu/Documents/study/iambox_app/docs/ARCHITECTURE.md) | 최종 소비 관계·통합 검증·실제 로고 링크 |
| [docs/PROJECT_STRUCTURE.md](/Users/jeongsu/Documents/study/iambox_app/docs/PROJECT_STRUCTURE.md) | 구조 확정·후속 배치·존재하지 않는 문서 참조 정리 |
| [docs/API.md](/Users/jeongsu/Documents/study/iambox_app/docs/API.md) | 웹 미연동·LocationData와 API DTO 구분 |
| [docs/ADR.md](/Users/jeongsu/Documents/study/iambox_app/docs/ADR.md) | ADR-003 구조 도입·6단계 확인 완료 |
| [docs/DESIGN_SYSTEM.md](/Users/jeongsu/Documents/study/iambox_app/docs/DESIGN_SYSTEM.md) | 앱/웹 공유 UI 확인·실제 로고 링크 |
| [docs/superpowers/specs/2026-10-02-nextjs-shared-packages-design.md](/Users/jeongsu/Documents/study/iambox_app/docs/superpowers/specs/2026-10-02-nextjs-shared-packages-design.md) | 6단계 완료와 남은 제품 작업 구분 |
| [docs/superpowers/plans/2026-10-02-monorepo-stage6.md](/Users/jeongsu/Documents/study/iambox_app/docs/superpowers/plans/2026-10-02-monorepo-stage6.md) | 이번 계획·근거·한계·전체 변경 링크 |
| [output/playwright/stage6-web-desktop.png](/Users/jeongsu/Documents/study/iambox_app/output/playwright/stage6-web-desktop.png) | 프로덕션 웹 1280px 캡처 |
| [output/playwright/stage6-web-mobile.png](/Users/jeongsu/Documents/study/iambox_app/output/playwright/stage6-web-mobile.png) | 프로덕션 웹 375px UI 캡처 |
| [output/stage6/mobile-access.png](/Users/jeongsu/Documents/study/iambox_app/output/stage6/mobile-access.png) | iOS 공통 native 버튼·배지 확인 캡처 |
| [output/stage6/mobile-locations.png](/Users/jeongsu/Documents/study/iambox_app/output/stage6/mobile-locations.png) | iOS compact 배지·가격·지도 표시 캡처 |

## 최종 독립 검토와 완료 판단

읽기 전용 독립 검토에서 공통 경계·exports·렌더러·모바일 재수출·실행 안내·검증 로그를 대조했다. Critical/Important는 없었다. 웹 README의 5단계 미검증 문구가 6단계와 혼동된다는 경미한 문서 지적은 단계 번호를 명시하는 최종 문서 정리에 반영했다. 소스 변경은 없으며 추가 기능 회귀 테스트 대상도 없다. 검토자는 무거운 검증을 재실행하지 않았다.

- Final: Ruling: 인증/예약/결제/QR/업무 API/배포 제외 — 사용자 승인 범위는 기본 웹 구조·공유 코드와 검증이다 — 제품 기능 완료로 오인하면 후속 개발이 누락되므로 문서에 미구현으로 명시했다.
- Final: Ruling: Android·실기기·전체 네이티브 조작/접근성/큰 글자와 새 checkout native 재컴파일 미확인 — 현재 iOS JS/UI와 양 플랫폼 export 증거만 있다 — 해당 환경의 문제를 배제하지 못하므로 한계를 명시한다.
- Final: Ruling: DB 실제 테이블 상태 미조회 — 읽기 연결과 기존 API 동작까지만 확인했다 — 업무 데이터 준비 여부는 별도 모델·migration 단계에서 검증해야 한다.
- Final: Ruling: 다른 기능/이미지 dirty 변경의 병합 준비 판단 제외 — 이번 구조 작업과 무관한 동시 작업을 보존한다 — 전체 checkout을 그대로 커밋/병합하면 다른 미검증 변경까지 포함되므로 커밋하지 않는다.
- Final: Ruling: 완전히 새 환경의 설치 성공 미확인 — 기존 설치 환경에서 manifest·링크·명령·번들을 대조했다 — OS/레지스트리/캐시가 다른 환경은 별도 설치 확인이 필요하다.
- 최종 파일 목록과 체크박스·문서 링크는 실행자가 검토 후 확인했다. 최종 실행 상태는 웹 dev 3001만 유지하고 이번 API3000·production3002·Metro8082 프로세스는 종료했다.

문서 링크의 실제 경로·git diff --check가 통과했고 구조 도입 1~6단계를 마쳤다. 기기별 미검증 항목과 제품 기능은 위 후속 범위로 남는다. Git 커밋/PR/병합은 수행하지 않았다.
