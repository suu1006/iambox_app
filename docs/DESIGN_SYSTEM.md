# Design System

> 기준일: 2026-10-02. 모바일 앱(`mobile/`)과 웹 기본 화면(`web/`)이 공유하는 색상·Button·Badge, 모바일 전용 SVG·UI 사용 기준이다. 글자 크기·모서리 둥글기 토큰은 아직 정의하지 않았다(**예정**).

## 원칙

- 메인 컬러는 `primary`(#844CCF)다. 2026-10-02에 [공식 웹사이트](https://www.iambox.co.kr/)의 활성 메뉴 글자·팝업 버튼 배경에서 확인한 색상에 맞췄다. 강조·버튼·활성 탭은 primary, 연한 배경은 primary 단계색을 사용한다.
- 화면 코드에 hex 색상(`#xxxxxx`, `bg-[#...]`)과 `text-white`·`bg-white`를 직접 쓰지 않는다. 필요한 색이 없으면 먼저 토큰을 추가한다.
- 여러 화면에서 반복되는 UI는 `components/ui`·`components/layout`의 컴포넌트를 사용하고, 한 기능에서만 쓰는 UI는 `features/<feature>/`에 둔다.

## 색상 토큰

단일 출처는 `packages/design-tokens/src/colors.json`이다. 2026-10-02의 공통 패키지 3단계에서 기존 색상 값을 그대로 이동했다. 모바일 `tailwind.config.js`와 TS 코드가 `@iambox/design-tokens/colors.json`을 읽어 Tailwind 클래스·SVG `color`·네이티브 SDK 색상에 함께 사용한다.

| 토큰 | 값 | Tailwind 예 | 용도 |
| --- | --- | --- | --- |
| `primary` | #844CCF | `bg-primary`, `text-primary` | 메인 버튼, 강조 문구, 활성 탭 |
| `primary-50` | #F6F2FD | `bg-primary-50` | 연보라 카드·아이콘 배경, 안내 본문 박스 |
| `primary-100` | #F0E9FA | `bg-primary-100` | 이벤트 배너 배경 |
| `primary-200` | #E5D5F7 | `bg-primary-200`, `border-primary-200` | 연한 배지 배경, 연보라 카드 안 구분선 |
| `primary-300` | #BB91E8 | `text-primary-300` | 마이페이지 프로필 아바타 |
| `onPrimary` | #FFFFFF | `text-onPrimary` | primary 배경 위 글자·아이콘 |
| `onPrimaryMuted` | #EEE0FF | `text-onPrimaryMuted` | primary 배경 위 보조 문구 |
| `heading` | #101828 | `text-heading` | 제목·본문 |
| `muted` | #667085 | `text-muted` | 보조 문구·보조 아이콘 |
| `inactive` | #818598 | `text-inactive` | 비활성 탭, 보조 chevron |
| `subtle` | #9297A5 | `text-subtle` | 약관 링크 사이의 장식 구분자. 작은 본문·활성 링크에는 `muted` 사용 |
| `surface` | #FFFFFF | `bg-surface` | 기본 화면·카드·모달 배경 |
| `canvas` | #F8FAFC | `bg-canvas` | 회색 보조 배경(문의 박스, 임시·준비 화면) |
| `divider` | #E8E9EF | `border-divider`, `bg-divider` | 구분선, 회색 배지 배경 |
| `rating` | #FFB02E | `text-rating` | 별점 |

TS에서 사용할 때:

```tsx
import colors from '@iambox/design-tokens/colors.json';

<ChevronRight color={colors.muted} />
<ArrowRight color={colors.primary.DEFAULT} /> // primary는 단계색을 가진 객체라 DEFAULT로 기본값을 읽는다.
```

모달 배경의 반투명 검정(`bg-black/40`)은 `DialogBackdrop` 한 곳에서만 사용한다. `assets/home-delivery.svg`, `home-care.svg`, `01_storage_boxes.svg` 등 일러스트 SVG와 사용자 제공 PNG는 시안 색을 고정으로 담고 있어 토큰 대상이 아니다. 홈 바로가기 4개(`home-startup`, `home-location`, `home-onsite`, `home-notice`)는 `stroke="currentColor"`에 `primary` 토큰을 전달한다. `color` prop을 받는 아이콘 SVG(`currentColor`)만 토큰 색을 전달한다.

## SVG 아이콘

홈 물품 보관 카드의 일러스트는 사용자가 제공한 `mobile/assets/home-storage.png`(1536×1024)를 React Native `Image`로 표시한다. 기존 `home-storage.svg`를 대체하며 장식 영역의 높이 126px과 전체 너비를 유지하고 `resizeMode="contain"`으로 원본 비율을 보존한다. 사전방문 카드의 일러스트는 사용자 제공 `mobile/assets/home-pre-visit.png`를 같은 방식으로 표시하며 기존 장식 영역(높이 62px, 최대 너비 114px)을 유지한다.

홈 이벤트 배너 3개는 사용자가 제공한 2022×778 SVG(`event_banner1~3.svg`)를 1200×462 PNG로 변환한 `home-event-busan-discount.png`, `home-event-storage-bundle.png`, `home-event-review-coupon.png`(197~264KB)를 `Image`로 표시한다. 원본 SVG는 래스터를 경로 515~525개로 추적한 개당 5.2~7.8MB 파일이라 transformer로 import하면 경로 데이터가 그대로 JS 번들에 들어가므로 PNG로 분리했다. 배너 문구는 이미지에 포함되어 있어 토큰·폰트 대상이 아니며 접근성 라벨로 같은 문구를 제공한다.

아이콘·일러스트 SVG를 추가하거나 교체할 때 매번 따르는 기준이다.

- **위치**: 앱에서 쓰는 SVG는 `mobile/assets/`에 둔다. 한 화면 전용 아이콘이 여러 개면 `assets/<영역>/` 폴더(예: `assets/my/`)로 묶는다.
- **파일명**: 용도가 드러나는 영문 소문자 kebab-case로 짓는다. `assets/` 바로 아래는 `<영역>-<의미>.svg`(`home-notice.svg`, `nav-home.svg`), 영역 폴더 안은 `<의미>.svg`(`my/notice.svg`)를 쓴다. 여러 화면이 함께 쓰는 아이콘은 모양 이름(`chevron-right.svg`, `arrow-right.svg`)을 쓴다. 전달받은 원본 파일명(`business_trip.svg` 등)이나 번호·버전 표기를 그대로 쓰지 않는다. 기존 `01_storage_boxes.svg` 등은 이 기준 이전 파일이다.
- **사용 방식**: 화면 파일 상단에서 `react-native-svg-transformer`로 정적 import해 컴포넌트로 쓴다. SVG 마크업을 TSX에 붙여 넣거나 원격 URL·`SvgUri`·`SvgXml`로 런타임에 불러오지 않는다. 크기는 `width`·`height`, 색은 `color`로 전달한다.
- **빠른 렌더링**:
  - `path`·`circle`·`rect`·그라데이션 등 벡터 요소만 사용한다. transformer가 SVG를 JS 컴포넌트로 바꾸므로 base64 PNG를 담은 `<image>`는 그 데이터가 그대로 JS 번들에 들어간다. 2026-10-01에 받은 PNG 내장 SVG는 개당 190~256KB였다.
  - `filter`(`feDropShadow` 등)는 SVGR native 변환에서 제거되므로 쓰지 않는다. 그림자와 원형 배경은 View 스타일로 처리한다.
  - 에디터 메타데이터, 주석, 쓰지 않는 `defs`는 지운다.
  - 제공받은 SVG에 래스터가 들어 있으면 사용자에게 알리고 벡터 원본을 받거나, 사진처럼 벡터로 만들기 어려운 그림은 PNG로 분리해 `Image`로 표시한다. 출입QR 보관함 그림은 사용자 요청에 따라 예외적으로 제공 원본 `imbox_storage_A-024.svg`(PNG 내장, 약 3.5MB)를 정적 import한다. 기존 장식 영역에서 `width="100%"`, `height="100%"`, `preserveAspectRatio="xMidYMid meet"`로 비율을 유지하며 내장 이미지 데이터는 JS 번들에 포함된다.
- **색상**: 브랜드 로고는 원본의 고정 색상을 유지하며 `primary`로 재색상하지 않는다([브랜드 로고 SVG](../mobile/assets/iambox-logo.svg)). 단색 아이콘은 `currentColor`로 작성하고 위 색상 토큰을 `color`로 전달한다. 시안 색을 고정으로 담은 일러스트는 토큰 대상이 아니다.
- **기록**: 아이콘 묶음을 추가·교체하면 이 문서의 해당 화면 설명에 파일명과 용도를 적는다.

```tsx
import HomeNotice from '../../assets/home-notice.svg';
import colors from '@iambox/design-tokens/colors.json';

<HomeNotice width={32} height={32} color={colors.primary.DEFAULT} accessible={false} />
```

## 플랫폼별 UI 규칙

Button·Badge 규칙은 `packages/ui/src/shared/button.ts`, `badge.ts`에 있다. 완전한 NativeWind 클래스와 웹이 사용하는 색상·수치를 같은 variant/tone/size 정의에 두며 디자인 변경 시 두 표현을 함께 갱신한다. 모바일 Tailwind는 shared/native 경로를 탐색한다.

웹은 `@iambox/ui/web`을 사용하고 전역 진입점에서 `@iambox/ui/web.css`를 읽는다. Button은 HTML button(기본 type=button), Badge는 span이며 네이티브 이벤트·SVG를 받지 않는다. 웹 아이콘에는 DOM SVG 컴포넌트를 전달한다. 버튼의 accessibilityLabel은 aria-label로 연결하며 장식 아이콘은 aria-hidden으로 탐색에서 제외한다. pressed는 공통 opacity, focus-visible은 브랜드색을 웹 CSS 변수로 연결해 표시한다. 5단계에서 Next.js에 연결하고 클릭·키보드·disabled·focus와 375px 배치를 Chrome에서 확인했다. [웹 안내](../web/README.md)와 [5단계 기록](superpowers/plans/2026-10-02-nextjs-web-stage5.md)을 참고한다.

## 공통 컴포넌트

4단계에서 Button·Badge 공통 props·규칙과 native/web 렌더러를 `packages/ui/src`에 연결했다. 아래 모바일 경로는 native 진입점을 재수출하므로 기존 화면 import는 유지한다. 나머지 컴포넌트는 모바일 전용이다. 색상 원본은 공통 design-tokens에 있다.

```text
mobile/components/
├── ui/        # 화면과 무관한 기본 UI — import { Button } from '../../components/ui'
└── layout/    # 화면 뼈대 — import { ScreenContainer } from '../../components/layout'
```

| 컴포넌트 | 위치 | 역할 / 주요 props |
| --- | --- | --- |
| `Button` | `ui/Button.tsx` → `@iambox/ui/native` | `variant="primary"`(높이 48·rounded-xl·primary 배경) 또는 `"link"`(primary 글자). `label`, `LeadingIcon`, `TrailingIcon`, `className`과 `Pressable` props |
| `Badge` | `ui/Badge.tsx` → `@iambox/ui/native` | 상태 라벨. `tone="solid"`(primary), `"soft"`(primary-200), `"neutral"`(divider). 기본은 둥근 알약 형태, `size="compact"`는 작은 둥근 사각형 |
| `Decorative` | `ui/Decorative.tsx` | 장식 그림 래퍼. 스크린리더 탐색과 터치 대상에서 제외한다 |
| `InfoDialog` | `ui/Dialog.tsx` | 제목·설명·본문 줄·확인 버튼을 가진 안내 모달. 열릴 때 제목으로 접근성 포커스를 옮긴다 |
| `useInfoDialog` | `ui/Dialog.tsx` | `open(content)`와 `dialogProps`를 반환한다. 닫힘 페이드 동안 마지막 내용을 유지한다 |
| `DialogCard`, `DialogBackdrop` | `ui/Dialog.tsx` | 모달 창 없이 같은 모양을 그릴 때 사용한다. Android QR 안내처럼 같은 창 오버레이가 필요한 경우에 쓴다 |
| `BottomSheet` | `ui/BottomSheet.tsx` | 부모 영역 하단에 붙는 상시 시트. `children`, `header`, 선택적인 `measurementHeader`, `snapPoints`, `initialIndex`, `onChange`, `accessibilityLabel`, ref의 `snapToIndex(index)` |
| `BottomSheetScrollView`, `BottomSheetFlatList`, `BottomSheetView`, `BottomSheetTextInput` | `ui/index.ts` | 시트 내 스크롤·목록·정적 콘텐츠·키보드 연동 입력용 라이브러리 컴포넌트 재수출 |
| `ScreenContainer` | `layout/ScreenContainer.tsx` | 스크롤 화면 뼈대. 최대 폭 600px 가운데 정렬, 좌우 24px, 하단 32px 여백. `header` 슬롯 제공 |
| `BrandLogo` | `layout/BrandLogo.tsx` | 전체 브랜드 SVG. `width`(기본 147.2), 원본 비율·부모 폭 유지, 접근성 이름 `아이엠박스` |
| `AppHeader` | `layout/AppHeader.tsx` | 화면 제목(28px extrabold). `subtitle`, `showBrand`(기본 `true`, iambox 로고) |
| `BottomTabBar` | `layout/BottomTabBar.tsx` | 하단 탭 |
| `PlaceholderContent` | `layout/PlaceholderContent.tsx` | 준비 중인 탭의 임시 화면 |

안내 모달 사용 예:

```tsx
const { open, dialogProps } = useInfoDialog();

<Button label="이용 내역 보기" variant="link" TrailingIcon={ArrowRight} onPress={() => open(mockAccessDetails.history)} />
<InfoDialog {...dialogProps} />
```

## 레이아웃 기준

- 스크롤 화면의 좌우 여백은 24px(`ScreenContainer`, `AppHeader`)로 통일한다.
- 지도처럼 남은 높이를 채우는 화면은 `ScreenContainer` 대신 `View flex-1`을 사용한다. 지점찾기는 최상단 검색·필터 아래에 지도와 시트를 배치한다(`features/locations/LocationsContent.tsx`).
- 지점찾기의 지도·목록과 지점 상세에서도 하단 탭을 고정 표시한다. 상세는 접근성 모달로 제한하지 않아 하단 탭 탐색과 이동을 유지하고, 뒤에 남아 있는 지도·목록만 터치와 접근성에서 제외한다. 콘텐츠는 탭 위의 남은 영역을 사용한다. 지도·목록 화면 상단에는 브랜드·제목·뒤로가기 없이 검색창과 필터만 표시하고, 지점 상세에서는 지도·목록으로 돌아가는 버튼을 표시한다.
- 홈 상단 소개 영역은 브랜드 로고와 큰 문구를 함께 쓰는 홈 전용 구성이라 `AppHeader`를 쓰지 않는다.
- 홈·마이페이지·공통 헤더는 `BrandLogo`로 전체 로고 SVG를 표시한다. 마이페이지는 최대 184×40 로고·설정 버튼·프로필 구성을 위해 전용 상단 영역을 사용한다. 로고는 남은 폭 안에서 비율을 유지해 축소하고 설정 버튼은 48px 폭을 유지한다. 메뉴는 구분선 없이 최소 높이 48px, 이용 관리와 고객지원 사이 24px(`mt-6`) 간격으로 배치한다. 바로가기 원은 기본 60px, 폭 360px 미만에서는 56px이며 글자 배율 1.2 초과에서는 2열로 바뀐다.
- 마이페이지 아이콘은 `mobile/assets/my/`의 개별 벡터 SVG를 import한다. 문구·터치 영역은 화면에, 도형만 SVG에 둔다. 자세한 파일 목록은 [아이콘 안내](../mobile/assets/my/README.md)를 따른다. 로그아웃 버튼 아래 법적 문서 링크는 최소 44px 터치 영역으로 각각 모달을 연다. 12px 링크는 흰 배경 대비 약 4.97:1인 `muted`를 사용한다.

## 공통 바텀 시트

- 부모는 높이가 있는 `View flex-1`을 사용하고 지도 등 배경과 `BottomSheet`를 형제로 둔다. 기본 시트는 절대 위치 오버레이이며 부모 영역 안에서만 펼쳐진다. 지점찾기의 부모 영역은 고정 하단 탭 위의 남은 공간을 사용한다. 이미 `App.tsx`가 탭 높이와 safe area를 레이아웃에 반영하므로 이를 이중으로 빼거나 더하지 않는다.
- 기본 스냅은 `[120, 부모 높이 × 0.45, 부모 높이 × 0.85]`다. 작은 부모에서는 첫 높이를 `min(120, 부모 높이 × 0.3)`을 기준으로 줄이되, 측정한 손잡이·헤더 높이 이상으로 유지한다. 중간 높이가 접힘 이하가 되면 접힘과 펼침의 중간값으로 보정한다. 큰 글자 등으로 헤더가 커지면 펼침 높이도 부모 범위 안에서 늘리며, 헤더조차 들어갈 수 없는 영역에는 시트를 표시하지 않는다. 숨김 중에도 접근성과 터치를 제외한 측정용 헤더를 유지해 글자 크기나 헤더가 줄면 자동 복구한다. `snapPoints`로 다른 높이를 전달할 수 있으며 오름차순 양수 px 또는 `'45%'` 형태를 사용한다. 실행 중 단계 수가 줄면 현재 인덱스를 새 범위로 보정하고, 단계를 다시 늘려도 보정한 위치를 유지한다. `initialIndex`는 0부터 시작하는 유효한 스냅 인덱스다.
- 배경은 `surface`, 그림자는 `heading` 토큰을 사용한다. 상단 손잡이에는 `inactive` 토큰의 40×4px 둥근 막대를 표시한다. 막대 자체는 접근성과 터치 대상에서 제외하고 기존 최소 44px 손잡이 영역이 조작을 담당한다. 상단 모서리는 24px이고 콘텐츠·헤더 좌우 여백은 화면에서 24px로 맞춘다. 고정 높이 전환을 위해 dynamic sizing을 끈다. 배경 dim 없이 노출된 지도 터치를 허용하고 아래로 끌어 완전히 닫는 동작은 제공하지 않는다.
- 손잡이는 최소 44px 터치 영역으로, 누르면 최대 높이/접힘을 전환한다. 접근성 역할은 `adjustable`이며 높이 단계와 펼치기·접기 액션을 제공한다. 화면에서도 별도 버튼으로 조작할 수 있게 한다. 시스템의 동작 줄이기 설정은 라이브러리 기본값을 따른다.
- `header`는 손잡이 영역에 고정되고 `children`이 본문이다. 본문 스크롤에는 일반 `ScrollView` 대신 공통 export의 `BottomSheetScrollView` 또는 `BottomSheetFlatList`를 사용한다. 정적 본문은 `BottomSheetView`로 감싼다. 현재 지도 시트 본문은 `LocationList`의 예시 지점 목록이며 `BottomSheetFlatList`로 스크롤한다.
- 앱 루트에 `GestureHandlerRootView`가 필요하다. 의존성을 새로 설치한 개발용 앱은 네이티브 재빌드 후 확인한다.

```tsx
import { BottomSheet, BottomSheetScrollView } from '../../components/ui';

<View className="flex-1">
  <LocationMap {...mapProps} />
  <BottomSheet header={<Text>지점 안내</Text>} accessibilityLabel="지점 안내">
    <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
      <Text>화면별 콘텐츠</Text>
    </BottomSheetScrollView>
  </BottomSheet>
</View>
```

## 지점 가격 마커

- `LocationMarker`는 흰색 말풍선·3px primary 테두리·하단 꼬리를 사용한다. 선택 지점은 primary 배경과 onPrimary 글자로 강조한다.
- 상단은 원본 로고의 왼쪽 심볼 + 지점명, 하단은 굵은 원화 시작 가격이다. 사용자 검토를 거친 축소 시안에 따라 고정 크기 지도 스냅샷은 120×76이다(기존 146×94). 로고는 19.8×22, 지점명은 12, 가격은 17이며 3px 테두리는 유지한다. 상세 화면의 이름·주소·요금은 일반 React Native 텍스트로 표시한다.
- 사용자 제공 PNG의 대표 브랜드 색은 유지한다. 지도 SDK의 비동기 이미지 캡처 문제를 피하기 위해 원본 왼쪽 심볼의 윤곽을 재구성한 72×80 `iambox-logo-symbol.svg`를 정적 import한다. PNG를 SVG에 내장하지 않는다. 상세의 `LocationLogo`도 같은 SVG를 표시한다.

## 지점 검색·사이즈 필터

- 화면 최상단 지도 바로 위의 고정 영역에 검색창과 필터 버튼을 한 줄로 배치한다. 바텀 시트를 펼쳐도 검색 영역은 상단에 유지된다. 최소 높이 48px·좌우 여백 24px·상단 여백 12px, 검색 배경은 `canvas`, 기본 필터 테두리는 `divider`, 적용 필터는 `primary` 테두리·`primary-50` 배경이다. 폭 320px 미만 또는 글자 배율 1.5 초과에서는 세로로 배치한다. 검색어가 있을 때 최소 44px 지우기 버튼을 표시한다.
- 지도 위 검색 입력은 일반 `TextInput`을 사용하고 입력 포커스 시 시트를 최대 높이로 펼친다. 지점찾기 시트에는 검색 헤더나 별도의 입력 측정 헤더를 전달하지 않는다. 공통 시트의 키보드 설정은 유지하며, 상단 입력은 시트 내부 입력 컨텍스트를 사용하지 않는다.
- 시트 고정 헤더에는 결과 개수와 펼치기/접기 버튼을 표시한다. 접힌 상태에서도 이 헤더를 유지하고 목록 행만 숨겨 빈 시트처럼 보이지 않게 한다. 펼친 목록의 스크롤 헤더에는 삭제 가능한 사이즈 칩을 표시한다. 칩은 최소 44px 터치 높이와 조건 삭제 접근성 라벨을 제공한다.
- 필터는 공통 `DialogBackdrop`을 사용하는 별도 모달이다. 등록된 사이즈만 체크박스로 선택하고 임시 결과 수를 표시한다. `결과 N곳 보기`로 적용하고, 닫기·Android 뒤로가기·접근성 escape로 임시 변경을 버린다. 초기화는 임시 사이즈만 비운다. 모달 동안 배경 화면의 터치·접근성을 제외한다.
- 가격 필터·거리 정렬·실제 재고·API 검색은 추가하지 않았다.

## 아직 정하지 않은 것

- 글자 크기·줄 간격 토큰. 홈·출입·마이 화면과 홈 배너의 명시적 크기는 11~36px 13종이며, 공통 AppHeader는 28px을 추가로 사용한다. 모서리 둥글기(`rounded-lg`~`rounded-[20px]`)도 공통 토큰으로 정의하지 않았다.
- 다크 모드. `app.json`은 `userInterfaceStyle: light`로 고정되어 있다.

## Figma 화면과 디자인 시스템

홈·출입 QR·마이페이지의 편집 가능한 화면과 색상 변수·추출 수치·텍스트 스타일·컴포넌트를 [Figma 파일](https://www.figma.com/design/nTPbDA6Kqd5wYzBiAjW9fu)에 정리했다. [화면 모음](https://www.figma.com/design/nTPbDA6Kqd5wYzBiAjW9fu?node-id=2-133), [Foundations](https://www.figma.com/design/nTPbDA6Kqd5wYzBiAjW9fu?node-id=10-966), [Components](https://www.figma.com/design/nTPbDA6Kqd5wYzBiAjW9fu?node-id=8-482)에서 검토할 수 있다.

- Figma의 추출 수치·컴포넌트는 검토용이며, 앱 공통 토큰·컴포넌트 구현 여부는 이 문서의 코드 설명을 따른다. Code Connect·자동 동기화는 없으며, 변경은 디자인 검토 후 코드와 문서에 수동 반영한다.
- 기준 화면은 402×874px이다. Figma 한글은 Noto Sans KR, 브랜드 영문은 SF Pro를 사용하므로 기기 기본 글꼴을 쓰는 앱과 줄바꿈·글자 폭이 다를 수 있다.
- 2026-10-02 기준 iOS 주요 화면과 Figma 배치를 확인했다. 홈 지점찾기 바로가기 아이콘 색·서비스 카드 chevron 정렬 보정이 남아 있으며, 최종 전체 변수 바인딩·Android·작은 화면·큰 글자·전체 상태·웹 배치는 검증하지 않았다. 이후 코드 변경 시 Figma와 다시 대조한다.

## 바텀 시트 지점 목록

- `features/locations/LocationList.tsx` 하나가 목록과 각 지점 행을 렌더링한다. `locations`, `selectedLocationId`, `onSelectLocation`, 선택적인 `header`, `visible`, `emptyMessage`를 받는다. 지점 행 전체가 하나의 상세 이동 버튼이다. `visible=false`일 때 마운트를 유지하되 터치·접근성·시각 노출을 제외한다.
- 이미지 왼쪽, 이름·위치 아이콘이 있는 주소·이용 가능 사이즈·최저가 오른쪽 구조다. 별도 더보기는 없다. 시설 배지 영역은 표시하지 않는다. 주소 앞 위치 아이콘은 16px·`muted`이며, 사이즈·최저가 영역 위 여백은 각각 8px(`mt-2`)이다. 행 좌우 여백은 24px이고 기본 배경은 `surface`, 선택 배경은 `primary-50`, 제목은 `primary`, 구분선은 `divider`다. 최저가는 기존 `formatLocationPrice`를 사용하며 가격이 없으면 `요금 문의`를 표시한다.
- 행 높이를 고정하거나 주소 줄 수를 제한하지 않는다. 화면 폭 360px 미만에서는 이미지 폭을 88px로 줄이고, 폭 320px 미만 또는 글자 배율 1.5 초과에서는 이미지와 정보 영역을 세로로 배치한다. 행은 최소 48px 터치 높이를 제공하며 이미지·이름·사이즈·가격을 하나의 상세 이동 버튼으로 묶는다. 이미지 없음 안내는 고정 높이 대신 최소 높이를 사용해 안내 문구가 커져도 늘어난다.
- 주소 아래·최저가 위에 `이용가능 :`과 `availableSizes`의 사이즈를 공통 `Badge`의 `neutral` 톤·`compact` 크기로 표시한다. 연한 회색(`divider`) 배경, `muted` 글자, 모서리 반경 4px, L 크기에 맞춘 동일 너비 20px·상하 여백 2px, 가운데 정렬 글자 크기 11px이며 라벨·뱃지 사이 간격은 6px다. 현재 mock 지점은 `M`, `L` 예시이며 데이터가 없거나 빈 배열이면 이 행을 숨긴다. 좁은 화면에서는 라벨과 뱃지가 줄바꿈된다.
- 강남·서초·성수 예시는 `assets/locations/`의 지점 내부 사진(`interior-corridor.jpg`, `interior-hall.jpg`, `interior-seongsu.jpg`)을 썸네일 영역에 `resizeMode="cover"`로 채워 표시한다. mock 지점에 예시로 배정한 사진이다. 사진이 없는 지점에는 이미지 없음 안내를 표시하고, 목록 상단에 지점·이미지·요금이 예시임을 알린다. 실제 지점 사진·시설 특징으로 취급하지 않는다. 빈 배열에는 빈 목록 안내를 표시한다.

## 공유 UI 통합 확인 (2026-10-02, 6단계)

공통 규칙을 native와 web 렌더러에서 함께 사용한다. 프로덕션 웹에서 버튼의 클릭·키보드·disabled·focus, 배지 6조합·375px 배치를 확인했다. iOS 개발용 앱에서도 출입QR의 primary/link 버튼·solid 배지, 지점 목록의 compact 사이즈 배지·공통 가격 표시를 확인했다. 플랫폼별 레이아웃과 이벤트는 각 앱에서 관리하며 복잡한 모바일 전용 UI는 공유하지 않는다.

Android 화면·실기기 밝기·전체 접근성/큰 글자 검증은 완료한 것으로 간주하지 않는다. [6단계 결과와 캡처](superpowers/plans/2026-10-02-monorepo-stage6.md)를 참고한다.
