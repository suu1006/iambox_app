export function formatLocationPrice(priceFromKrw: number | null): string {
  return priceFromKrw === null
    ? '요금 문의'
    : `${priceFromKrw.toLocaleString('ko-KR')}원~`;
}
