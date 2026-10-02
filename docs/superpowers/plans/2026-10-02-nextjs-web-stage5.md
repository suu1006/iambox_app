# Next.js 기본 웹 5단계 구현 계획

> **For agentic workers:** superpowers:executing-plans로 승인된 5단계만 직접 구현한다.

**Goal:** 같은 pnpm 모노레포에 Next.js App Router 웹을 추가하고 공통 코드 확인 화면을 로컬 3001에서 실행한다.

**Architecture:** layout/page는 Server Component로 메타데이터·토큰·배지 예시를 제공한다. 버튼 클릭과 지점 검색·사이즈 선택만 Client Component로 분리한다. 웹 전용 예시 데이터는 LocationData를 만족하며 utils·ui/web과 공통 JSON을 소비한다.

**Tech Stack:** Next.js 16.3.8, 기존 React/React DOM 19.2.3·TypeScript 6.0.3·Node 22.23.3·pnpm 12.6.0. React DOM 타입은 호환되는 19.2.7을 사용한다.

**Spec:** [승인된 공통 패키지 설계](../specs/2026-10-02-nextjs-shared-packages-design.md)

## 범위와 판단

- 사용자 요청에 따라 웹은 기본 구조·공통 UI 확인까지만 구현한다. 백엔드·DB 없이 동작하며 업무 API·인증·지도·결제·배포는 추가하지 않는다.
- web을 워크스페이스에 등록하고 루트 dev:web/build:web/typecheck:web 명령을 추가한다. 기본 포트는 3001, 로컬 호스트만 사용한다.
- 공통 소스 4개를 transpilePackages로 연결하고 allowImportingTsExtensions를 사용한다. Native alias나 모바일 mock/assets import는 추가하지 않는다.
- React/React DOM을 기존 19.2.3으로 맞추고 override를 유지한다. 기존 패키지 버전은 보존한다. Next의 Node >=20.9·React ^19 조건을 npm manifest에서 확인했다.
- Ruling: 승인된 단계별 설계를 구체화해 현재 checkout에서 구현한다. 이전 결과를 소비하므로 다른 미커밋 작업을 유지하고 이번 파일 기준을 /tmp에 따로 보관한다. 동시 작업의 변경은 보고에서 구분한다.
- Ruling: 외부 폰트·이미지·UI 라이브러리 대신 시스템 폰트·공통 색상·단순 CSS를 사용한다. 웹 제품 화면은 후속 작업이고 이번 화면은 공유 코드 확인용이다.

## Review Focus

- SSR 후 hydration에서 버튼·배지·가격 내용이 바뀌거나 native 모듈이 웹에 유입되지 않는다.
- primary/link 버튼을 클릭·Enter/Space로 실행하며 disabled는 결과를 바꾸지 않는다. 포커스 링은 흰 배경에서도 보인다.
- 이름·주소 검색, OR 사이즈 선택, 조건 결합·초기화·빈 결과가 공통 필터와 일치한다.
- 39000/null/0 표시를 구분하고 웹 예시를 실제 지점/확정 API 정보로 설명하지 않는다.
- 좁은 375px 화면에서 콘텐츠·버튼·검색 조건이 잘리지 않는다. 웹 typecheck는 깨끗한 .next 상태에서도 실행할 수 있다.

## 작업 순서

- [x] 작업 전 파일·lockfile 기준을 보관하고 버전 호환 조건을 확인한다.
- [x] web/package.json·tsconfig·next.config·layout/page·전역 CSS를 만들고 워크스페이스·실행 명령을 연결한다. 초기 Server 페이지는 제목·토큰·배지 예시를 제공한다.
- [x] pnpm 설치와 로컬 dev 실행을 확인한다. 신규 패키지만 해석하며 기존 lockfile 버전을 유지한다.
- [x] 실제 Chrome에서 초기 페이지 snapshot을 확인한다. 상호작용 영역이 아직 없어서 버튼 검증이 실패하는 것을 기록한다.
- [x] 웹 예시 데이터와 Client 확인 화면을 추가한다. primary/link/disabled 버튼, 클릭 결과, 검색·M/L 조건·초기화·지점 예시·가격 표시를 구현한다.
- [x] 같은 브라우저에서 클릭·키보드·비활성·검색·조건 결합·초기화·빈 결과·배지 6조합·가격·focus·375px 배치를 검증한다.
- [x] pnpm typecheck:web·build:web·공통 검사/테스트·모바일 타입 검사/테스트를 실행한다. 서버 API 검사는 최종 통합 단계에서 수행한다.
- [x] 설치한 버전·lockfile의 기존 importer 보존·React 연결·웹 네이티브 의존성 미포함을 확인한다.
- [x] 구조·사용법·설계의 현재 상태와 변경 링크를 갱신하고 읽기 전용 독립 검토 후 결과를 보고한다.

## 파일 책임

- web/package.json, tsconfig.json, next-env.d.ts, next.config.mjs: 앱·소스 변환·타입 검사 설정.
- web/src/app/layout.tsx, page.tsx, globals.css: 서버 페이지·메타데이터·토큰·배지·반응형 기본 배치.
- web/src/components/SharedExamples.tsx: 웹 상호작용 영역. 제품 업무 동작은 없다.
- web/src/data/exampleLocations.ts: 이미지 없이 공통 타입을 사용하는 웹 예시 지점.
- web/README.md: 실행·범위·공통 코드 사용·검증 기록.
- 루트 package.json·pnpm-workspace.yaml·pnpm-lock.yaml·.gitignore 및 관련 문서: 모노레포 연결과 현재 상태.

## 실행 결과

5단계 구현을 완료했다. 같은 모노레포의 web이 공통 패키지 4개를 소비한다. layout/page는 Server Component이며 버튼·검색 상태만 Client Component에 둔다. 로컬 127.0.0.1:3001 개발 서버를 실행 중이다.

### 변경 결과

- primary/link/disabled 버튼과 클릭 결과, DOM SVG 슬롯을 표시한다.
- Badge의 solid/soft/neutral × default/compact 6개 조합, 공통 색상 팔레트를 표시한다.
- 웹 전용 예시 지점에서 이름·주소 검색과 M/L OR 선택을 AND 결합한다. 초기화·빈 결과·원본 순서를 확인한다.
- 공통 가격 함수로 39000/null/0을 39,000원~/요금 문의/0원~로 표시한다.
- 기존 React/React DOM 19.2.3과 override를 유지했다. Next.js 16.3.8, 호환 DOM 타입 19.2.7만 웹에 연결한다. 설치 시 기존 패키지 선언·실제 버전은 유지됐다.
- Next dev가 web/AGENTS.md·CLAUDE.md와 next-env.d.ts를 생성했다. 가이드가 요구하는 설치 버전의 bundled 문서를 읽었으며 생성 타입 파일은 권고대로 Git에서 제외했다. typecheck는 next typegen을 먼저 실행하므로 깨끗한 .next에서도 동작한다.

### 검증 결과

| 검증 | 결과 |
| --- | --- |
| npm view next version/engine/peer·React DOM 타입 | Next 16.3.8의 Node >=20.9·React ^19 조건 충족. DOM 타입 19.2.7은 React 타입 ^19.2 지원 |
| pnpm install --ignore-scripts --prefer-offline | 통과. 기존 버전 유지하며 웹 신규 패키지 연결 |
| pnpm dev:web | 127.0.0.1:3001 준비, GET / 200 |
| 상호작용 구현 전 실제 Chrome 검증 | 공통 버튼 미구현으로 예상 실패 확인 |
| 최종 Chrome 동작 검사 | 21개 항목 통과. 아래 목록 참고 |
| 최종 Chrome 콘솔 | 오류 0·경고 0, hydration 오류 없음 |
| pnpm typecheck:web | next typegen과 tsc 통과 |
| .next를 /tmp에 보관한 뒤 pnpm typecheck:web | 빈 .next 상태에서도 타입 생성·검사 통과 |
| 최종 pnpm build:web | 통과. /와 기본 /_not-found 정적 생성 |
| pnpm typecheck:shared / typecheck:mobile | 모두 통과 |
| pnpm test:shared / 모바일 test | utils 2개·UI 12개·모바일 31개, 총 45개 통과 |
| 작업 전후 lockfile | 기존 packages 항목 삭제/변경 0, 기존 importer 선언·실제 버전 동일. 일부 peer context만 갱신 |
| React 모듈 연결·React DOM override | web/mobile의 React 동일 인스턴스, React DOM/override 모두 19.2.3 |
| 프로덕션 page.js.nft.json trace | react-native·nativewind·expo-brightness·gorhom 모듈 없음 |
| 1280px·375px 화면 | 캡처 확인. 375px scrollWidth/innerWidth 모두 375 |
| 변경 문서 파일 링크·git diff --check | 통과. 변경 문서 파일 링크 누락 없음 |

브라우저 검사 21개: Enter/Space 링크 실행, 브랜드색 focus, disabled 상태, disabled 클릭 결과 불변, Tab에서 disabled 제외, 기본 type=button, 장식 SVG 접근성 제외, 이름/공백 검색, 검색 AND 사이즈, 빈 결과 안내, L 선택, M/L OR, M 선택, 주소/사이즈 결합, 일치 없음, 초기화·원본 순서, 검색/선택 해제, 숫자/null/0, 배지 6조합 색상, 배지 크기, 375px 가로 넘침 없음. 기본 버튼 클릭과 결과 1회도 선행 확인했다.

### 검증 과정의 조정

- Playwright 래퍼 파일은 실행 비트가 없어 bash로 실행했다. 새 스냅샷 ref가 f1e48인데 이전 형식 e48로 호출한 첫 클릭은 도구에서 거부됐고, 최신 ref로 다시 실행했다. 앱 코드 변경 사항은 아니다.
- 요금 예시 div의 generic 역할에 이름을 조회하는 브라우저 검증은 지원되지 않았다. 의도한 이름을 유효한 group 역할에 연결하고 전체 21개 검사를 다시 실행해 통과했다.
- 첫 로드의 favicon.ico 404는 공통 토큰으로 만드는 SVG data URI 메타데이터 아이콘을 연결해 해결했다. 최종 콘솔은 오류·경고 0이다.
- Chrome의 좁은 fullPage 캡처에서 상단 타일이 반복됐다. 실제 DOM의 h1은 1개이며 scrollWidth도 375였다. 레이아웃이 재계산된 뒤 viewport별 상단·상호작용 영역을 따로 캡처해 실제 화면을 확인했다. 웹 코드에 반복 DOM을 추가한 것은 아니다.
- lockfile의 신규 Next 패키지는 추가되고 API·모바일의 일부 peer context 문자열이 달라졌다. 기존 package metadata와 선언·실제 버전은 동일함을 별도로 비교했다.

### 최종 검토와 판단

읽기 전용 독립 검토에서 critical/important 기능 문제는 발견되지 않았다. 결정적 초기 렌더·브라우저 전역 미사용·서버/클라이언트 분리·공통 소비·타입 생성 명령·버전 호환을 확인했다. 검토자는 빌드/clean 타입/브라우저 검증 로그를 읽었으며 전체 검증을 재실행하지 않았다. Next 생성 환경 파일의 Git 제외 권고는 기본 설정 정리에서 반영했다. 미해결 지적은 없다.

- Final: Ruling: 현재 단계에서 업무 API·배포·기기 실행은 제외 — 사용자 요청은 기본 웹의 로컬 확인까지다 — 실제 제품 통합·기기 동작은 6단계와 후속 기능 개발에서 확인해야 한다.
- Final: Ruling: 기존 모바일·동시 작업의 변경은 검토 제외 — 이번 구현은 웹과 루트 연결·설명 문서에 한정한다 — 공유 의존성에 대한 모바일 타입/테스트는 확인했지만 기기 화면을 다시 실행한 증거는 없다.
- Final: Ruling: 좁은 fullPage 캡처 타일은 DOM 반복이 아닌 캡처 문제로 처리 — DOM/폭과 별도 viewport 캡처로 실제 배치를 확인했다 — 전체 길이 이미지 대신 상단·상호작용 영역을 분리한 증거를 사용한다.

프로덕션 start의 실제 브라우저 조작은 이번 단계에서 수행하지 않았다. 모바일 기기·시뮬레이터 화면, API 타입/DB 연결·인증·지도·결제·배포는 미검증이다. 커밋은 생성하지 않았다. 이번 단계 밖의 미커밋 작업은 유지했다.


## 참고 근거

- [Next.js 설치 안내](https://nextjs.org/docs/app/getting-started/installation)
- [transpilePackages](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages)
- [Next CLI / typegen](https://nextjs.org/docs/app/api-reference/cli/next)

## 변경 파일 전체

이번 단계 파일은 26개다(설정·문서·소스 23개와 화면 캡처 3개). Next가 만든 가이드 2개도 포함한다. 생성되는 next-env.d.ts와 .next는 Git 제외이며 아래 영구 변경 목록에는 포함하지 않는다. 다른 작업의 파일은 수정하지 않았다.

| 파일 | 변경 |
| --- | --- |
| [.gitignore](/Users/jeongsu/Documents/study/iambox_app/.gitignore) | Next 캐시·생성 타입·브라우저 로그 제외 |
| [README.md](/Users/jeongsu/Documents/study/iambox_app/README.md) | 웹 현재 상태·3001 실행·문서 링크 추가 |
| [package.json](/Users/jeongsu/Documents/study/iambox_app/package.json) | dev:web·build:web·typecheck:web 추가 |
| [pnpm-workspace.yaml](/Users/jeongsu/Documents/study/iambox_app/pnpm-workspace.yaml) | web workspace 등록 |
| [pnpm-lock.yaml](/Users/jeongsu/Documents/study/iambox_app/pnpm-lock.yaml) | Next·DOM 타입·workspace와 peer context 기록, 기존 버전 유지 |
| [packages/README.md](/Users/jeongsu/Documents/study/iambox_app/packages/README.md) | 실제 웹 소비·검증 완료·사용법 안내 |
| [docs/ADR.md](/Users/jeongsu/Documents/study/iambox_app/docs/ADR.md) | ADR-003의 5단계 적용 현황 |
| [docs/ARCHITECTURE.md](/Users/jeongsu/Documents/study/iambox_app/docs/ARCHITECTURE.md) | 웹/공통 경계·8개 프로젝트·실행과 검증 상태 |
| [docs/DESIGN_SYSTEM.md](/Users/jeongsu/Documents/study/iambox_app/docs/DESIGN_SYSTEM.md) | Next 확인 화면·키보드/포커스·반응형 검증 안내 |
| [docs/PROJECT_STRUCTURE.md](/Users/jeongsu/Documents/study/iambox_app/docs/PROJECT_STRUCTURE.md) | web 소스 트리·책임·실행 명령 |
| [docs/superpowers/specs/2026-10-02-nextjs-shared-packages-design.md](/Users/jeongsu/Documents/study/iambox_app/docs/superpowers/specs/2026-10-02-nextjs-shared-packages-design.md) | 5단계 완료·6단계 예정 구분 |
| [docs/superpowers/plans/2026-10-02-nextjs-web-stage5.md](/Users/jeongsu/Documents/study/iambox_app/docs/superpowers/plans/2026-10-02-nextjs-web-stage5.md) | 이번 계획·검증·판단·전체 변경 링크 |
| [web/AGENTS.md](/Users/jeongsu/Documents/study/iambox_app/web/AGENTS.md) | Next dev가 생성한 설치 버전 문서 확인 가이드 |
| [web/CLAUDE.md](/Users/jeongsu/Documents/study/iambox_app/web/CLAUDE.md) | Next dev가 생성한 AGENTS 참조 |
| [web/README.md](/Users/jeongsu/Documents/study/iambox_app/web/README.md) | 웹 실행·구조·공유 경계·검증·미구현 범위 |
| [web/package.json](/Users/jeongsu/Documents/study/iambox_app/web/package.json) | Next/React·공통 의존성·로컬 실행/타입/빌드 명령 |
| [web/next.config.mjs](/Users/jeongsu/Documents/study/iambox_app/web/next.config.mjs) | 공통 소스 변환·모노레포 Turbopack root |
| [web/tsconfig.json](/Users/jeongsu/Documents/study/iambox_app/web/tsconfig.json) | Next 타입 검사·TS 소스·JSON import 설정 |
| [web/src/app/layout.tsx](/Users/jeongsu/Documents/study/iambox_app/web/src/app/layout.tsx) | 한국어 문서·메타데이터·공통 CSS 변수·상태 CSS·아이콘 |
| [web/src/app/page.tsx](/Users/jeongsu/Documents/study/iambox_app/web/src/app/page.tsx) | Server 영역의 공통 색상·배지와 Client 예시 배치 |
| [web/src/app/globals.css](/Users/jeongsu/Documents/study/iambox_app/web/src/app/globals.css) | 시스템 폰트·반응형 기본 배치 |
| [web/src/components/SharedExamples.tsx](/Users/jeongsu/Documents/study/iambox_app/web/src/components/SharedExamples.tsx) | 공통 버튼·클릭·검색·사이즈·초기화·가격 Client 영역 |
| [web/src/data/exampleLocations.ts](/Users/jeongsu/Documents/study/iambox_app/web/src/data/exampleLocations.ts) | LocationData 타입을 사용하는 웹 예시 지점 3개 |
| [output/playwright/iambox-web-desktop.png](/Users/jeongsu/Documents/study/iambox_app/output/playwright/iambox-web-desktop.png) | 1280px 확인 화면 캡처 |
| [output/playwright/iambox-web-mobile.png](/Users/jeongsu/Documents/study/iambox_app/output/playwright/iambox-web-mobile.png) | 375px 상단 viewport 캡처 |
| [output/playwright/iambox-web-mobile-controls.png](/Users/jeongsu/Documents/study/iambox_app/output/playwright/iambox-web-mobile-controls.png) | 375px 배지·버튼 viewport 캡처 |
