const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const transformerRequire = createRequire(require.resolve('react-native-svg-transformer'));
const { transform } = transformerRequire('@svgr/core');
const storageImageSource = readFileSync(path.resolve(__dirname, '../assets/imbox_storage_A-024.svg'), 'utf8')
  .match(/href="([^"]+)"/)[1];

function loadHome(width) {
  const filename = path.resolve(__dirname, '../features/home/HomeContent.tsx');
  const localRequire = createRequire(filename);
  function evaluate(source, file, resolve) {
    const module = { exports: {} };
    const code = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(code, { module, exports: module.exports, require: resolve }, { filename: file });
    return module.exports;
  }
  return evaluate(readFileSync(filename, 'utf8'), filename, (id) => {
    if (id === 'react-native') return {
      Image: 'Bitmap', Pressable: 'Pressable', Text: 'Text', View: 'View',
      useWindowDimensions: () => ({ width, fontScale: 1 }),
    };
    if (id === '../../components/layout') return { BrandLogo: 'BrandLogo', ScreenContainer: 'ScreenContainer' };
    if (id === '../../components/ui') return {
      Decorative: 'Decorative', InfoDialog: 'InfoDialog',
      useInfoDialog: () => ({ open() {}, dialogProps: {} }),
    };
    if (id === './EventBanner') return { EventBanner: 'EventBanner' };
    if (id.endsWith('.png')) return localRequire.resolve(id);
    if (id.endsWith('.svg')) {
      const file = localRequire.resolve(id);
      const jsx = transform.sync(readFileSync(file, 'utf8'), {
        native: true, plugins: ['@svgr/plugin-jsx'],
      });
      return evaluate(jsx, file, (dependency) => dependency === 'react-native-svg'
        ? new Proxy({ __esModule: true, default: 'Svg' }, { get: (target, key) => target[key] ?? key })
        : localRequire(dependency));
    }
    return localRequire(id);
  }).HomeContent;
}

function nodes(element) {
  if (!element || typeof element !== 'object') return [];
  if (typeof element.type === 'function') return nodes(element.type(element.props));
  return [element, ...[element.props?.children].flat(Infinity).flatMap(nodes)];
}

for (const width of [320, 390]) {
  test(`${width}px 홈 서비스 그림은 첫 렌더와 재진입 시 지정한 SVG로 표시한다`, () => {
    const HomeContent = loadHome(width);
    for (let entry = 0; entry < 2; entry++) {
      const tree = HomeContent({ onLocationsPress() {} });
      for (const label of ['물품 보관', '택배요청', '사전방문']) {
        const card = nodes(tree).find((node) => node.props?.accessibilityLabel === label);
        assert.ok(card, `${label} 카드가 있어야 한다`);
        const illustration = nodes(card).find((node) => node.type === 'Decorative');
        const drawing = nodes(illustration);
        assert.equal(drawing.filter((node) => node.type === 'Bitmap').length, 0,
          `${label}은 별도 PNG 파일을 로딩하지 않는다`);
        if (label === '물품 보관') {
          const images = drawing.filter((node) => node.type === 'Image');
          assert.equal(images.length, 1, '물품 보관은 출입 QR의 스토리지 SVG 내장 이미지를 표시한다');
          assert.ok(images[0].props.href === storageImageSource, '출입 QR과 같은 스토리지 이미지를 사용해야 한다');
          continue;
        }
        assert.equal(drawing.filter((node) => ['Bitmap', 'Image'].includes(node.type)).length, 0,
          `${label}은 비동기 PNG 로딩이나 SVG 내장 이미지에 의존하면 안 된다`);
        assert.ok(drawing.some((node) => node.type === 'Path'), `${label}은 첫 렌더에서 벡터 경로를 제공해야 한다`);
      }
    }
  });
}
