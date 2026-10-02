const { readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Node는 TSX·RN host를 직접 실행하지 못한다. JSX와 공통 규칙은 실제 코드를
// 변환하고 네이티브 host만 대체한다. 웹에서 native를 읽으면 즉시 실패한다.
function loadUI(entry, tokensEntry) {
  const fromPackage = createRequire(path.resolve(__dirname, '../package.json'));
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const localRequire = createRequire(filename);
    const module = { exports: {} };
    cache.set(filename, module);
    const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(code, {
      module, exports: module.exports,
      require(id) {
        if (id === '@iambox/design-tokens' && tokensEntry) return require(tokensEntry);
        if (id === 'react-native') {
          if (entry === 'web') throw new Error('웹 진입점에서 native 모듈을 로드했다');
          return { Pressable: 'Pressable', Text: 'Text', View: 'View' };
        }
        if (id === 'react-native-svg') throw new Error('SVG는 타입 의존성이어야 한다');
        const resolved = localRequire.resolve(id);
        return /\.[cm]?tsx?$/.test(resolved) ? load(resolved) : localRequire(id);
      },
    }, { filename });
    return module.exports;
  }
  return load(fromPackage.resolve(`@iambox/ui/${entry}`));
}
module.exports = { loadUI };
