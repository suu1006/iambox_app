import type { LocationData } from '@iambox/contracts';

function normalizeSearch(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('ko-KR');
}

/** 이름·주소 검색 AND 선택 사이즈 중 하나라도 이용 가능. 원본 순서와 확장 타입을 유지한다. */
export function filterLocations<T extends LocationData>(
  locations: readonly T[], query: string, sizes: readonly string[],
): T[] {
  const search = normalizeSearch(query);
  return locations.filter((location) => (
    (!search || normalizeSearch(`${location.name} ${location.address}`).includes(search))
    && (!sizes.length || sizes.some((size) => location.availableSizes?.includes(size)))
  ));
}
