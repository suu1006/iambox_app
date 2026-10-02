const assert = require('node:assert/strict');
const { test } = require('node:test');
const { mountComponent } = require('./helpers/mountComponent.cjs');
const clusterUtils = require('../utils/branchClusters.ts');
const locations = [{ id: 'a', name: '강남점', latitude: 37.5, longitude: 127, address: '서울', priceFromKrw: 39000 }];

test('카메라 조회·선택 변경은 같은 인덱스를 재사용하고 입력 데이터 변경만 다시 load한다', () => {
  const mount = mountComponent('features/locations/useBranchClusters.ts', 'useBranchClusters', {}, { '../../utils/branchClusters': clusterUtils });
  const a = mount.render({ locations, bbox: [126, 36, 128, 38], zoom: 12 });
  const b = mount.render({ locations, bbox: [126.9, 37.4, 127.1, 37.6], zoom: 15 });
  assert.equal(a.model, b.model);
  assert.equal(b.items[0].location, locations[0]);
  const c = mount.render({ locations: [], bbox: [126, 36, 128, 38], zoom: 15 });
  assert.notEqual(c.model, b.model);
  assert.equal(c.items.length, 0);
});
test('새 마커만 150ms fade하고 기존 Point key·불투명도를 유지한다', () => {
  const timers = [];
  const mount = mountComponent('features/locations/useBranchClusters.ts', 'useMarkerTransition', {}, { '../../utils/branchClusters': clusterUtils }, {
    setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; }, clearTimeout() {},
  });
  const item = { kind: 'point', location: locations[0] };
  const props = { items: [item], generation: 1 };
  assert.equal(mount.render(props)[0].alpha, 0);
  timers.find((timer) => timer.ms === 150).fn();
  assert.equal(mount.render(props)[0].alpha, 1);
  const next = mount.render({ items: [item, { kind: 'point', location: { ...locations[0], id: 'b' } }], generation: 1 });
  assert.equal(next[0].alpha, 1);
  assert.equal(next[1].alpha, 0);
  assert.equal(next[0].key, 'point:a');
  mount.unmount();
});
