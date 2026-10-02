import type { LocationPoint } from '../types/location';

/** Reproducible development fixtures; none of these are real branch records. */
export function createMarkerStressLocations(mode: 'spread' | 'dense'): readonly LocationPoint[] {
  return Array.from({ length: 350 }, (_, index) => ({
    id: `stress-${index}`,
    name: index % 17 === 0 ? `검증용 아주 긴 지점 이름 두 줄 표시와 말줄임 확인 ${index + 1}호점` : `검증 ${index + 1}호점`,
    latitude: 37.4965 + (mode === 'spread' ? (Math.floor(index / 25) - 6) * 0.009 : 0),
    longitude: 127.0175 + (mode === 'spread' ? (index % 25 - 12) * 0.012 : 0),
    address: `가상 검증용 주소 ${index + 1} · 실제 지점이 아닙니다`,
    district: '검증지역',
    priceFromKrw: index % 19 === 0 ? null : index % 23 === 0 ? 123456789 : 25000 + index * 100,
    priceBasis: '검증용 가격 · 실제 과금 기준이 아닙니다',
    availableSizes: index % 2 === 0 ? ['M', 'L'] : ['S', 'M'],
  }));
}
