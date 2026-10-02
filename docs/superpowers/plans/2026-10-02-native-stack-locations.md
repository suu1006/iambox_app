# 지점찾기 Native Stack 전환 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 지점 지도 → 상세를 Native Stack으로 연결하고 iOS 가장자리 스와이프 뒤로가기를 지원한다.

**Architecture:** 기존 하단 탭과 SafeArea 배치를 유지한다. App의 NavigationContainer 아래 지점찾기 영역에 LocationsStack을 배치한다. 지도 상태는 기존 LocationsContent가 유지하고 상세 경로에는 직렬화 가능한 locationId만 전달한다. Stack 기본 헤더는 숨겨 기존 상세 디자인을 사용한다.

**Tech Stack:** React Navigation native/native-stack, Expo 57 호환 react-native-screens ~4.26.0, 기존 safe-area-context.

**Spec:** 이 대화에서 사용자가 선택한 Native Stack 적용. 지도 복귀 상태·하단 탭·기존 뒤로가기 동작 유지.

## Global Constraints

- 기존 작업 중인 변경은 보존하고 현재 체크아웃에서 요청 범위만 수정한다. 커밋·배포는 하지 않는다.
- 스와이프는 상세에서 iOS 기본 가장자리 제스처를 사용한다.
- Android 상세 뒤로가기는 Stack에 위임하고 지도에서만 시트 접기 → 이전 탭 복귀 순서를 처리한다.
- 현재 화면 이름·로고·아이콘을 유지하고 화면 데이터 전체를 route params에 담지 않는다.

## Review Focus

- 상세 뒤에도 지도 BackHandler가 동작해 이전 탭으로 이동하는 문제: 포커스 시에만 등록한다.
- 필터 모달 Android 뒤로가기: 모달을 먼저 닫는다.
- 지도 복귀 상태: 지도 컴포넌트를 재생성하지 않고 검색·사이즈·선택 ID·시트 상태를 유지한다.
- 잘못된 locationId: 예외 없이 안내와 뒤로가기 버튼을 표시한다.
- 네이티브 화면 의존성: SDK 호환 버전·iOS 재빌드·Android 복원 설정을 확인한다.

## Task 1: 지도·상세 라우팅 전환

**Files:** mobile/App.tsx, mobile/navigation/LocationsStack.tsx, mobile/features/locations/LocationsContent.tsx, mobile/package.json, pnpm-lock.yaml, mobile/tests/locationNavigation.test.cjs

**Interfaces:** LocationsContent는 onBack, onSelectLocation, isFocused를 받는다. LocationsStack은 onBack을 받으며 LocationsMap/LocationDetail(locationId) 경로를 제공한다.

- [x] 테스트 먼저 작성: 지점 선택 콜백, 포커스 없는 지도 뒤로가기 제외, 시트/모달/탭 뒤로가기 순서, 검색·필터 상태 유지.
- [x] 새 테스트가 실패하는 이유를 확인한다.
- [x] 의존성을 추가하고 NavigationContainer·LocationsStack·포커스 기반 지도 BackHandler를 연결한다.
- [x] 상세 route adapter의 지점 조회·goBack·잘못된 ID 처리를 검증한다.
- [x] 모바일 타입 검사·전체 테스트와 iOS/Android JS 번들 생성을 실행한다.

## Task 2: 네이티브 검증과 문서

**Files:** docs/PRD.md, docs/ARCHITECTURE.md, docs/PROJECT_STRUCTURE.md, docs/DESIGN_SYSTEM.md, mobile/README.md (필요한 네이티브 설정은 Expo config에 기록)

- [x] iOS 네이티브 빌드와 시뮬레이터 실행을 시도하고 가능한 범위에서 진입·뒤로가기·스와이프 취소/완료·하단 탭·지도 상태를 확인한다.
- [x] 실제로 확인한 결과와 미확인 범위를 문서에 구분한다.
- [x] 최종 리뷰와 diff 검사를 수행하고 변경 파일 링크를 전달한다.

## 실행 기록

- 동일 체크아웃에서 기존/동시 변경을 보존해 구현했다. Native Stack 경로는 지점찾기 영역에 한정했다.
- 새 테스트 7개가 전환 전 실패함을 확인하고 구현 후 전체 모바일 테스트 40개와 타입 검사를 통과했다.
- iOS/Android JS 번들·iOS 네이티브 빌드·Android prebuild를 통과했다. Android는 기존 Expo 생성 설정(`super.onCreate(null)`, predictive back 비활성)을 확인했다.
- iOS 시뮬레이터에서 목록/상세/버튼 복귀·시트와 강조 유지·하단 탭을 확인했다. 자동화 입력으로 가장자리 스와이프 완료/취소는 재현하지 못해 미검증으로 남겼다. 실제 아이폰·Android 기기·카메라 이동 후 복귀·스크린리더도 미검증이다.
- 읽기 전용 최종 리뷰에서 중요한 결함은 발견되지 않았다. 커밋·배포는 수행하지 않았다.
