const assert = require('node:assert/strict');
const { test } = require('node:test');
const { markerArtworkLayout } = require('../utils/markerArtworkLayout.ts');

test('실측 이름·가격에 따라 폭을 늘리고 긴 이름은 최대 두 줄·280pt로 제한한다', () => {
  const short = markerArtworkLayout('price', [{ text: '강남점', width: 36 }], 90);
  const long = markerArtworkLayout('price', [{ text: '신논현마에스트로점', width: 180 }], 90);
  assert.equal(short.width, 120);
  assert.equal(long.width, 230);
  const wrapped = markerArtworkLayout('price', [{ text: '첫 번째', width: 230 }, { text: '두 번째', width: 220 }, { text: '세 번째', width: 30 }], 100);
  assert.equal(wrapped.width, 280);
  assert.equal(wrapped.nameLines.length, 2);
  assert.ok(wrapped.nameLines[1].endsWith('…'));
  assert.ok(wrapped.height > short.height);
  assert.ok(markerArtworkLayout('price', [{ text: '강남점', width: 36 }], 220).width > short.width);
});
test('클러스터는 가격 로고 영역 없이 개수 라벨에 맞춘 작은 말풍선을 만든다', () => {
  const layout = markerArtworkLayout('cluster', [{ text: '9 강남구', width: 65 }], 0);
  assert.equal(layout.width, 89);
  assert.equal(layout.height, 46);
  const wrapped = markerArtworkLayout('cluster', [{ text: '350 아주 긴 지역', width: 160 }, { text: '이름', width: 30 }], 0);
  assert.equal(wrapped.height, 62, '두 줄 클러스터는 높이도 늘린다');
});
