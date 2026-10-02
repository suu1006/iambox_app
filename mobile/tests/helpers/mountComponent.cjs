const { readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');

// Only native modules and React's lifecycle are replaced. Production callbacks stay real.
exports.mountComponent = function mountComponent(relativePath, exportName, props, stubs = {}, globals = {}) {
  const filename = path.resolve(__dirname, '../..', relativePath);
  const requireHere = createRequire(filename);
  const slots = [];
  let cursor = 0;
  let effects = [];
  const memo = (fn, deps) => {
    const i = cursor++;
    if (!slots[i] || deps.some((dep, j) => !Object.is(dep, slots[i].deps[j]))) slots[i] = { deps, value: fn() };
    return slots[i].value;
  };
  const react = {
    memo: (fn) => fn, forwardRef: (fn) => (props) => fn(props, props.ref),
    useMemo: memo, useCallback: (fn, deps) => memo(() => fn, deps),
    useRef: (initial) => slots[cursor++] ??= { current: initial },
    useState: (initial) => {
      const i = cursor++;
      if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial;
      return [slots[i], (next) => { slots[i] = typeof next === 'function' ? next(slots[i]) : next; }];
    },
    useEffect: (fn, deps) => {
      const i = cursor++;
      if (!slots[i] || deps.some((dep, j) => !Object.is(dep, slots[i].deps[j]))) effects.push(() => {
        slots[i]?.cleanup?.(); slots[i] = { deps, cleanup: fn() };
      });
    },
  };
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, {
    module, exports: module.exports, ...globals,
    require: (id) => id === 'react' ? react : id in stubs ? stubs[id] : requireHere(id),
  }, { filename });
  return {
    render(next = props) { props = next; cursor = 0; effects = []; const result = module.exports[exportName](props); effects.forEach((effect) => effect()); return result; },
    unmount() { slots.forEach((slot) => slot?.cleanup?.()); },
  };
};
exports.descendants = function descendants(node) {
  return !node || typeof node !== 'object' ? [] : [node, ...[node.props?.children].flat(Infinity).flatMap(exports.descendants)];
};
