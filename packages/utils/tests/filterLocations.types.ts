import type { LocationData } from '@iambox/contracts';
import { filterLocations } from '@iambox/utils';

// 소비자가 추가한 데이터 타입을 반환 배열에서도 유지해야 한다.
type LocationWithPhoto = LocationData & { photoSource: { uri: string }; warehouseCode: string };
const locations: readonly LocationWithPhoto[] = [{
  id: 'gangnam', name: '강남점', address: '서울 강남구',
  latitude: 37.5, longitude: 127, priceFromKrw: 39000, priceBasis: '예시 요금',
  photoSource: { uri: 'https://example.invalid/photo.jpg' }, warehouseCode: 'A-024',
}];

const filtered = filterLocations(locations, '강남', []);
const preserved: LocationWithPhoto[] = filtered;
const photoUri: string = filtered[0]!.photoSource.uri;
const warehouseCode: string = filtered[0]!.warehouseCode;
void [preserved, photoUri, warehouseCode];
