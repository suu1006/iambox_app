const assert = require('node:assert/strict');
const { test } = require('node:test');
const { filterLocations } = require('@iambox/utils');

const locations = [
  {
    id: 'gangnam', name: '강남점', address: '서울 강남구',
    latitude: 37.5, longitude: 127, priceFromKrw: 39000, priceBasis: '예시 요금',
    availableSizes: ['M'], photoSource: { uri: 'https://example.invalid/photo.jpg' },
    warehouseCode: 'A-024',
  },
  {
    id: 'seocho', name: '서초점', address: '서울 서초구',
    latitude: 37.49, longitude: 127.01, priceFromKrw: null, priceBasis: '요금 문의',
    availableSizes: ['L'], warehouseCode: 'B-025',
  },
];

test('공통 필터는 플랫폼 확장 데이터와 원본 객체 참조를 보존한다', () => {
  const result = filterLocations(locations, '강남', ['M']);
  assert.equal(result.length, 1);
  assert.equal(result[0], locations[0]);
  assert.equal(result[0].warehouseCode, 'A-024');
  assert.equal(result[0].photoSource.uri, 'https://example.invalid/photo.jpg');
  assert.notEqual(result, locations);
});

test('공통 패키지 검색은 분해된 한글을 조합형 지점명과 일치시킨다', () => {
  const decomposed = '\u1100\u1161\u11bc\u1102\u1161\u11b7';
  assert.deepEqual(filterLocations(locations, decomposed, []).map(item => item.id), ['gangnam']);
});
