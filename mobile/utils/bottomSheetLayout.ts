// 바텀시트가 멈출 세 가지 높이(접힘·중간·펼침)를 계산
// 결과 : px 단위의 배열
// 접힘: 기본 120px. 작은 화면에서는 부모 높이의 30%로 줄이되, 시트 헤더가 들어갈 높이는 확보합니다.
// 펼침: 기본 부모 높이의 85%. 접힘 높이가 커지면 펼침 높이도 늘려 공간을 확보합니다.
// 중간: 기본 부모 높이의 45%. 이 값이 접힘 높이보다 작거나 같으면 접힘과 펼침 사이의 중간값을 사용합니다.
export function getDefaultBottomSheetSnapPoints(containerHeight: number, headerHeight = 0): number[] {
  if (!Number.isFinite(containerHeight) || containerHeight <= 0) return [];
  if (containerHeight <= headerHeight) return [];

  const collapsed = Math.max(Math.min(120, containerHeight * 0.3), headerHeight);
  const expanded = Math.max(containerHeight * 0.85, (containerHeight + collapsed) / 2);
  const middle = containerHeight * 0.45 > collapsed
    ? containerHeight * 0.45
    : (collapsed + expanded) / 2;
  return [collapsed, middle, expanded];
}
