import type { LocationPoint } from '../features/locations/types';

// 지도 표시 확인용 예시 좌표이며 실제 운영 지점 정보가 아니다.
export const previewLocations: readonly LocationPoint[] = [
  {
    id: 'preview-gangnam',
    name: '강남 예시 지점',
    latitude: 37.4979,
    longitude: 127.0276,
  },
  {
    id: 'preview-seocho',
    name: '서초 예시 지점',
    latitude: 37.491,
    longitude: 127.0079,
  },
  {
    id: 'preview-seongsu',
    name: '성수 예시 지점',
    latitude: 37.5445,
    longitude: 127.0557,
  },
];
