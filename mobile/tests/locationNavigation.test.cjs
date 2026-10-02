const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const gangnam = {
  id: 'mock-gangnam', name: '강남점', address: '서울 강남구',
  latitude: 37.5, longitude: 127, priceFromKrw: 50000,
  priceBasis: '예시 시작 요금', availableSizes: ['M', 'L'],
};
const seongsu = { ...gangnam, id: 'mock-seongsu', name: '성수점', address: '서울 성동구', availableSizes: ['L'] };

function descendants(node) {
  if (!node || typeof node !== 'object') return [];
  return [node, ...[node.props?.children].flat(Infinity).flatMap(descendants)];
}

function renderSearchInput(props) {
  const filename = path.resolve(__dirname, '../features/locations/LocationSearchHeader.tsx');
  const localRequire = createRequire(filename);
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: (id) => {
      if (id === 'react-native') return {
        View: 'View', Text: 'Text', Pressable: 'Pressable', TextInput: 'TextInput',
        StyleSheet: { create: (styles) => styles },
        useWindowDimensions: () => ({ width: 390, fontScale: 1 }),
      };
      if (id.endsWith('.svg')) return { default: 'Icon' };
      return localRequire(id);
    },
  }, { filename });
  return descendants(module.exports.LocationSearchHeader(props)).find((node) => node.type === 'TextInput');
}

// Native views, the map SDK and React's render lifecycle cannot run in Node.
// Keep LocationsContent's JSX, callbacks, state and filtering implementation real.
function mountMap(initialProps) {
  const filename = path.resolve(__dirname, '../features/locations/LocationsContent.tsx');
  const localRequire = createRequire(filename);
  const slots = [];
  const listeners = new Set();
  const snaps = [];
  let cursor = 0;
  let props = initialProps;
  let pendingEffects = [];
  const react = {
    useCallback: (fn) => fn,
    useMemo: (fn, deps) => {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
        slots[index] = { deps, value: fn() };
      }
      return slots[index].value;
    },
    useRef: (value) => slots[cursor++] ??= { current: value },
    useState: (value) => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = value;
      return [slots[index], (next) => { slots[index] = typeof next === 'function' ? next(slots[index]) : next; }];
    },
    useEffect: (effect, deps) => {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
        pendingEffects.push(() => {
          previous?.cleanup?.();
          slots[index] = { deps, cleanup: effect() };
        });
      }
    },
  };
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: (id) => {
      if (id === 'react') return react;
      if (id === 'react-native') return {
        View: 'View', Text: 'Text', Pressable: 'Pressable',
        StyleSheet: { absoluteFill: {} }, Keyboard: { dismiss() {} },
        BackHandler: { addEventListener: (_event, fn) => {
          listeners.add(fn);
          return { remove: () => listeners.delete(fn) };
        } },
      };
      if (id === '../../components/ui') return { BottomSheet: 'BottomSheet', Button: 'Button' };
      if (id === '../../mocks/locations') return { mockLocations: [gangnam, seongsu] };
      if (id === '../../utils/filterLocations') return localRequire(`${id}.ts`);
      if (id.endsWith('.svg')) return { default: 'Icon' };
      if (id.startsWith('./')) return { [id.slice(2)]: id.slice(2) };
      return localRequire(id);
    },
  }, { filename });
  let tree;
  function render(nextProps = props) {
    props = nextProps;
    cursor = 0;
    pendingEffects = [];
    tree = module.exports.LocationsContent(props);
    const sheet = descendants(tree).find((node) => node.type === 'BottomSheet');
    sheet.props.ref.current = { snapToIndex: (index) => snaps.push(index) };
    pendingEffects.forEach((effect) => effect());
    return tree;
  }
  render();
  return {
    render, snaps,
    searchInput: () => renderSearchInput(descendants(tree).find((node) => node.type === 'LocationSearchHeader').props),
    find: (type) => descendants(tree).find((node) => node.type === type),
    back: () => [...listeners].reverse().some((fn) => fn() === true),
    listenerCount: () => listeners.size,
  };
}

for (const index of [0, 1, 2]) {
  test(`${index}단계에서 검색 입력을 선택하면 시트를 접고 검색어 변경은 다시 펼치지 않는다`, () => {
    const map = mountMap({ onBack() {}, onSelectLocation() {}, isFocused: true });
    map.find('BottomSheet').props.onChange(index);
    map.render();
    map.searchInput().props.onFocus?.({ nativeEvent: {} });
    assert.deepEqual(map.snaps, [0], '검색 입력 포커스 시 가장 낮은 시트 단계로 이동해야 한다');
    map.find('BottomSheet').props.onChange(0);
    map.render();
    map.searchInput().props.onChangeText('강남');
    map.render();
    assert.deepEqual(map.snaps, [0], '검색어 변경 시 접힌 시트를 다시 펼치면 안 된다');
    assert.deepEqual(Array.from(map.find('LocationList').props.locations, (location) => location.id), ['mock-gangnam']);
    assert.equal(map.searchInput().props.value, '강남');
  });
}

for (const source of ['LocationMap', 'LocationList']) {
  test(`${source}에서 선택하면 요약 없이 바로 상세 이동하고 시트 높이를 바꾸지 않는다`, () => {
    const selected = [];
    const map = mountMap({ onBack() {}, onSelectLocation: (location) => selected.push(location), isFocused: true });
    map.find(source).props.onSelectLocation(gangnam);
    map.render();
    assert.deepEqual(selected, [gangnam]);
    assert.deepEqual(map.snaps, [], '상세 진입 전에 중간 시트를 펼치면 안 된다');
    assert.equal(map.find('BranchSelection'), undefined);
    assert.equal(map.find('LocationList').props.selectedLocationId, 'mock-gangnam');
    assert.equal(map.find('LocationMap').props.selectedLocationId, 'mock-gangnam');
  });
}

test('상세 뒤의 지도는 Android 뒤로가기를 처리하지 않고 지도 복귀 시 다시 처리한다', () => {
  let exits = 0;
  const props = { onBack: () => exits++, onSelectLocation() {}, isFocused: true };
  const map = mountMap(props);
  assert.equal(map.listenerCount(), 1);
  map.render({ ...props, isFocused: false });
  assert.equal(map.back(), false);
  assert.equal(exits, 0);
  assert.equal(map.listenerCount(), 0);
  map.render(props);
  assert.equal(map.back(), true);
  assert.equal(exits, 1);
  assert.equal(map.listenerCount(), 1);
});

test('지도에서 Android 뒤로가기는 필터 닫기 → 시트 접기 → 이전 탭 복귀 순서다', () => {
  let exits = 0;
  const map = mountMap({ onBack: () => exits++, onSelectLocation() {}, isFocused: true });
  map.find('BottomSheet').props.onChange(2);
  map.find('LocationSearchHeader').props.onOpenFilter();
  map.render();
  assert.equal(map.back(), true);
  map.render();
  assert.equal(map.find('LocationFilterModal').props.visible, false);
  assert.equal(exits, 0);
  assert.deepEqual(map.snaps, []);
  map.back();
  assert.deepEqual(map.snaps, [0]);
  map.find('BottomSheet').props.onChange(0);
  map.render();
  map.back();
  assert.equal(exits, 1);
});

test('상세 진입과 복귀에도 검색·사이즈·시트·선택 상태를 유지한다', () => {
  let exits = 0;
  const props = { onBack: () => exits++, onSelectLocation() {}, isFocused: true };
  const map = mountMap(props);
  map.find('LocationSearchHeader').props.onChangeQuery('강남');
  map.find('LocationSearchHeader').props.onOpenFilter();
  map.render();
  map.find('LocationFilterModal').props.onToggleSize('M');
  map.render();
  map.find('LocationFilterModal').props.onApply();
  map.find('BottomSheet').props.onChange(2);
  map.find('LocationList').props.onSelectLocation(gangnam);
  map.render({ ...props, isFocused: false });
  map.render(props);
  assert.equal(map.find('LocationSearchHeader').props.query, '강남');
  assert.equal(map.find('LocationSearchHeader').props.filterCount, 1);
  assert.deepEqual(Array.from(map.find('LocationMap').props.locations, (location) => location.id), ['mock-gangnam']);
  assert.equal(map.find('LocationList').props.selectedLocationId, 'mock-gangnam');
  map.back();
  assert.equal(exits, 0, '유지된 펼침 상태에서는 이전 탭 이동 대신 시트를 접어야 한다');
  assert.deepEqual(map.snaps, [2, 0]);
});

function loadStack() {
  const filename = path.resolve(__dirname, '../navigation/LocationsStack.tsx');
  const localRequire = createRequire(filename);
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: (id) => {
      if (id === '@react-navigation/native') return { useIsFocused: () => true };
      if (id === '@react-navigation/native-stack') return {
        createNativeStackNavigator: () => ({ Navigator: 'Navigator', Screen: 'Screen' }),
      };
      if (id === 'react-native') return { View: 'View', Text: 'Text' };
      if (id === '../components/ui') return { Button: 'Button' };
      if (id === '../mocks/locations') return { mockLocations: [gangnam, seongsu] };
      if (id.startsWith('../features/')) return { [path.basename(id)]: path.basename(id) };
      return localRequire(id);
    },
  }, { filename });
  return module.exports.LocationsStack;
}

test('지도에서 상세 경로로 이동할 때 지점 ID만 전달하고 기존 탭 복귀 콜백을 유지한다', () => {
  const events = [];
  const tree = loadStack()({ onBack: () => events.push(['exit']) });
  const mapRoute = descendants(tree).find((node) => node.props?.name === 'LocationsMap');
  const navigation = { navigate: (...args) => events.push(args) };
  const wrapper = mapRoute.props.children({ navigation, route: { name: 'LocationsMap' } });
  const content = wrapper.type(wrapper.props);
  content.props.onSelectLocation(gangnam);
  content.props.onBack();
  assert.equal(events[0][0], 'LocationDetail');
  assert.deepEqual(JSON.parse(JSON.stringify(events[0][1])), { locationId: 'mock-gangnam' });
  assert.deepEqual(events[1], ['exit']);
});

test('상세 경로는 ID로 지점을 조회하고 뒤로가기는 Stack에 위임한다', () => {
  let backs = 0;
  const tree = loadStack()({ onBack() {} });
  const detailRoute = descendants(tree).find((node) => node.props?.name === 'LocationDetail');
  const content = detailRoute.props.component({
    navigation: { goBack: () => backs++ }, route: { params: { locationId: 'mock-seongsu' } },
  });
  assert.equal(content.props.location.name, '성수점');
  content.props.onBack();
  assert.equal(backs, 1);
});

test('존재하지 않는 지점 경로는 예외 없이 안내하고 지도 복귀 버튼을 제공한다', () => {
  let backs = 0;
  const tree = loadStack()({ onBack() {} });
  const detailRoute = descendants(tree).find((node) => node.props?.name === 'LocationDetail');
  const content = detailRoute.props.component({
    navigation: { goBack: () => backs++ }, route: { params: { locationId: 'unknown' } },
  });
  const nodes = descendants(content);
  assert.ok(nodes.some((node) => node.type === 'Text' && node.props.children === '지점을 찾을 수 없어요.'));
  nodes.find((node) => node.props?.label === '지도로 돌아가기').props.onPress();
  assert.equal(backs, 1);
});


test('필터로 선택 지점이 사라지면 강조를 해제하고 전체 결과 목록을 표시한다', () => {
  const map = mountMap({ onBack() {}, onSelectLocation() {}, isFocused: true });
  map.find('LocationMap').props.onSelectLocation(gangnam);
  map.render();
  map.find('LocationSearchHeader').props.onChangeQuery('성수');
  map.render(); map.render();
  assert.equal(map.find('BranchSelection'), undefined);
  assert.equal(map.find('LocationMap').props.selectedLocationId, undefined);
  assert.deepEqual(Array.from(map.find('LocationList').props.locations, (location) => location.id), ['mock-seongsu']);
});
test('클러스터 구성 목록에서 바로 상세로 이동하고 복귀할 목록을 유지한다', () => {
  const selected = [];
  const props = { onBack() {}, onSelectLocation: (location) => selected.push(location), isFocused: true };
  const map = mountMap(props);
  map.find('LocationMap').props.onSelectClusterLocations([seongsu]);
  map.render();
  assert.deepEqual(Array.from(map.find('LocationList').props.locations, (location) => location.id), ['mock-seongsu']);
  assert.deepEqual(map.snaps, [2]);
  map.find('LocationList').props.onSelectLocation(seongsu);
  map.render();
  map.render({ ...props, isFocused: false });
  map.render(props);
  assert.deepEqual(selected, [seongsu]);
  assert.deepEqual(map.snaps, [2], '상세 진입·복귀에서 구성 목록의 높이를 바꾸지 않는다');
  assert.equal(map.find('BranchSelection'), undefined);
  assert.deepEqual(Array.from(map.find('LocationList').props.locations, (location) => location.id), ['mock-seongsu']);
  descendants(map.find('LocationList').props.header).find((node) => node.type === 'Button').props.onPress();
  map.render();
  assert.equal(map.find('LocationList').props.locations.length, 2);
});
