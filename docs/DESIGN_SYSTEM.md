# Design System

> 기준일: 2026-09-30. 모바일 앱(`mobile/`)의 색상 토큰과 공통 UI 컴포넌트 사용 기준이다. 글자 크기·모서리 둥글기 토큰은 아직 정의하지 않았다(**예정**).

## 원칙

- 메인 컬러는 `primary`(#7B2DDA)다. 강조·버튼·활성 탭·로고는 primary, 연한 배경은 primary 단계색을 사용한다.
- 화면 코드에 hex 색상(`#xxxxxx`, `bg-[#...]`)과 `text-white`·`bg-white`를 직접 쓰지 않는다. 필요한 색이 없으면 먼저 토큰을 추가한다.
- 여러 화면에서 반복되는 UI는 `components/ui`·`components/layout`의 컴포넌트를 사용하고, 한 기능에서만 쓰는 UI는 `features/<feature>/`에 둔다.

## 색상 토큰

단일 출처는 `mobile/theme/colors.json`이다. `tailwind.config.js`가 이 파일을 읽어 Tailwind 클래스로, TS 코드가 import해 SVG `color`·네이티브 SDK 색상으로 함께 사용한다.

| 토큰 | 값 | Tailwind 예 | 용도 |
| --- | --- | --- | --- |
| `primary` | #7B2DDA | `bg-primary`, `text-primary` | 메인 버튼, 강조 문구, 활성 탭, 로고 |
| `primary-50` | #F6F2FD | `bg-primary-50` | 연보라 카드·아이콘 배경, 안내 본문 박스 |
| `primary-100` | #F0E9FA | `bg-primary-100` | 이벤트 배너 배경 |
| `primary-200` | #E5D5F7 | `bg-primary-200`, `border-primary-200` | 연한 배지 배경, 연보라 카드 안 구분선 |
| `onPrimary` | #FFFFFF | `text-onPrimary` | primary 배경 위 글자·아이콘 |
| `onPrimaryMuted` | #EEE0FF | `text-onPrimaryMuted` | primary 배경 위 보조 문구 |
| `heading` | #101828 | `text-heading` | 제목·본문 |
| `muted` | #667085 | `text-muted` | 보조 문구·보조 아이콘 |
| `inactive` | #818598 | `text-inactive` | 비활성 탭, 보조 chevron |
| `surface` | #FFFFFF | `bg-surface` | 기본 화면·카드·모달 배경 |
| `canvas` | #F8FAFC | `bg-canvas` | 회색 보조 배경(문의 박스, 임시·준비 화면) |
| `divider` | #E8E9EF | `border-divider`, `bg-divider` | 구분선, 회색 배지 배경 |
| `rating` | #FFB02E | `text-rating` | 별점 |

TS에서 사용할 때:

```tsx
import colors from '../../theme/colors.json';

<ChevronRight color={colors.muted} />
<ArrowRight color={colors.primary.DEFAULT} /> // primary는 단계색을 가진 객체라 DEFAULT로 기본값을 읽는다.
```

모달 배경의 반투명 검정(`bg-black/40`)은 `DialogBackdrop` 한 곳에서만 사용한다. `assets/home-storage.svg`, `home-delivery.svg`, `home-care.svg`, `01_storage_boxes.svg` 등 일러스트 SVG는 시안 색을 고정으로 담고 있어 토큰 대상이 아니다. 홈 바로가기 4개(`home-startup`, `home-location`, `home-onsite`, `home-notice`)는 `stroke="currentColor"`에 `primary` 토큰을 전달한다. `color` prop을 받는 아이콘 SVG(`currentColor`)만 토큰 색을 전달한다.

## 공통 컴포넌트

```text
mobile/components/
├── ui/        # 화면과 무관한 기본 UI — import { Button } from '../../components/ui'
└── layout/    # 화면 뼈대 — import { ScreenContainer } from '../../components/layout'
```

| 컴포넌트 | 위치 | 역할 / 주요 props |
| --- | --- | --- |
| `Button` | `ui/Button.tsx` | `variant="primary"`(높이 48·rounded-xl·primary 배경) 또는 `"link"`(primary 글자). `label`, `LeadingIcon`, `TrailingIcon`, `className`과 `Pressable` props |
| `Badge` | `ui/Badge.tsx` | 둥근 상태 라벨. `tone="solid"`(primary) 또는 `"soft"`(primary-200) |
| `Decorative` | `ui/Decorative.tsx` | 장식 그림 래퍼. 스크린리더 탐색과 터치 대상에서 제외한다 |
| `InfoDialog` | `ui/Dialog.tsx` | 제목·설명·본문 줄·확인 버튼을 가진 안내 모달. 열릴 때 제목으로 접근성 포커스를 옮긴다 |
| `useInfoDialog` | `ui/Dialog.tsx` | `open(content)`와 `dialogProps`를 반환한다. 닫힘 페이드 동안 마지막 내용을 유지한다 |
| `DialogCard`, `DialogBackdrop` | `ui/Dialog.tsx` | 모달 창 없이 같은 모양을 그릴 때 사용한다. Android QR 안내처럼 같은 창 오버레이가 필요한 경우에 쓴다 |
| `ScreenContainer` | `layout/ScreenContainer.tsx` | 스크롤 화면 뼈대. 최대 폭 600px 가운데 정렬, 좌우 24px, 하단 32px 여백. `header` 슬롯 제공 |
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
- 지도처럼 남은 높이를 채우는 화면은 `ScreenContainer` 대신 `View flex-1`에 `AppHeader`를 배치한다(`features/locations/LocationsContent.tsx`).
- 홈 상단 소개 영역은 브랜드 로고와 큰 문구를 함께 쓰는 홈 전용 구성이라 `AppHeader`를 쓰지 않는다.

## 아직 정하지 않은 것

- 글자 크기·줄 간격(현재 11~28px 13종), 모서리 둥글기(`rounded-lg`~`rounded-[20px]`) 토큰.
- 다크 모드. `app.json`은 `userInterfaceStyle: light`로 고정되어 있다.
