const assert = require('node:assert/strict');
const { test } = require('node:test');
const { mountComponent } = require('./helpers/mountComponent.cjs');

function fixture() {
  const files = new Map([['cache/iambox-markers/previous/0.png', 'old']]);
  const directories = new Set(['cache/iambox-markers', 'cache/iambox-markers/previous']);
  class File {
    constructor(parent, name) { this.uri = `${parent.uri}/${name}`; this.name = name; }
    get exists() { return files.has(this.uri); }
    write(value) { files.set(this.uri, value); }
    delete() { files.delete(this.uri); }
  }
  class Directory {
    constructor(parent, name) { this.uri = `${typeof parent === 'string' ? parent : parent.uri}/${name}`; this.name = name; }
    create() { directories.add(this.uri); }
    list() { return [...directories].filter((dir) => dir.startsWith(this.uri + '/') && !dir.slice(this.uri.length + 1).includes('/')).map((dir) => new Directory(this, dir.split('/').at(-1))); }
    delete() { for (const file of files.keys()) if (file.startsWith(this.uri + '/')) files.delete(file); directories.delete(this.uri); }
  }
  const mount = mountComponent('features/locations/useMarkerImages.ts', 'useMarkerImages', {}, {
    'expo-file-system': { File, Directory, Paths: { cache: { uri: 'cache', list: () => [] } } },
    'react-native': { PixelRatio: { get: () => 3 } },
    '../../utils/markerImageCache': require('../utils/markerImageCache.ts'),
    '../../utils/formatLocationPrice': { formatLocationPrice: (price) => `${price}원~` },
  });
  return { files, mount };
}
const point = (i) => ({ kind: 'point', location: { id: String(i), name: `지점${i}`, priceFromKrw: 39000 } });

test('PNG를 하나씩 생성해 크기를 재사용하고 이전 세션·unmount 파일을 정리한다', () => {
  const { files, mount } = fixture();
  const props = { items: [point(1), point(2)], selectedId: '2' };
  mount.render(props);
  let hook = mount.render(props);
  assert.equal(hook.job.name, '지점2');
  hook.complete(hook.job, 'png', { width: 180, height: 76 });
  hook = mount.render(props);
  assert.equal(hook.getImage(props.items[1]).width, 180);
  assert.equal(files.has('cache/iambox-markers/previous/0.png'), false);
  hook = mount.render(props);
  assert.equal(hook.job.name, '지점1');
  mount.unmount();
  assert.equal(files.size, 0);
});
test('128개 pinned 캐시가 포화돼도 같은 PNG 생성 작업을 무한히 반복하지 않는다', () => {
  const { files, mount } = fixture();
  const props = { items: Array.from({ length: 130 }, (_, i) => point(i)) };
  mount.render(props);
  for (let i = 0; i < 130; i++) {
    const hook = mount.render(props);
    assert.ok(hook.job);
    hook.complete(hook.job, 'png', { width: 120, height: 76 });
    mount.render(props);
  }
  assert.equal(mount.render(props).job, null);
  assert.equal(files.size, 128);
  mount.unmount();
});

test('생성 실패와 빈 PNG는 캡션 fallback을 유지하고 같은 키를 재시도하지 않는다', () => {
  const { files, mount } = fixture();
  const props = { items: [point(1), point(2)] };
  mount.render(props);
  let hook = mount.render(props);
  hook.fail(hook.job);
  mount.render(props);
  hook = mount.render(props);
  assert.equal(hook.job.name, '지점2');
  hook.complete(hook.job, '', { width: 120, height: 76 });
  mount.render(props);
  hook = mount.render(props);
  assert.equal(hook.job, null);
  assert.equal(hook.getImage(props.items[0]), undefined);
  assert.equal(hook.getImage(props.items[1]), undefined);
  assert.equal(files.size, 1, '이전 세션은 PNG 생성에 성공할 때 정리한다');
  mount.unmount();
});
