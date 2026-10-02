const assert = require('node:assert/strict');
const { test } = require('node:test');

const { filterLocations } = require('../utils/filterLocations.ts');

const locations = [
  { id: 'gangnam', name: '강남점', address: '서울 강남구', availableSizes: ['M'] },
  { id: 'seocho', name: '서초점', address: '서울 서초구', availableSizes: ['L'] },
  { id: 'seongsu', name: 'Seongsu점', address: '서울 성동구', availableSizes: ['M', 'L'] },
  { id: 'unknown', name: '수원점', address: '경기 수원시' },
];

function ids(query = '', sizes = []) {
  return filterLocations(locations, query, sizes).map(item => item.id);
}

test('검색 조건이 없으면 사이즈 정보가 없는 지점도 포함해 원래 순서를 유지한다', () => {
  assert.deepEqual(ids('  '), ['gangnam', 'seocho', 'seongsu', 'unknown']);
});
test('지점명과 주소를 검색하고 입력 공백·영문 대소문자를 정규화한다', () => {
  assert.deepEqual(ids(' 강남 '), ['gangnam']);
  assert.deepEqual(ids('서울 성동'), ['seongsu']);
  assert.deepEqual(ids('SEONGSU'), ['seongsu']);
  assert.deepEqual(ids('제주'), []);
});
test('선택한 사이즈 중 하나라도 이용 가능한 지점을 포함하고 사이즈 누락 지점은 제외한다', () => {
  assert.deepEqual(ids('', ['M']), ['gangnam', 'seongsu']);
  assert.deepEqual(ids('', ['M', 'L']), ['gangnam', 'seocho', 'seongsu']);
  assert.deepEqual(ids('', ['XL']), []);
});
test('검색과 사이즈 조건을 함께 적용하고 입력 데이터를 변경하지 않는다', () => {
  const before = structuredClone(locations);
  assert.deepEqual(ids('강남', ['L']), []);
  assert.deepEqual(ids('서초', ['L']), ['seocho']);
  assert.deepEqual(locations, before);
  assert.deepEqual(filterLocations([], '', []), []);
});
