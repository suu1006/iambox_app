const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

// Node는 네이티브 뷰를 마운트할 수 없으므로 호스트 뷰·React hook 경계만 대체한다.
// 화면과 모달, 공통 버튼·레이아웃의 실제 렌더 함수와 이벤트를 실행한다.
function mountDelivery(width = 390, fontScale = 1) {
  const slots = [];
  let cursor = 0;
  const react = {
    useState(initial) {
      const slot = cursor++;
      if (!(slot in slots)) slots[slot] = initial;
      return [slots[slot], value => { slots[slot] = value; }];
    },
    useRef(initial) {
      const slot = cursor++;
      return slots[slot] ??= { current: initial };
    },
  };
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename);
    const localRequire = createRequire(filename);
    const module = { exports: {} };
    const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(code, {
      module, exports: module.exports,
      require(id) {
        if (id === 'react') return react;
        if (id === 'react-native') return {
          Modal: 'Modal', Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View',
          useWindowDimensions: () => ({ width, height: 844, fontScale, scale: 1 }),
          AccessibilityInfo: { sendAccessibilityEvent() {} },
        };
        if (id.endsWith('.svg')) return { default: id };
        if (id === '../../components/layout') return {
          AppHeader: load(path.resolve(__dirname, '../components/layout/AppHeader.tsx')).AppHeader,
          ScreenContainer: load(path.resolve(__dirname, '../components/layout/ScreenContainer.tsx')).ScreenContainer,
        };
        if (id === '../../components/ui') return {
          ...load(path.resolve(__dirname, '../components/ui/Decorative.tsx')),
          ...load(path.resolve(__dirname, '../components/ui/Dialog.tsx')),
          ...load(path.resolve(__dirname, '../components/ui/Button.tsx')),
        };
        if (id === '@iambox/ui/native') return load(path.resolve(__dirname, '../../packages/ui/src/native/Button.tsx'));
        const tsxPath = id.startsWith('.') ? path.resolve(path.dirname(filename), `${id}.tsx`) : null;
        const resolved = tsxPath && existsSync(tsxPath) ? tsxPath : localRequire.resolve(id);
        if (/\.tsx?$/.test(resolved)) return load(resolved);
        return localRequire(id);
      },
    }, { filename });
    cache.set(filename, module.exports);
    return module.exports;
  }
  const { DeliveryContent } = load(path.resolve(__dirname, '../features/delivery/DeliveryContent.tsx'));
  function nodes(element) {
    if (!element || typeof element !== 'object') return [];
    if (typeof element.type === 'function') return nodes(element.type(element.props));
    return [element, ...[element.props?.children].flat(Infinity).flatMap(nodes)];
  }
  return () => {
    cursor = 0;
    return nodes(DeliveryContent());
  };
}

for (const [label, other] of [
  ['택배 이용하기', '이용 방법이 궁금하신가요?'],
  ['이용 방법이 궁금하신가요?', '택배 이용하기'],
]) {
  test(`${label}는 독립된 빈 팝업을 열고 닫기·뒤로가기로 복귀한다`, () => {
    const render = mountDelivery();
    const visibleModals = () => render().filter(node => node.type === 'Modal' && node.props.visible);
    const press = target => {
      const button = render().find(node => node.type === 'Pressable' && node.props.accessibilityLabel === target);
      assert.ok(button, `${target} 버튼이 있어야 한다`);
      button.props.onPress();
    };
    assert.equal(visibleModals().length, 0);
    press(label);
    const [modal] = visibleModals();
    assert.equal(visibleModals().length, 1);
    assert.equal(modal.props.transparent, true);
    assert.ok(render().some(node => node.props.pointerEvents === 'none'
      && node.props.accessibilityElementsHidden === true
      && node.props.importantForAccessibility === 'no-hide-descendants'));
    const dialogText = render().filter(node => node.type === 'Text' && node.props.children === '닫기');
    assert.equal(dialogText.length, 1, '팝업에는 닫기 버튼만 표시한다');
    modal.props.onRequestClose();
    assert.equal(visibleModals().length, 0);
    assert.ok(render().some(node => node.props.pointerEvents === 'auto'
      && node.props.accessibilityElementsHidden === false));
    press(label);
    render().find(node => node.type === 'Pressable' && node.props.accessibilityLabel?.endsWith(' 닫기')).props.onPress();
    assert.equal(visibleModals().length, 0);
    press(other);
    assert.equal(visibleModals().length, 1);
    assert.notEqual(visibleModals()[0].props.accessibilityLabel, modal.props.accessibilityLabel);
  });
}
