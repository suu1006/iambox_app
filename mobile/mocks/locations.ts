import type { LocationPoint } from '../types/location';

// 지도 표시 확인용 예시 좌표이며 실제 운영 지점 정보가 아니다.
export const mockLocations: readonly LocationPoint[] = [
  {
    id: 'mock-gangnam',
    name: '강남점',
    latitude: 37.4979,
    longitude: 127.0276,
    address: '서울 강남구 · 예시 주소',
    priceFromKrw: 39000,
    priceBasis: '예시 시작 요금 · 실제 과금 기준 미정',
    // 아이엠박스 지점 내부 사진을 예시로 배정했으며 이 mock 지점의 실제 시설 사진이 아니다.
    photoSource: require('../assets/locations/interior-corridor.jpg'),
    badge: '예시 시설',
    availableSizes: ['M', 'L'],
  },
  {
    id: 'mock-seocho',
    name: '서초점',
    latitude: 37.491,
    longitude: 127.0079,
    address: '서울 서초구 · 예시 주소',
    priceFromKrw: 35000,
    priceBasis: '예시 시작 요금 · 실제 과금 기준 미정',
    photoSource: require('../assets/locations/interior-hall.jpg'),
    badge: '예시 시설',
    availableSizes: ['M', 'L'],
  },
  {
    id: 'mock-seongsu',
    name: '성수점',
    latitude: 37.5445,
    longitude: 127.0557,
    address: '서울 성동구 · 예시 주소',
    priceFromKrw: 49000,
    priceBasis: '예시 시작 요금 · 실제 과금 기준 미정',
    photoSource: require('../assets/locations/interior-seongsu.jpg'),
    availableSizes: ['M', 'L'],
  },
];
