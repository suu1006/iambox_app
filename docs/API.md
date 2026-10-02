# API Contract

> 기준일: 2026-09-29. 소스 기준으로 구현된 엔드포인트는 `GET /` 하나다. 예정 항목은 호출 가능한 계약이 아니다.

## API 기본 규칙

| 항목 | 현재 상태 |
| --- | --- |
| 로컬 Base URL | `http://localhost:3000` (`PORT` 환경변수로 변경 가능) |
| 경로 prefix | 없음. `/api/v1` 미설정 |
| 버전 정책 | TBD. Nest 버전 관리 미설정 |
| 인증 | 구현된 Guard·로그인·토큰 방식 없음 |
| 요청 검증 | 업무 DTO·전역 ValidationPipe 없음 |
| CORS | 별도 활성화 코드 없음 |
| 모바일 연동 | 미구현. base URL 환경변수 이름도 미정 |

실제 휴대폰의 localhost는 휴대폰 자신이다. 추후 앱 연결 시 개발 컴퓨터의 접근 가능한 주소를 사용하도록 구성해야 한다. 운영 URL·HTTPS·배포 설정은 TBD다.
서버 시작에는 `DATABASE_URL`과 PostgreSQL 연결이 필요하다.

## Response 구조

현재 `GET /`는 문자열을 직접 반환한다. `{ "data": {}, "message": null }` 같은 공통 JSON 응답 래퍼는 없다.

```text
Hello World!
```

업무 REST API는 JSON 통신 예정이다. 배열 직접 반환 여부, 단건 응답, 공통 래퍼, 페이지네이션은 첫 API 구현 단계에서 결정한다.

## Error 구조

커스텀 예외 필터와 공통 에러 계약은 없다. 기본 NestJS 예외 처리에 따른다. 기본 HTTP 예외는 `statusCode`, `message` 등을 포함할 수 있으며 예외 종류에 따라 `error`가 추가될 수 있다.

아래는 기본 404 형태를 설명하기 위한 **예시**이며 이번 작업에서 실행 확인한 응답은 아니다.

```json
{
  "statusCode": 404,
  "message": "Cannot GET /locations",
  "error": "Not Found"
}
```

업무 오류 코드, 필드 검증 오류 형식, 인증 만료 처리, 결제 오류 매핑은 TBD다. 시작 시 환경변수 누락·DB 연결 실패는 정상적으로 제공되는 업무 API 오류 계약이 아니다.

## 구현된 Endpoint

### 기본 서버 — GET /

| 항목 | 계약 |
| --- | --- |
| Method / Path | `GET /` |
| 설명 | 서버의 기본 인사 문자열 반환 |
| Path / Query Params | 정의된 매개변수 없음 |
| Request Body | 없음 |
| Auth | 불필요 |
| 성공 상태 | 200 (Nest GET 기본 상태) |
| Response | 문자열 `Hello World!` |
| DB 조회 | 없음. 단, 서버 시작 과정에는 DB 연결이 포함됨 |
| 코드 | `api/src/app.controller.ts`, `api/src/app.service.ts` |

```bash
curl -i http://localhost:3000/
```

이 엔드포인트를 DB readiness 검사나 사용자용 홈 데이터 API로 간주하지 않는다.

## 도메인별 예정 API

아래는 PRD에서 필요한 책임을 정리한 목록이다. **모든 항목 미구현**이며 Method·Path·요청·응답·인증을 확정하지 않았다. 예시 경로를 실제 계약처럼 추가하지 않는다.

| 도메인 | 필요한 동작 | Method / Path | Params / Body | Response | 인증 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| Auth | 회원가입 / 로그인 | TBD | TBD | TBD | TBD (가입·로그인 방식 포함) |
| Locations | 지점 목록·위치 / 상세 | TBD | TBD | TBD | 공개 조회 여부 TBD |
| StorageSpaces | 지점의 보관 공간 조회·선택 | TBD | TBD | TBD | TBD |
| Users | 본인 사용자 정보 확인 | TBD | TBD | TBD | 필요 예정, 방식 TBD |
| Reservations | 이용 관계·기간 관리, 별도 예약 API 채택 여부 TBD | TBD | TBD | TBD | TBD |
| Payments | 기본 결제·결과 처리 | TBD | TBD | TBD | 호출 주체·검증 방식 TBD |
| QR | 출입 QR 발급·검증 | TBD | TBD | TBD | 사용자·출입 장치 인증 방식 TBD |

결제 검증·콜백과 QR 인증은 외부 제공자 및 장치 계약을 확인한 후 정의한다. 챗봇은 MVP 포함 여부부터 TBD이므로 엔드포인트를 정하지 않는다.

## 계약 갱신 원칙

엔드포인트 구현 시 아래 항목을 같은 변경에서 갱신한다.

- 정확한 Method·Path와 목적, 구현 상태
- Path / Query Params, 요청 본문의 필드·타입·필수 여부
- 성공 상태와 실제 응답 예시, 주요 오류와 상태 코드
- 인증 필요 여부와 호출 주체
- 목록 조회라면 실제 필요한 필터·정렬·페이지네이션

Controller·DTO·Service가 문서와 다르면 실제 코드를 확인해 차이를 해결한다. 미구현 계약을 기반으로 모바일 호출을 먼저 작성하지 않는다.

## 웹·공통 패키지 경계 (2026-10-02)

Next.js 기본 웹은 공통 코드 확인용이며 현재 API를 호출하지 않는다. `packages/contracts`의 LocationData는 화면 표시용 데이터이고 위 예정 API의 응답 DTO가 아니다. API 자체도 공통 패키지 의존성을 선언하지 않는다. 실제 연동 시 요청/응답 계약과 CORS·클라이언트 base URL·인증을 함께 정한다.

6단계에서 기존 API 타입·빌드·읽기 전용 DB 연결과 GET / 200·Hello World!를 확인했다. 새로운 엔드포인트나 업무 계약은 추가하지 않았다. [통합 검증 기록](superpowers/plans/2026-10-02-monorepo-stage6.md)을 따른다.
