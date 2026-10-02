const assert = require('node:assert/strict');
const { test } = require('node:test');
const { formatLocationPrice } = require('../utils/formatLocationPrice.ts');

test('마커와 상세 요금은 원화 구분자와 시작 가격 표시를 포함한다', () => {
  assert.equal(formatLocationPrice(39000), '39,000원~');
  assert.equal(formatLocationPrice(1250000), '1,250,000원~');
});

test('요금이 없으면 0원 대신 문의 안내를 표시한다', () => {
  assert.equal(formatLocationPrice(null), '요금 문의');
});

test('실제 0원 요금은 요금 없음과 구분한다', () => {
  assert.equal(formatLocationPrice(0), '0원~');
});
