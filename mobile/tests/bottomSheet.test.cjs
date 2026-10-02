const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

// Node cannot mount native views. Keep the wrapper's render/state transitions
// real and replace the native sheet and React's rendering boundary only.
function mountSheet(props) {
  const filename = path.resolve(__dirname, '../components/ui/BottomSheet.tsx');
  const localRequire = createRequire(filename);
  const slots = [];
  let cursor = 0;
  let dirty = false;
  const ref = { current: null };
  const react = {
    createContext: () => ({ Provider: 'Provider' }),
    forwardRef: (render) => render,
    useCallback: (callback) => callback,
    useMemo: (compute) => compute(),
    useRef: (initial) => {
      const slot = cursor++;
      return slots[slot] ??= { current: initial };
    },
    useState: (initial) => {
      const slot = cursor++;
      if (!(slot in slots)) slots[slot] = initial;
      return [slots[slot], (value) => {
        if (slots[slot] !== value) {
          slots[slot] = value;
          dirty = true;
        }
      }];
    },
    useImperativeHandle: (target, create) => { target.current = create(); },
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
        View: 'View', Pressable: 'Pressable',
        StyleSheet: { absoluteFill: {}, create: (styles) => styles },
      };
      if (id === '@gorhom/bottom-sheet') return { default: 'NativeSheet' };
      if (id === '../../utils/bottomSheetLayout') return localRequire(`${id}.ts`);
      return localRequire(id);
    },
  }, { filename });
  function render(nextProps = props) {
    props = nextProps;
    let tree;
    let attempts = 0;
    do {
      cursor = 0;
      dirty = false;
      tree = module.exports.BottomSheet(props, ref);
      assert.ok(++attempts < 10, '렌더링 중 상태 보정이 반복되어서는 안 된다');
    } while (dirty);
    const provider = tree.props.children;
    return { tree, context: provider.props.value, sheet: provider.props.children };
  }
  const initial = render();
  initial.tree.props.onLayout({ nativeEvent: { layout: { height: 600 } } });
  return { render };
}

test('펼친 시트의 스냅 개수가 줄면 렌더 인덱스와 접근성 상태를 보정하고 다시 늘려도 유지한다', () => {
  const props = { snapPoints: [100, 300, 500], children: null };
  const mounted = mountSheet(props);
  mounted.render().sheet.props.onChange(2);
  assert.equal(mounted.render().sheet.props.index, 2);

  const reduced = mounted.render({ ...props, snapPoints: [120] });
  assert.equal(reduced.sheet.props.index, 0, '새 스냅 배열에 없는 인덱스를 SDK에 전달하면 안 된다');
  assert.equal(reduced.context.index, 0, '손잡이 접근성 값도 현재 단계와 일치해야 한다');
  assert.equal(reduced.context.pointCount, 1);
  assert.equal(mounted.render(props).sheet.props.index, 0, '스냅을 늘려도 예전 단계로 되돌아가면 안 된다');
});
