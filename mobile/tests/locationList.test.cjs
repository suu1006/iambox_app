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

function loadComponent(filename, dimensions) {
  const localRequire = createRequire(filename);
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: (id) => {
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
      if (id === '../../utils/formatLocationPrice') return localRequire(`${id}.ts`);
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
