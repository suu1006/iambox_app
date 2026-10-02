# 마이페이지 SVG 아이콘

사용자가 선택한 마이페이지 시안에 맞춘 개별 벡터 파일이다. 기존 앱의 상자·문서·헤드셋 아이콘 형태를 재사용하고 나머지는 같은 선형 스타일로 작성했다. PNG 추적이나 base64 이미지 내장이 아닌 `path`, `circle`, `rect`만 사용한다.

| 파일 | 용도 |
| --- | --- |
| [profile.svg](profile.svg) | 프로필 아바타 |
| [settings.svg](settings.svg) | 설정 |
| [box.svg](box.svg) | 나의 박스 |
| [history.svg](history.svg) | 이용 내역 |
| [payment.svg](payment.svg) | 결제 내역 |
| [headset.svg](headset.svg) | 문의하기 |
| [notification.svg](notification.svg) | 알림설정 |
| [delivery.svg](delivery.svg) | 택배예약 |
| [reservation.svg](reservation.svg) | 사전예약 |
| [care.svg](care.svg) | 케어서비스 |
| [notice.svg](notice.svg) | 공지사항 |
| [faq.svg](faq.svg) | FAQ |

`features/my/MyContent.tsx`에서 기존 SVG transformer를 통해 직접 import한다. `width`, `height`로 크기를, `color`로 `currentColor`를 지정한다. 원형 배경과 터치 영역은 화면에서 배치한다. 방향 화살표는 공통 `assets/chevron-right.svg`, 하단 탭은 기존 `assets/nav-*.svg`를 사용한다.

```tsx
import BoxIcon from '../../assets/my/box.svg';
import colors from '@iambox/design-tokens/colors.json';

<BoxIcon width={32} height={32} color={colors.primary.DEFAULT} accessible={false} />
```
