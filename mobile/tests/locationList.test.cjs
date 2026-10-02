const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

// Node cannot load RN's native views or Metro SVG imports. Keep the component's
// JSX, conditions and event handlers real; replace only those native boundaries.
function loadList(dimensions = { width: 390, height: 844, fontScale: 1, scale: 3 }) {
  const filename = path.resolve(__dirname, '../features/locations/LocationList.tsx');
  return loadComponent(filename, dimensions).LocationList;
}

function loadComponent(filename, dimensions, overrides = {}) {
  const localRequire = createRequire(filename);
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: (id) => {
      if (Object.hasOwn(overrides, id)) return overrides[id];
      if (id === '@iambox/ui/native' || (id.startsWith('.') && /\.tsx?$/.test(id))) {
        return loadComponent(localRequire.resolve(id), dimensions);
      }
      if (id === 'react-native') return {
        Image: 'Image', Pressable: 'Pressable', Text: 'Text', View: 'View',
        useWindowDimensions: () => dimensions,
      };
      if (id === '../../components/ui') return {
        BottomSheetFlatList: 'FlatList',
        Badge: 'Badge',
        Button: loadComponent(path.resolve(__dirname, '../components/ui/Button.tsx'), dimensions).Button,
      };
      if (id.endsWith('.svg')) return { default: 'Icon' };
      if (id === '../../utils/formatLocationPrice' || id === '../../utils/filterLocations') return localRequire(`${id}.ts`);
      return localRequire(id);
    },
  }, { filename });
  return module.exports;
}

function nodes(element) {
  if (!element || typeof element !== 'object') return [];
  return [element, ...[element.props?.children].flat(Infinity).flatMap(nodes)];
}

function textOf(element) {
  if (typeof element === 'string' || typeof element === 'number') return String(element);
  if (!element || typeof element !== 'object') return '';
  return [element?.props?.children].flat(Infinity).map(textOf).join('');
}

const location = {
  id: 'example-list-location', name: '긴 이름의 예시 지점',
  latitude: 37.5, longitude: 127, address: '서울시 예시 주소 지하 1층',
  priceFromKrw: 55825, priceBasis: '예시 시작 요금',
  photoSource: { uri: 'https://example.invalid/storage.png' }, badge: '예시 시설',
};

test('접힘에서 펼침으로 이동하고 다시 접어도 목록의 시각·터치·접근성 노출을 유지한다', () => {
  const states = [];
  let cursor = 0;
  const LocationList = loadList();
  const { LocationsContent } = loadComponent(
    path.resolve(__dirname, '../features/locations/LocationsContent.tsx'),
    undefined,
    {
      react: {
        useState: (initial) => {
          const slot = cursor++;
          if (!(slot in states)) states[slot] = initial;
          return [states[slot], (value) => { states[slot] = value; }];
        },
        useRef: () => ({ current: null }),
        useMemo: (compute) => compute(),
        useCallback: (callback) => callback,
        useEffect() {},
      },
      '../../components/ui': { BottomSheet: 'Sheet' },
      '../../mocks/locations': { mockLocations: [location] },
      './LocationList': { LocationList },
      './LocationMap': { LocationMap: 'Map' },
      './LocationDetail': { LocationDetail: 'Detail' },
      './LocationSearchHeader': { LocationSearchHeader: 'Search' },
      './LocationFilterModal': { LocationFilterModal: 'Filter' },
    },
  );
  for (const nextIndex of [2, 0]) {
    cursor = 0;
    const tree = LocationsContent({ onBack() {} });
    const sheet = nodes(tree).find((node) => node.type === 'Sheet');
    const listElement = nodes(tree).find((node) => node.type === LocationList);
    const list = LocationList(listElement.props);
    assert.notEqual(list.props.style?.opacity, 0, '접힌 상태와 이동 중에도 목록을 투명하게 숨기면 안 된다');
    assert.notEqual(list.props.pointerEvents, 'none');
    assert.notEqual(list.props.accessibilityElementsHidden, true);
    assert.notEqual(list.props.importantForAccessibility, 'no-hide-descendants');
    assert.equal(list.props.data[0], location);
    sheet.props.onChange(nextIndex);
  }
  cursor = 0;
  const tree = LocationsContent({ onBack() {} });
  const listElement = nodes(tree).find((node) => node.type === LocationList);
  assert.notEqual(LocationList(listElement.props).props.style?.opacity, 0, '다시 접은 뒤에도 행이 유지되어야 한다');
});

test('큰 목록은 초기 10~20개와 제한된 배치로 렌더링하고 마지막 지점까지 가상 목록에 전달한다', () => {
  const LocationList = loadList();
  const locations = Array.from({ length: 100 }, (_, index) => ({ ...location, id: `location-${index}` }));
  const list = LocationList({ locations, onSelectLocation() {} });
  assert.ok(list.props.initialNumToRender >= 10 && list.props.initialNumToRender <= 20);
  assert.ok(list.props.maxToRenderPerBatch > 0 && list.props.maxToRenderPerBatch <= 20);
  assert.ok(list.props.windowSize > 1 && list.props.windowSize <= 5);
  assert.equal(list.props.data.length, 100, '초기 렌더링 개수로 데이터를 잘라 나머지 지점을 누락하면 안 된다');
  assert.equal(list.props.keyExtractor(list.props.data[99]), 'location-99');
});

test('선택한 지점만 강조하고 행 선택에 해당 지점을 전달하며 별도 더보기 버튼은 표시하지 않는다', () => {
  const LocationList = loadList();
  const events = [];
  const list = LocationList({
    locations: [location], selectedLocationId: location.id,
    onSelectLocation: (item) => events.push(['select', item]),
  });
  const row = list.props.renderItem({ item: location, index: 0 });
  const controls = nodes(row);
  const select = controls.find((node) => node.props.accessibilityState?.selected === true);
  assert.ok(select, '선택 상태를 접근성에 제공해야 한다');
  select.props.onPress();
  assert.equal(textOf(row).includes('더보기'), false);
  assert.equal(controls.some((node) => node.props.label === '지금 예약하기'), false);
  assert.deepEqual(events, [['select', location]]);
  assert.equal(list.props.keyExtractor(location), location.id);
  assert.equal(list.props.extraData, location.id);
  assert.ok(textOf(row).includes('55,825원~'));
  const photo = controls.find((node) => node.type === 'Image');
  assert.equal(photo.props.source, location.photoSource);
  assert.equal(photo.props.resizeMode, 'cover', '가로 사진이 썸네일을 빈 여백 없이 채워야 한다');
  const other = list.props.renderItem({ item: { ...location, id: 'other' }, index: 1 });
  assert.ok(nodes(other).some((node) => node.props.accessibilityState?.selected === false));
});

test('주소 아래에 이용 가능한 사이즈를 표시하고 그 아래 최저가를 표시한다', () => {
  const LocationList = loadList();
  const item = { ...location, availableSizes: ['M', 'L'] };
  const list = LocationList({ locations: [item], onSelectLocation() {} });
  const row = list.props.renderItem({ item, index: 0 });
  const text = textOf(row);
  assert.ok(text.indexOf(item.address) < text.indexOf('이용가능'));
  assert.ok(text.indexOf('이용가능') < text.indexOf('최저가'));
  assert.deepEqual(nodes(row).filter(node => node.type === 'Badge').map(node => node.props.label), ['M', 'L']);
  const withoutSizes = list.props.renderItem({ item: location, index: 1 });
  assert.equal(textOf(withoutSizes).includes('이용가능'), false);
});

test('사진·배지·가격이 없는 지점도 문의 요금과 이미지 안내를 표시한다', () => {
  const LocationList = loadList();
  const missing = { ...location, photoSource: undefined, badge: undefined, priceFromKrw: null };
  const list = LocationList({ locations: [missing], onSelectLocation() {} });
  const row = list.props.renderItem({ item: missing, index: 0 });
  assert.ok(textOf(row).includes('이미지 준비 중'));
  assert.ok(textOf(row).includes('요금 문의'));
  assert.equal(nodes(row).filter((node) => node.type === 'Image').length, 0);
  assert.equal(textOf(row).includes('0원'), false);
  assert.equal(textOf(row).includes('예시 시설'), false);
});

test('빈 목록에는 안내를 제공하고 큰 글자에서는 고정 행 높이를 사용하지 않는다', () => {
  const LocationList = loadList({ width: 320, height: 700, fontScale: 1.6, scale: 2 });
  const list = LocationList({ locations: [], onSelectLocation() {} });
  assert.ok(textOf(list.props.ListEmptyComponent).includes('표시할 지점이 없습니다'));
  const row = list.props.renderItem({ item: location, index: 0 });
  assert.equal(row.props.style?.height, undefined);
  assert.ok(textOf(row).includes(location.address));
  assert.equal(nodes(row).find((node) => textOf(node) === location.address)?.props.numberOfLines, undefined);
});
