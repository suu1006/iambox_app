/** 앱과 웹이 공유하는 지점 표시 데이터. 확정된 API 응답 계약은 아니다. */
export type LocationData = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  priceFromKrw: number | null;
  priceBasis: string;
  badge?: string;
  availableSizes?: readonly string[];
};
