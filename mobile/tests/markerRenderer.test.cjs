const assert = require('node:assert/strict');
const { test } = require('node:test');
const { mountComponent, descendants } = require('./helpers/mountComponent.cjs');

test('실측 완료 후 기본 SVG 배율로 한 번만 export하고 취소된 결과는 적용하지 않는다', () => {
  const frames = [];
  const timers = [];
  const exported = [];
  const completed = [];
  const props = { request: { key: 'a', kind: 'price', name: '긴 지점 이름', price: '39,000원~', selected: false, scale: 3 }, onComplete: (...args) => completed.push(args), onFailure() {} };
  const mount = mountComponent('features/locations/MarkerImageRenderer.tsx', 'MarkerImageRenderer', props, {
    'react-native': { View: 'View', Text: 'Text' }, './MarkerArtwork': { MarkerArtwork: 'Art' },
    '../../utils/markerArtworkLayout': require('../utils/markerArtworkLayout.ts'),
  }, {
    requestAnimationFrame: (fn) => { frames.push(fn); return frames.length; }, cancelAnimationFrame() {},
    setTimeout: (fn) => { timers.push(fn); return timers.length; }, clearTimeout() {},
  });
  let tree = mount.render();
  assert.equal(frames.length, 0, '실제 텍스트 크기 측정 전에는 내보내지 않는다');
  const texts = descendants(tree).filter((node) => node.type === 'Text');
  assert.equal(texts[0].props.numberOfLines, undefined, '원본 줄 수를 측정해 SVG에서 두 줄과 말줄임을 결정한다');
  texts[0].props.onTextLayout({ nativeEvent: { lines: [{ text: '긴 지점 이름', width: 180 }] } });
  texts[1].props.onTextLayout({ nativeEvent: { lines: [{ text: '39,000원~', width: 100 }] } });
  tree = mount.render();
  descendants(tree).find((node) => node.type === 'Art').props.ref.current = { toDataURL: (...args) => exported.push(args) };
  frames.shift()(); frames.shift()();
  assert.equal(exported.length, 1);
  assert.equal(exported[0].length, 1, 'iOS에 추가 canvas dimensions를 전달하지 않는다');
  mount.unmount();
  exported[0][0]('late-png');
  assert.equal(completed.length, 0);
  assert.equal(tree.props.style.zIndex, -1, 'Android SVG 초기 draw가 가능하도록 지도 뒤에 둔다');
});
