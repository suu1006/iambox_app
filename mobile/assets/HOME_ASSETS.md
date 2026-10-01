# 홈 서비스 아이콘

홈 아이콘은 `mobile/assets/`의 SVG를 import해서 사용한다. 서비스 카드 3개는 선택 시안의 윤곽과 색상을 추적한 벡터 SVG이고, 바로가기 4개는 사용자가 선택한 라인 시안의 윤곽을 단순한 벡터 선으로 재구성했다(32×32 `viewBox`, `path`·`rect`·`circle`). PNG에서 원본 SVG를 복원한 것은 아니며 작은 표시 크기에 맞춰 곡선과 선을 정리했다. 7개 모두 래스터 이미지(`image`, base64)를 내장하지 않는다.

| 파일 | 용도 | 기준 이미지 |
| --- | --- | --- |
| `home-storage.svg` | 물품 보관의 상자와 화분 | 첫 번째 첨부의 서비스 카드 |
| `home-delivery.svg` | 택배요청의 배송 트럭 | 첫 번째 첨부의 서비스 카드 |
| `home-care.svg` | 케어서비스의 방패와 상자 | 첫 번째 첨부의 서비스 카드 |
| `home-startup.svg` | 창업문의 매장 아이콘 | 선택 라인 시안의 매장 윤곽 |
| `home-location.svg` | 지점 찾기 핀 아이콘 | 선택 라인 시안의 위치 핀 |
| `home-onsite.svg` | 출장서비스 가방 아이콘 | 선택 라인 시안의 서류가방 |
| `home-notice.svg` | 공지사항 확성기 아이콘 | 선택 라인 시안의 확성기 |

## 사용

기존 `react-native-svg-transformer`로 컴포넌트처럼 import한다. `viewBox`에 맞춰 원본 비율이 유지되므로 `width`, `height`로 표시 영역을 지정한다.

```tsx
import HomeCare from '../assets/home-care.svg';

<HomeCare width={114} height={62} />
```

원형 배경, 카드 배경과 텍스트는 `HomeContent.tsx`에서 배치한다. 서비스 카드 SVG의 색상은 파일에 고정되어 있다. 바로가기 SVG는 `stroke="currentColor"`를 사용하며 `HomeContent`가 `color={colors.primary.DEFAULT}`로 브랜드 토큰을 전달한다. 기존 `01_storage_boxes.svg` 등은 헤더·배너·후기에서 계속 사용한다.

바로가기 아이콘은 64×64 원형 영역 안에 32×32로 표시한다. 파일명과 정적 import는 기존 `home-*.svg`를 유지하므로 출입QR 화면의 별도 `location.svg`와 충돌하지 않는다. 2 단위 선 두께와 둥근 끝·모서리를 통일했고, 아이콘별 도형은 1~2개다. 래스터 이미지, 그라데이션, 필터, 마스크가 없으며 SVG 원문은 네 파일 합계 1,198바이트다. Metro가 빌드 시 네이티브 SVG 컴포넌트로 변환하므로 실행 중 파일 다운로드·SVG 문자열 파싱 없이 렌더링한다. 이 단순화는 렌더링 작업을 줄이는 구성이고, 실기기 프레임 시간 개선 수치를 측정한 것은 아니다.

## 서비스 카드 벡터 변환 근거

서비스 카드 3개(`home-storage`, `home-delivery`, `home-care`)에 적용된 기록이다.

- 첨부: `codex-clipboard-49b6bff7-986d-4cde-95a3-3cf09d539ded.png`.
- 작은 첨부 대신 같은 시안의 고해상도 생성 이미지 `exec-7ddea712-151a-4af9-be97-17b7c37b9e7e.png`에서 추출했다.
- 배경을 분리한 뒤 VTracer 0.6.15의 spline 경로로 변환했다. 색상 정밀도 5, 레이어 차이 24로 작은 표시 크기에서의 형태와 용량을 함께 고려했다. 변환 도구는 임시 폴더에서만 사용했고 앱 의존성에는 추가하지 않았다.
- 원본의 미세한 그림자와 색상 변화는 단순화되어 있다. 특히 큰 크기로 확대하면 래스터 원본과 차이가 보일 수 있다.

## 라인 아이콘 검증 (2026-10-01)

- `pnpm --filter @iambox/mobile typecheck`: 통과.
- `pnpm --filter @iambox/mobile test`: 기존 QR 밝기 테스트 13개 통과(아이콘 시각 검증을 대체하지 않는다).
- Expo export: iOS·Android Hermes 번들 생성 통과.
- 기존 SVGR native + SVGO 변환 검사: 네 SVG의 32×32 viewBox, currentColor 전달, 지원 벡터 도형 1~2개, 이미지·필터·마스크·그라데이션 미포함 확인.
- iPhone 18 Pro / iOS 27.0 시뮬레이터: 네 아이콘 표시, 창업문의·출장서비스·공지사항 안내창 열기/닫기, 지점 찾기 탭 이동 및 홈 복귀 확인.
- Android 네이티브 화면 실행·실기기 렌더링 시간은 미측정.

번들 검증은 저장소 루트에서 다음 명령으로 재현한다. 출력은 임시 폴더에 저장하며 저장소에 추가하지 않는다.

```sh
CI=1 EXPO_NO_TELEMETRY=1 pnpm --filter @iambox/mobile exec expo export \
  --platform ios --platform android \
  --output-dir /private/tmp/iambox-home-outline-export
```
