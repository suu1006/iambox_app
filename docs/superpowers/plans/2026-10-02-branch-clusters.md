# 아이엠박스 지도 클러스터링 실행 기록

사용자가 승인한 계획: Naver Map 2.9.0 + Supercluster 9.1.0 + 기존 PNG 캐시. LocationPoint/priceFromKrw 유지, district/thumbnailUrl 추가. radius 96 / extent 256 / maxZoom 21, bbox 5% 버퍼. idle에서만 조회, 데이터 배열 변경에서만 인덱스 재생성. point_count와 구성 지점의 공통 district만 표시. cluster 클릭 450ms 확대, 결과 변경 150ms fade. 같은 좌표 최대 확대 시 시트 목록. 지점 선택은 카메라 이동·중간 시트 요약이며 별도 상세 버튼으로 기존 상세 이동. 말풍선 120~280pt/이름 최대 두 줄, 단일 PNG 생성·128개 캐시·오류 fallback·세션 정리.


후속 사용자 요청으로 중간 요약 시트를 제거했다. 현재는 지점 마커·목록을 선택하면 바로 기존 상세로 이동하며 시트 높이와 클러스터 구성 목록을 보존한다. 아래 초기 검증의 요약 화면 기록은 변경 전 동작이다.

## 실행 순서

- [x] 1. 실제 Supercluster 기반 계산·bbox·혼합 결과·개수·district·확장 테스트와 hook 구현.
- [x] 2. ClusterMarker·지도 연결·페이드·가변 폭 PNG·캐시 실패/세션 정리 구현 및 회귀 테스트.
- [x] 3. selectedBranchId·최대 확대 그룹·필터 제외·상세 이동과 회귀 테스트. (후속 요청으로 중간 요약 제거)
- [x] 4. 350/1000개 검사·문서 갱신·타입/전체 테스트/export·가능한 iOS 확인·최종 리뷰.

## 작업 기준과 검증

- 현 checkout의 기존 사용자 변경과 앞선 수정이 구현 기반이므로 해당 checkout에서 작업한다. 자동 커밋·푸시를 수행하지 않는다.
- 실제 API/DB 지점 연결은 범위 밖이며 mock 데이터와 향후 입력 어댑터 경계를 유지한다.
- 관련 문서: PRD, Architecture, Design System, Project Structure, mobile README.
- 실패 테스트를 먼저 실행하고 구현 후 전체 모바일 suite를 확인한다. 네이티브 실행과 JS 검사를 구분한다.
- 리뷰 초점: 초기 bbox/layout 경합, 오래된 cluster 클릭, 동시 PNG 생성 금지, 128개 pinned 캐시 포화 반복 생성, 필터 제외 선택 상태, 같은 좌표 최대 확대, 긴 이름/가격 측정, 카메라 이동 중 재계산 금지.

## 진행

- 시작: 현재 앱은 3개 mock, PNG/기본 핀과 격자 48개 제한. Supercluster 의존성만 추가돼 있다.

- 데이터 단계: missing module 실패 후 실제 클러스터 테스트 6개 통과, 모바일 전체 60개·타입 통과. 투영 좌표의 부동소수 오차를 반영해 테스트 경계에 여유를 뒀다.
- 마커/선택 단계: 캐시·측정·hook·지도·선택 실패 테스트를 실행한 뒤 구현했다. 초기 모서리 변환은 순차, 인덱스는 배열 변경 때만 생성하며 150ms 진입 fade로 기존 Point의 alpha/key를 유지한다. 캐시 포화는 실패 키 처리로 루프를 막는다.

### 2026-10-02: 좌표 클러스터링과 선택 요약 검증 (후속 변경 전)

- Naver SDK 2.9.0 + Supercluster 9.1.0 적용. 격자/48개 제한을 실제 bbox/zoom Cluster·Point 조회로 대체하고 기존 PNG·가상 목록·Native Stack을 재사용했다. 지점 API는 추가하지 않았다.
- `pnpm typecheck:mobile`, `pnpm typecheck:shared`, 모바일 전체 Node 테스트 73개, 실제 iOS C++ 캐시 검사 1개, iOS/Android JavaScript export, `git diff --check`: 통과.
- 자동 검사는 거리와 district의 분리, Cluster/Point 혼합, point_count·확장 zoom·bbox, 인덱스 재사용, 필터 제외 선택 해제, 350개 동일 좌표/1,000개 분산, 개발 전용 플래그, 가변 폭·두 줄·가격 없음, 캐시 재사용·128개 포화·생성 실패·취소·이전 세션 정리, 초기/resize 좌표 요청 직렬화를 포함한다. Node의 React/네이티브 경계는 대체되며 실기기 성능 검사가 아니다.
- Xcode 27.0 / iPhone 18 Pro / iOS 27.0 개발용 앱을 SDK 패치와 함께 재빌드·설치했다(오류 0, 기존 Expo Dev Launcher 스크립트 경고 1개). 기본 마커의 폭·선택 색상·목록 선택 카메라/중간 요약을 확인했다. 가상 분산 350개에서 개수 클러스터 클릭 → 가격 마커 분리, 긴 이름 두 줄과 선택 요약, 상세보기 진입 → 지도·선택·중간 시트·축척 유지 복귀를 확인했다. 동일 좌표 350개에서 최대 확대 → 다시 클릭 → 구성 목록 350곳을 확인했다.
- 최종 리뷰의 긴 cluster 줄 겹침, 긴 이름 ellipsis 측정, 초기 projection 겹침, SDK 이미지 완료 alpha 덮어쓰기/오래된 요청 문제를 보정했다. 후속 회귀 검사는 통과했다. SDK 패치는 재설치 후에도 적용되며 기존 앱을 네이티브 재빌드해야 한다.
- **미검증:** Android 네이티브 컴파일·기기 실행(로컬 Android SDK 없음), 실기기 FPS/메모리·장시간 반복 이동, VoiceOver/TalkBack 전체 제스처. iOS 시뮬레이터와 JS export 결과로 이를 완료한 것으로 간주하지 않는다. 실제 운영 300개 지점은 API를 연결하지 않아 아직 표시하지 않는다.

### 2026-10-02: 지점 선택 즉시 상세 이동

- 후속 사용자 요청으로 중간 요약 시트와 `BranchSelection`을 제거했다. 가격 마커·목록 행은 선택 ID를 갱신하고 즉시 기존 Native Stack 상세로 이동한다. 시트 높이를 변경하지 않으며 상세 복귀 시 검색·필터·선택과 클러스터 구성 목록을 보존한다.
- 모바일 Node 테스트 73개, `pnpm typecheck:mobile`, `git diff --check` 통과. 직접 이동·필터 제외·상세 복귀·구성 목록 유지 회귀 검사를 포함한다.
- iPhone 18 Pro / iOS 27.0 시뮬레이터에서 최신 JS로 가격 마커와 목록 각각 한 번 선택 → 상세 진입, 뒤로가기 → 선택 색상과 접힌 목록 유지 확인. 이번 변경은 JS 흐름 수정이며 네이티브 재빌드는 다시 수행하지 않았다.
- Android 네이티브 실행과 실기기 성능은 이번 수정에서도 미검증이다.

## 변경 파일 검토 링크

이번 클러스터링 구현 및 준비 의존성을 포함한다. checkout의 별도 홈·택배·공통 스타일 수정은 포함하지 않는다.

- [mobile/features/locations/NaverLocationMap.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/NaverLocationMap.tsx) — idle 범위·클러스터 클릭·선택 카메라와 초기 요청 직렬화.
- [mobile/features/locations/LocationMap.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationMap.tsx) — 최대 확대 구성 목록 콜백 전달.
- [mobile/features/locations/useBranchClusters.ts](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/useBranchClusters.ts) — memo 인덱스·조회·안정된 ID와 150ms 진입 전환.
- [mobile/utils/branchClusters.ts](/Users/jeongsu/Documents/study/iambox_app/mobile/utils/branchClusters.ts) — GeoJSON·bbox·point_count·공통 district·확장 zoom.
- [mobile/features/locations/ClusterMarker.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/ClusterMarker.tsx) — 개수 이미지와 기본 핀 fallback.
- [mobile/features/locations/LocationMarker.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationMarker.tsx) — 캐시 실제 크기·alpha·선택·가격 캡션.
- [mobile/features/locations/LocationsContent.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationsContent.tsx) — selectedBranchId·전체/구성 목록·선택 즉시 상세 이동.
- [mobile/features/locations/LocationList.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/LocationList.tsx) — 행 접근성 문구에 상세 이동 동작 명시.
- [mobile/features/locations/MarkerArtwork.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/MarkerArtwork.tsx) — 가변 폭/두 줄 가격·클러스터 SVG.
- [mobile/features/locations/MarkerImageRenderer.tsx](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/MarkerImageRenderer.tsx) — 전체 줄 실측·기본 배율 export·단일 취소/시간 초과.
- [mobile/features/locations/useMarkerImages.ts](/Users/jeongsu/Documents/study/iambox_app/mobile/features/locations/useMarkerImages.ts) — 가격/클러스터 순차 생성·128개 캐시·파일 정리·실패/포화.
- [mobile/utils/markerArtworkLayout.ts](/Users/jeongsu/Documents/study/iambox_app/mobile/utils/markerArtworkLayout.ts) — 실측 폭·두 줄·ellipsis·가격 글자 크기.
- [mobile/utils/markerImageCache.ts](/Users/jeongsu/Documents/study/iambox_app/mobile/utils/markerImageCache.ts) — 종류/디자인/표시 내용 키와 URI·크기 캐시.
- [packages/contracts/src/location.ts](/Users/jeongsu/Documents/study/iambox_app/packages/contracts/src/location.ts) — 선택 district·thumbnailUrl 필드.
- [mobile/mocks/locations.ts](/Users/jeongsu/Documents/study/iambox_app/mobile/mocks/locations.ts) — 기본 district와 개발 검증 데이터 선택.
- [mobile/mocks/locationMarkerStress.ts](/Users/jeongsu/Documents/study/iambox_app/mobile/mocks/locationMarkerStress.ts) — 재현 가능한 분산/동일 좌표 350개.
- [mobile/package.json](/Users/jeongsu/Documents/study/iambox_app/mobile/package.json) — 준비 단계의 Supercluster 9.1.0 의존성.
- [pnpm-lock.yaml](/Users/jeongsu/Documents/study/iambox_app/pnpm-lock.yaml) — Supercluster 고정·갱신된 SDK patch hash.
- [patches/@mj-studio__react-native-naver-map@2.9.0.patch](/Users/jeongsu/Documents/study/iambox_app/patches/@mj-studio__react-native-naver-map@2.9.0.patch) — 기존 캐시 패치에 alpha 보존·iOS 요청 경합 보정.
- [mobile/tests/branchClusters.test.cjs](/Users/jeongsu/Documents/study/iambox_app/mobile/tests/branchClusters.test.cjs) — 실제 거리·개수·확장·bbox·350/1,000개.
- [mobile/tests/clusterHooks.test.cjs](/Users/jeongsu/Documents/study/iambox_app/mobile/tests/clusterHooks.test.cjs) — 인덱스 재사용·진입 전환.
- [mobile/tests/locationMarkers.test.cjs](/Users/jeongsu/Documents/study/iambox_app/mobile/tests/locationMarkers.test.cjs) — 초기/resize SDK 경계·혼합 표시·카메라·다시 선택.
- [mobile/tests/locationNavigation.test.cjs](/Users/jeongsu/Documents/study/iambox_app/mobile/tests/locationNavigation.test.cjs) — 마커/목록 즉시 상세 이동·선택 복귀·필터·구성 목록 보존.
- [mobile/tests/locationStress.test.cjs](/Users/jeongsu/Documents/study/iambox_app/mobile/tests/locationStress.test.cjs) — 350개 fixture와 릴리스 플래그 제외.
- [mobile/tests/markerImages.test.cjs](/Users/jeongsu/Documents/study/iambox_app/mobile/tests/markerImages.test.cjs) — 순차 생성·캐시 재사용·포화·실패·정리.
- [mobile/tests/markerLayout.test.cjs](/Users/jeongsu/Documents/study/iambox_app/mobile/tests/markerLayout.test.cjs) — 가변 폭·두 줄·말줄임과 cluster 높이.
- [mobile/tests/markerRenderer.test.cjs](/Users/jeongsu/Documents/study/iambox_app/mobile/tests/markerRenderer.test.cjs) — 측정/export/취소.
- [mobile/tests/helpers/mountComponent.cjs](/Users/jeongsu/Documents/study/iambox_app/mobile/tests/helpers/mountComponent.cjs) — Node 테스트용 hooks/네이티브 경계 도구.
- [docs/ARCHITECTURE.md](/Users/jeongsu/Documents/study/iambox_app/docs/ARCHITECTURE.md) — 좌표 기반 승인 설계·데이터 책임·검증 기록.
- [docs/PRD.md](/Users/jeongsu/Documents/study/iambox_app/docs/PRD.md) — 클러스터·선택 즉시 상세 이동의 현재 요구사항.
- [docs/DESIGN_SYSTEM.md](/Users/jeongsu/Documents/study/iambox_app/docs/DESIGN_SYSTEM.md) — 가변 폭·클러스터·즉시 상세 이동 규칙.
- [docs/PROJECT_STRUCTURE.md](/Users/jeongsu/Documents/study/iambox_app/docs/PROJECT_STRUCTURE.md) — hook·순수 유틸·선택·테스트 책임.
- [mobile/README.md](/Users/jeongsu/Documents/study/iambox_app/mobile/README.md) — 실행·350개 검증·실제 확인/미확인 구분.

기존 `mobile/utils/selectMapMarkers.ts`의 격자 선택은 제거했다. 이번 작업에서는 `pnpm-workspace.yaml`의 기존 patchedDependencies 연결과 네이티브 캐시 C++ 검사 파일을 재사용했다. 자동 커밋·푸시는 수행하지 않았다.
