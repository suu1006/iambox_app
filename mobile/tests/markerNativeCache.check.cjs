const assert = require('node:assert/strict');
const { test } = require('node:test');
const { mkdtempSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

test('실제 iOS 캐시가 500개 이미지를 순회해도 128개를 넘지 않고 기존 키는 갱신한다', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'iambox-native-cache-'));
  try {
    const header = path.resolve(__dirname, '../node_modules/@mj-studio/react-native-naver-map/ios/Util/Image/BoundedImageCache.h');
    const source = path.join(dir, 'check.cpp');
    writeFileSync(source, `#include "${header}"
#include <cassert>
int main() {
  NaverMapBoundedImageCache<int> cache(128);
  for (int i = 1; i <= 500; ++i) {
    cache.put(std::to_string(i), i);
    assert(cache.size() <= 128);
  }
  assert(cache.get("1") == 0);
  assert(cache.get("500") == 500);
  cache.put("500", 501);
  assert(cache.get("500") == 501);
  assert(cache.size() == 128);
  return 0;
}
`);
    const compile = spawnSync(process.env.CXX || 'c++', ['-std=c++17', source, '-o', path.join(dir, 'check')], { encoding: 'utf8' });
    assert.equal(compile.status, 0, compile.stderr);
    const run = spawnSync(path.join(dir, 'check'), [], { encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
