const assert = require('node:assert/strict');
const { test } = require('node:test');
const { getDefaultBottomSheetSnapPoints } = require('../utils/bottomSheetLayout.ts');

test('지도 영역의 높이로 시트 높이를 계산해 탭 영역을 침범하지 않는다', () => {
  assert.deepEqual(getDefaultBottomSheetSnapPoints(600), [120, 270, 510]);
});

test('작은 지도 영역에서는 접힘 높이를 줄여 세 높이의 순서를 유지한다', () => {
  assert.deepEqual(getDefaultBottomSheetSnapPoints(200), [60, 90, 170]);
});

test('작은 지도 영역에서도 측정된 손잡이와 헤더를 접힘 상태에 온전히 표시한다', () => {
  assert.deepEqual(getDefaultBottomSheetSnapPoints(200, 92), [92, 131, 170]);
});

test('큰 글자로 헤더가 커지면 접힘 높이를 늘리고 나머지 높이 순서를 유지한다', () => {
  assert.deepEqual(getDefaultBottomSheetSnapPoints(600, 160), [160, 270, 510]);
  assert.deepEqual(getDefaultBottomSheetSnapPoints(200, 152), [152, 164, 176]);
});

test('헤더조차 들어갈 높이가 없으면 잘린 시트를 배치하지 않는다', () => {
  assert.deepEqual(getDefaultBottomSheetSnapPoints(92, 92), []);
});

test('레이아웃 측정 전이나 사용할 높이가 없으면 시트를 배치하지 않는다', () => {
  assert.deepEqual(getDefaultBottomSheetSnapPoints(0), []);
  assert.deepEqual(getDefaultBottomSheetSnapPoints(-10), []);
  assert.deepEqual(getDefaultBottomSheetSnapPoints(NaN), []);
  assert.deepEqual(getDefaultBottomSheetSnapPoints(Infinity), []);
});
