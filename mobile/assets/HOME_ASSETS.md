# 홈 서비스 아이콘

사용자가 선택한 2026-09-30 홈 시안의 아이콘을 배경·문구와 분리하고 벡터 경로로 변환했다. 원본은 PNG이므로 원본 벡터 경로를 복구한 파일이 아니라 시안의 윤곽과 색상을 추적한 SVG다. 이미지가 내장된 SVG(`image`, base64)는 사용하지 않는다.

| 파일 | 용도 | 기준 이미지 |
| --- | --- | --- |
| `home-storage.svg` | 물품 보관의 상자와 화분 | 첫 번째 첨부의 서비스 카드 |
| `home-delivery.svg` | 택배요청의 배송 트럭 | 첫 번째 첨부의 서비스 카드 |
| `home-care.svg` | 케어서비스의 방패와 상자 | 첫 번째 첨부의 서비스 카드 |
| `home-startup.svg` | 창업문의 매장 아이콘 | 두 번째 첨부의 원형 메뉴 |
| `home-location.svg` | 지점 찾기 핀 아이콘 | 두 번째 첨부의 원형 메뉴 |
| `home-onsite.svg` | 출장서비스 가방 아이콘 | 두 번째 첨부의 원형 메뉴 |
| `home-notice.svg` | 공지사항 확성기 아이콘 | 두 번째 첨부의 원형 메뉴 |

## 사용

기존 `react-native-svg-transformer`로 컴포넌트처럼 import한다. `viewBox`에 맞춰 원본 비율이 유지되므로 `width`, `height`로 표시 영역을 지정한다.

```tsx
import HomeCare from '../assets/home-care.svg';

<HomeCare width={114} height={62} />
```

원형 배경, 카드 배경과 텍스트는 `HomeContent.tsx`에서 배치한다. SVG의 색상은 시안에 맞춰 고정되어 있으며 `color` prop으로 일괄 변경되지 않는다. 기존 `01_storage_boxes.svg` 등은 헤더·배너·후기에서 계속 사용한다.

## 변환 근거

- 첫 번째 첨부: `codex-clipboard-49b6bff7-986d-4cde-95a3-3cf09d539ded.png`.
- 두 번째 첨부: `codex-clipboard-51152909-20a7-4ed4-ba21-17232d670dff.png`.
- 작은 첨부 대신 같은 시안의 고해상도 생성 이미지에서 추출했다: `exec-7ddea712-151a-4af9-be97-17b7c37b9e7e.png`(서비스), `exec-8eee0015-7413-44a9-8ee5-6a62c95fad87.png`(원형 메뉴).
- 배경을 분리한 뒤 VTracer 0.6.15의 spline 경로로 변환했다. 색상 정밀도 5, 레이어 차이 24로 작은 표시 크기에서의 형태와 용량을 함께 고려했다. 변환 도구는 임시 폴더에서만 사용했고 앱 의존성에는 추가하지 않았다.
- 원본의 미세한 그림자와 색상 변화는 단순화되어 있다. 특히 큰 크기로 확대하면 래스터 원본과 차이가 보일 수 있다.
