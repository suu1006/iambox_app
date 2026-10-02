# 아이엠박스 웹 기본 구조

Next.js App Router 기본 실행 구조다. 사용자 요청으로 제목·색상·배지·버튼·검색·가격 예시를 모두 제거해 현재 홈 화면은 비어 있다.

## 실행

루트에서 실행한다. API·PostgreSQL·환경변수 없이 동작한다.

```bash
pnpm install --frozen-lockfile
pnpm dev:web
```

[로컬 웹](http://127.0.0.1:3001)을 연다.

```bash
pnpm typecheck:web
pnpm build:web
pnpm --filter @iambox/web start
```

start는 build 이후 실행하며 dev와 같은 3001 포트이므로 동시에 실행하지 않는다.

## 유지한 구조

- src/app/page.tsx: null을 반환하는 빈 홈 페이지.
- src/app/layout.tsx: 한국어 문서·메타데이터·공통 색상 CSS 변수와 UI CSS 연결.
- src/app/globals.css: 기본 배경·글꼴·margin만 지정.
- next.config.mjs: 공통 네 패키지 transpilePackages와 모노레포 Turbopack root.
- package.json/tsconfig.json: 공유 패키지 의존성·타입 검사·실행·빌드 설정.

예시 전용 SharedExamples.tsx와 exampleLocations.ts는 삭제했다. 모바일과 packages의 공유 구현은 유지한다. 실제 웹 UI는 후속 작업에서 추가한다.

Next.js 16.3.8, React/React DOM 19.2.3을 사용한다. next-env.d.ts·.next·tsbuildinfo는 생성 파일이며 Git 제외다. typecheck는 next typegen을 먼저 실행한다.

## 이전 검증 기록

[5단계](../docs/superpowers/plans/2026-10-02-nextjs-web-stage5.md)와 [6단계](../docs/superpowers/plans/2026-10-02-monorepo-stage6.md)의 버튼·검색·배지 검사는 삭제 전 예시 화면에 대한 기록이다. 현재 페이지의 기능을 뜻하지 않는다.

예시 제거 후 `pnpm typecheck:web`, `pnpm build:web`가 통과했다. 실제 로컬 브라우저에서 페이지 텍스트·제목·입력 필드가 없는 빈 화면을 확인했다. 모바일/API 검사는 이번 화면 정리에서 다시 실행하지 않았다.
