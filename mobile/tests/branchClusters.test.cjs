const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createBranchClusterIndex, getBranchClusters, regionToBBox, getClusterCamera } = require('../utils/branchClusters.ts');
const point = (id, latitude = 37.5, longitude = 127, district = '강남구') => ({ id, name: `${id}점`, latitude, longitude, district, address: '검증 주소', priceFromKrw: 39000, priceBasis: '검증 요금' });
const bbox = [126, 36, 129, 39];

test('가까운 다른 구 지점을 묶고 먼 같은 구 지점은 Point로 함께 표시한다', () => {
  const model = createBranchClusterIndex([point('a'), point('b', 37.5001, 127.0001, '서초구'), point('c', 38, 128)]);
  const items = getBranchClusters(model, bbox, 12);
  assert.equal(items.length, 2);
  assert.equal(items.find((item) => item.kind === 'cluster').count, 2);
  assert.equal(items.find((item) => item.kind === 'cluster').district, undefined);
  assert.equal(items.find((item) => item.kind === 'point').location.id, 'c');
});
test('공통 district만 표시하며 누락되거나 섞이면 개수만 표시한다', () => {
  const query = (locations) => getBranchClusters(createBranchClusterIndex(locations), bbox, 12)[0];
  assert.equal(query([point('a'), point('b')]).district, '강남구');
  assert.equal(query([point('a'), { ...point('b'), district: undefined }]).district, undefined);
  assert.equal(query([point('a'), point('b', 37.5, 127, '서초구')]).district, undefined);
});
test('expansion zoom에 실제 지점이 분리되며 bbox 밖 지점을 제외한다', () => {
  const model = createBranchClusterIndex([point('a'), point('b', 37.51, 127.01), point('outside', 38, 128)]);
  const area = [126.9, 37.4, 127.1, 37.6];
  const [cluster] = getBranchClusters(model, area, 10);
  const camera = getClusterCamera(model, cluster);
  assert.ok(camera.zoom > 10);
  assert.equal(camera.duration, 450);
  assert.deepEqual(getBranchClusters(model, area, camera.zoom).map((item) => item.location.id).sort(), ['a', 'b']);
});
test('GeoJSON 좌표 순서·원본을 보존하고 잘못된 좌표·중복 ID를 제외한다', () => {
  const a = point('a');
  const input = [a, point('nan', NaN), point('range', 91), point('lon', 37, 181), point('a', 38, 128)];
  const model = createBranchClusterIndex(input);
  const [item] = getBranchClusters(model, [126.9, 37.4, 127.1, 37.6], 21);
  assert.equal(item.location, a);
  const coordinates = model.index.getClusters(bbox, 22)[0].geometry.coordinates;
  assert.ok(Math.abs(coordinates[0] - 127) < 1e-9);
  assert.ok(Math.abs(coordinates[1] - 37.5) < 1e-9);
  assert.equal(input.length, 5);
});
test('남서쪽 region과 5% 버퍼를 bbox로 변환하며 준비 전에는 조회하지 않는다', () => {
  assert.deepEqual(regionToBBox({ latitude: 37, longitude: 127, latitudeDelta: 1, longitudeDelta: 2 }), [126.9, 36.95, 129.1, 38.05]);
  assert.equal(regionToBBox({ latitude: NaN, longitude: 127, latitudeDelta: 1, longitudeDelta: 1 }), null);
  assert.deepEqual(getBranchClusters(createBranchClusterIndex([]), null, 12), []);
});
test('350개 동일 좌표도 최대 확대에서 개수를 보존하고 1000개 분산 데이터를 처리한다', () => {
  const dense = createBranchClusterIndex(Array.from({ length: 350 }, (_, i) => point(String(i))));
  const [cluster] = getBranchClusters(dense, bbox, 21);
  assert.equal(cluster.count, 350);
  assert.equal(getClusterCamera(dense, cluster).zoom, 21);
  assert.equal(dense.index.getLeaves(cluster.id, Infinity).length, 350);
  const spread = createBranchClusterIndex(Array.from({ length: 1000 }, (_, i) => point(String(i), 35 + Math.floor(i / 50) * 0.1, 125 + i % 50 * 0.1)));
  const all = getBranchClusters(spread, [124, 34, 131, 39], 12);
  assert.equal(all.reduce((total, item) => total + (item.kind === 'cluster' ? item.count : 1), 0), 1000);
  assert.equal(getBranchClusters(spread, [124.99, 34.99, 125.15, 35.15], 20).length, 4);
});
