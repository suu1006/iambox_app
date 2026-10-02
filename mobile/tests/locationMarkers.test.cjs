const assert = require('node:assert/strict');
const { test } = require('node:test');
const { mountComponent, descendants } = require('./helpers/mountComponent.cjs');
const utils = require('../utils/branchClusters.ts');
const { MarkerImageCache } = require('../utils/markerImageCache.ts');
const point = (id, latitude = 37.5, longitude = 127) => ({ id, name: `${id}점`, latitude, longitude, address: '서울', priceFromKrw: 39000 });
const native = { View: 'View', StyleSheet: { create: (styles) => styles } };

function mapFixture(props) {
  const animations = [];
  let active = 0;
  let maxActive = 0;
  const mapRef = { animateCameraTo: (camera) => animations.push(camera), screenToCoordinate: async ({ screenX, screenY }) => {
    active++; maxActive = Math.max(active, maxActive);
    await new Promise((resolve) => setImmediate(resolve)); active--;
    return { isValid: true, latitude: screenY ? 37 : 38, longitude: screenX ? 128 : 126 };
  } };
  let previous;
  let model;
  const mount = mountComponent('features/locations/NaverLocationMap.tsx', 'NaverLocationMap', props, {
    'react-native': native,
    '@mj-studio/react-native-naver-map': { NaverMapView: 'Map' },
    './LocationMarker': { LocationMarker: 'Point' }, './ClusterMarker': { ClusterMarker: 'Cluster' },
    './MarkerImageRenderer': { MarkerImageRenderer: 'Renderer' },
    './useMarkerImages': { useMarkerImages: () => ({ job: null, getImage: () => undefined }) },
    './useBranchClusters': {
      useBranchClusters: ({ locations, bbox, zoom }) => { if (previous !== locations) { previous = locations; model = utils.createBranchClusterIndex(locations); } return { model, items: utils.getBranchClusters(model, bbox, zoom) }; },
      useMarkerTransition: ({ items }) => items.map((item, i) => ({ item, key: String(i), alpha: 1 })),
    },
    '../../utils/branchClusters': utils,
  });
  function render(next = props) {
    props = next;
    const tree = mount.render(props);
    const map = descendants(tree).find((node) => node.type === 'Map');
    map.props.ref.current = mapRef;
    return { tree, map };
  }
  return { render, animations, maxActive: () => maxActive, unmount: () => mount.unmount() };
}

test('초기 지도/layout 순서와 순차 모서리 변환으로 화면 내 결과만 표시한다', async () => {
  const fixture = mapFixture({ locations: [point('inside'), point('outside', 35)], onSelectLocation() {} });
  let view = fixture.render();
  await view.map.props.onInitialized();
  view.tree.props.onLayout({ nativeEvent: { layout: { width: 390, height: 600 } } });
  fixture.render();
  for (let i = 0; i < 8; i++) await new Promise((resolve) => setImmediate(resolve));
  view = fixture.render();
  assert.equal(fixture.maxActive(), 1);
  assert.deepEqual(descendants(view.map).filter((node) => node.type === 'Point').map((node) => node.props.location.id), ['inside']);
  fixture.unmount();
});

test('idle 결과의 Cluster와 Point를 동시에 표시하며 탭은 expansion zoom으로 이동한다', async () => {
  const fixture = mapFixture({ locations: [point('a'), point('b', 37.51, 127.01), point('far', 38, 128)], onSelectLocation() {} });
  let view = fixture.render();
  await view.map.props.onInitialized();
  view.map.props.onCameraIdle({ zoom: 10, region: { latitude: 36, longitude: 126, latitudeDelta: 3, longitudeDelta: 3 } });
  view = fixture.render();
  const cluster = descendants(view.map).find((node) => node.type === 'Cluster');
  assert.equal(cluster.props.cluster.count, 2);
  assert.equal(descendants(view.map).filter((node) => node.type === 'Point').length, 1);
  cluster.props.onExpand(cluster.props.cluster);
  assert.ok(fixture.animations[0].zoom > 10);
  assert.equal(fixture.animations[0].duration, 450);
  fixture.unmount();
});

test('모서리 변환 도중 화면 크기가 바뀌어도 SDK 요청은 하나씩만 보낸다', async () => {
  const fixture = mapFixture({ locations: [point('inside')], onSelectLocation() {} });
  let view = fixture.render();
  view.tree.props.onLayout({ nativeEvent: { layout: { width: 390, height: 600 } } });
  view = fixture.render();
  const pending = view.map.props.onInitialized();
  view.tree.props.onLayout({ nativeEvent: { layout: { width: 500, height: 700 } } });
  fixture.render();
  await pending;
  for (let i = 0; i < 10; i++) await new Promise((resolve) => setImmediate(resolve));
  assert.equal(fixture.maxActive(), 1);
  fixture.unmount();
});

test('선택 지점은 카메라를 시트 위쪽으로 이동하고 최대 확대 동일 좌표는 시트 목록을 전달한다', async () => {
  const locations = [point('a'), point('b')];
  let members;
  const props = { locations, onSelectLocation() {}, onSelectClusterLocations: (value) => { members = value; } };
  const fixture = mapFixture(props);
  let view = fixture.render();
  await view.map.props.onInitialized();
  fixture.render({ ...props, selectedLocationId: 'b' });
  assert.equal(fixture.animations.at(-1).pivot.y, 0.35);
  view.map.props.onCameraIdle({ zoom: 21, region: { latitude: 37.4, longitude: 126.9, latitudeDelta: 0.2, longitudeDelta: 0.2 } });
  view = fixture.render();
  const cluster = descendants(view.map).find((node) => node.type === 'Cluster');
  cluster.props.onExpand(cluster.props.cluster);
  assert.deepEqual(Array.from(members, (location) => location.id).sort(), ['a', 'b']);
  fixture.unmount();
});

test('가격 마커는 자식 View 없이 캐시 실제 크기를 전달하며 fallback도 이름·가격·터치가 있다', () => {
  const selected = [];
  const props = { location: point('a'), selected: false, image: { uri: 'file:///marker.png', width: 230, height: 92 }, onSelect: (location) => selected.push(location), alpha: 0.5 };
  const mount = mountComponent('features/locations/LocationMarker.tsx', 'LocationMarker', props, {
    '@mj-studio/react-native-naver-map': { NaverMapMarkerOverlay: 'Marker' },
    '../../utils/formatLocationPrice': { formatLocationPrice: (price) => `${price}원~` },
  });
  const cached = mount.render();
  assert.equal(cached.props.children, undefined);
  assert.equal(cached.props.width, 230);
  assert.equal(cached.props.height, 92);
  assert.equal(cached.props.alpha, 0.5);
  cached.props.onTap(); assert.equal(selected[0], props.location);
  const fallback = mount.render({ ...props, image: undefined });
  assert.equal(fallback.props.caption.text, 'a점');
  assert.equal(fallback.props.subCaption.text, '39000원~');
});

test('이미 선택한 마커를 다시 누르면 이동한 카메라도 해당 지점으로 돌아온다', async () => {
  const locations = [point('a')];
  let selected;
  const fixture = mapFixture({ locations, selectedLocationId: 'a', onSelectLocation: (location) => { selected = location.id; } });
  let view = fixture.render();
  await view.map.props.onInitialized();
  view.map.props.onCameraIdle({ zoom: 18, region: { latitude: 37.4, longitude: 126.9, latitudeDelta: 0.2, longitudeDelta: 0.2 } });
  view = fixture.render();
  const before = fixture.animations.length;
  const marker = descendants(view.map).find((node) => node.type === 'Point');
  marker.props.onSelect(locations[0]);
  assert.equal(fixture.animations.length, before + 1);
  assert.equal(fixture.animations.at(-1).zoom, 18);
  assert.equal(selected, 'a');
  fixture.unmount();
});

test('LRU 캐시는 pinned 이미지와 최근 사용 이미지를 유지하고 포화 시 파일을 해제한다', () => {
  const released = [];
  const cache = new MarkerImageCache(2);
  const put = (key) => cache.put(key, { uri: key, width: 120, height: 76, release: () => released.push(key) });
  put('a'); put('b'); cache.get('a'); put('c');
  assert.equal(cache.get('b'), undefined);
  cache.setPinnedKeys(new Set(['a', 'c']));
  assert.equal(put('d'), false);
  assert.deepEqual(released, ['b', 'd']);
  cache.clear(); assert.equal(cache.size, 0);
});
