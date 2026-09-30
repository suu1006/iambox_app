# Architecture

> 기준일: 2026-09-29. 현재 코드와 예정 구조를 구분한다. 제품 범위는 [PRD.md](PRD.md)를 따른다.

## System Overview

현재 서로 구분된 흐름:

```text
Expo → mobile/index.ts → App.tsx → 하단 탭 / 선택한 메뉴의 임시 화면
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
- `react-native-safe-area-context`로 안전 영역을 반영하고 `react-native-svg`와 SVG transformer로 `assets/nav-*.svg` 탭 아이콘을 표시한다. 선택 탭은 보라색이고 중앙 출입QR은 원형 버튼으로 강조한다. 같은 SVG를 임시 콘텐츠 아이콘에도 재사용한다. QR SVG는 모양과 전달받은 색상만 표현하며 원형 배경과 그림자는 View에서 관리한다. 공통 색상은 `mobile/theme/colors.json`에서 관리하며 Tailwind와 SVG가 함께 사용한다. 콘텐츠는 스크롤 가능하고 하단 탭은 고정된다. 각 메뉴는 임시 안내 화면이다.
- `App.tsx`는 탭 상태와 배치를 담당하고 `components/`의 AppHeader, PlaceholderContent, BottomTabBar로 UI를 분리한다. 탭 정의와 타입은 `navigation/tabs.ts`에 둔다. 화면 라우터, 별도 화면 디렉토리, hooks, 전역 상태 관리, 영속 상태 저장은 없다.
- NativeWind 4와 Tailwind CSS 3의 `className`으로 스타일을 작성한다. `global.css`는 Tailwind 진입점이며 `tailwind.config.js`에서 컴포넌트 경로와 공통 색상을 지정한다. Metro는 SVG transformer와 NativeWind를 함께 적용하며 `inlineRem: 16`으로 기존 간격을 유지한다. 네이티브 hairline과 QR 그림자만 BottomTabBar의 작은 StyleSheet에 남긴다.
- Babel은 Expo/NativeWind preset을 사용한다. pnpm에서 JSX 런타임을 찾도록 `react-native-css-interop`를 직접 선언하고 Reanimated/Worklets는 Expo 호환 버전을 사용한다. Metro peer는 React Native와 같은 0.86.3으로 고정한다.
- HTTP 클라이언트, API base URL, 인증 토큰 처리, 요청 캐시는 없다. 호출 방식은 첫 연동 단계에서 결정한다.
- 지도·QR·결제 라이브러리와 권한 설정은 미구현이다. 제공자와 연결 방식은 TBD다.
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

예정 흐름의 화면·엔드포인트·모델은 아직 없으며 경로와 데이터 형태도 TBD다.

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
