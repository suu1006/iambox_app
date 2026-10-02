const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createMarkerStressLocations } = require('../mocks/locationMarkerStress.ts');
const { createBranchClusterIndex, getBranchClusters } = require('../utils/branchClusters.ts');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

test('350개 검증 지점은 재현 가능하며 분산·동일 좌표 밀집과 누락 가격·긴 이름을 포함한다', () => {
  const spread = createMarkerStressLocations('spread');
  const dense = createMarkerStressLocations('dense');
  assert.equal(spread.length, 350);
  assert.equal(new Set(spread.map((point) => point.id)).size, 350);
  assert.deepEqual(spread, createMarkerStressLocations('spread'));
  assert.ok(spread.some((point) => point.priceFromKrw === null));
  assert.ok(spread.some((point) => point.name.length > 25));
  const model = createBranchClusterIndex(dense);
  const result = getBranchClusters(model, [126, 36, 128, 39], 21);
  assert.equal(result.length, 1);
  assert.equal(result[0].count, 350);
  assert.ok(dense.every((point) => point.address.includes('검증용')));
});

test('대량 데이터 플래그는 개발 모드에서만 적용하고 릴리스와 기본 실행은 3개를 유지한다', () => {
  const code = ts.transpileModule(readFileSync(require.resolve('../mocks/locations.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const load = (dev, mode) => {
    const module = { exports: {} };
    vm.runInNewContext(code, {
      module, exports: module.exports, __DEV__: dev, process: { env: { EXPO_PUBLIC_MAP_MARKER_STRESS: mode } },
      require: (id) => id === './locationMarkerStress' ? { createMarkerStressLocations } : 1,
    });
    return module.exports.mockLocations;
  };
  assert.equal(load(true, 'spread').length, 350);
  assert.equal(load(true, 'dense').length, 350);
  assert.equal(load(false, 'spread').length, 3);
  assert.equal(load(true, undefined).length, 3);
});
