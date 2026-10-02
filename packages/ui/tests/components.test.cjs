const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadUI } = require('./loadUI.cjs');

function ui(entry) {
  let exports;
  assert.doesNotThrow(() => { exports = loadUI(entry); }, `${entry} 공개 진입점이 실제 렌더러를 제공해야 한다`);
  return exports;
}
const children = node => [node.props.children].flat(Infinity).filter(Boolean);

// 누락된 기본 규칙, 접근성 전달, 아이콘 처리, 플랫폼 혼합을 잡는 경계 테스트.
test('native 기본 버튼은 기존 크기·라벨·접근성·아이콘을 유지한다', () => {
  const { Button } = ui('native');
  const Icon = () => null;
  const tree = Button({ label: '보관하기', LeadingIcon: Icon, TrailingIcon: Icon });
  assert.equal(tree.props.accessibilityRole, 'button');
  assert.equal(tree.props.className, 'min-h-[48px] flex-row items-center justify-center py-3 gap-content rounded-button bg-primary px-4 active:opacity-70 ');
  const [leading, label, trailing] = children(tree);
  assert.equal(label.props.children, '보관하기');
  assert.equal(label.props.className, 'flex-shrink text-button text-onPrimary');
  assert.equal(leading.props.width, 24); assert.equal(trailing.props.width, 20);
  assert.equal(leading.props.color, '#FFFFFF'); assert.equal(leading.props.accessible, false);
  assert.equal(trailing.props.accessible, false);
});

test('native 링크 버튼은 호출부의 이벤트·비활성·style·접근성 확장을 전달한다', () => {
  const { Button } = ui('native');
  const events = []; const event = { nativeEvent: { pageX: 10 } }; const style = { marginTop: 8 };
  const tree = Button({ label: '이용 내역', variant: 'link', className: 'flex-1', style,
    disabled: true, accessibilityLabel: '이용 내역 보기', accessibilityHint: '예시 안내 열기',
    onPress: e => events.push(e) });
  assert.ok(tree.props.className.endsWith('gap-1 active:opacity-60 flex-1'));
  assert.equal(tree.props.style, style); assert.equal(tree.props.disabled, true);
  assert.equal(tree.props.accessibilityLabel, '이용 내역 보기');
  assert.equal(tree.props.accessibilityHint, '예시 안내 열기');
  tree.props.onPress(event); assert.equal(events[0], event);
  assert.equal(children(tree)[0].props.className, 'flex-shrink text-button-link text-primary');
});

const tones = [
  ['solid', 'bg-primary', 'text-onPrimary', '#844CCF', '#FFFFFF'],
  ['soft', 'bg-primary-200', 'text-primary', '#E5D5F7', '#844CCF'],
  ['neutral', 'bg-divider', 'text-muted', '#E8E9EF', '#667085'],
];
const sizes = [
  ['default', 'rounded-pill px-3 py-1', 'text-badge', 12, 18],
  ['compact', 'w-5 items-center rounded-badge py-0.5', 'text-center text-badge-compact', 11, 16],
];
for (const [tone, bg, fg, backgroundColor, color] of tones) {
  for (const [size, container, label, fontSize, lineHeight] of sizes) {
    test(`${tone}/${size} 배지는 양쪽 렌더러에서 색상·크기·라벨을 표시한다`, () => {
      const native = ui('native').Badge({ label: 'M', tone, size });
      assert.equal(native.props.className, `self-start ${container} ${bg}`);
      assert.equal(children(native)[0].props.className, `${label} ${fg}`);
      assert.equal(children(native)[0].props.children, 'M');
      const web = ui('web').Badge({ label: 'M', tone, size });
      assert.equal(web.type, 'span'); assert.equal(web.props.children, 'M');
      assert.equal(web.props.style.backgroundColor, backgroundColor);
      assert.equal(web.props.style.color, color); assert.equal(web.props.style.fontSize, fontSize);
      assert.equal(web.props.style.lineHeight, `${lineHeight}px`);
      assert.equal(web.props.style.borderRadius, size === 'compact' ? 4 : 9999);
      assert.equal(web.props.style.width, size === 'compact' ? 20 : undefined);
    });
  }
}

test('배지 기본값은 solid/default다', () => {
  const native = ui('native').Badge({ label: '이용 중' });
  assert.equal(native.props.className, 'self-start rounded-pill px-3 py-1 bg-primary');
  const web = ui('web').Badge({ label: '이용 중' });
  assert.equal(web.props.style.backgroundColor, '#844CCF');
  assert.equal(web.props.style.fontSize, 12);
});

test('web 기본 버튼은 submit을 피하고 공통 이름·disabled·장식 아이콘을 연결한다', () => {
  const { Button } = ui('web'); const Icon = () => null;
  const tree = Button({ label: '보관하기', disabled: true, accessibilityLabel: '보관 신청',
    LeadingIcon: Icon, TrailingIcon: Icon });
  assert.equal(tree.type, 'button'); assert.equal(tree.props.type, 'button');
  assert.equal(tree.props.disabled, true); assert.equal(tree.props['aria-label'], '보관 신청');
  assert.equal(tree.props.style.minHeight, 48); assert.equal(tree.props.style.backgroundColor, '#844CCF');
  const [leading, label, trailing] = children(tree);
  assert.equal(label.props.children, '보관하기'); assert.equal(label.props.style.fontSize, 16);
  assert.equal(leading.props.width, 24); assert.equal(trailing.props.width, 20);
  assert.equal(leading.props['aria-hidden'], true); assert.equal(leading.props.focusable, false);
  assert.equal(trailing.props['aria-hidden'], true);
});

test('web 링크 버튼은 HTML 속성·이벤트·스타일 확장을 유지하고 native 모듈을 읽지 않는다', () => {
  const { Button } = ui('web'); const events = []; const event = { type: 'click' };
  const tree = Button({ label: '확인', variant: 'link', className: 'wide', type: 'submit',
    'aria-describedby': 'hint', style: { marginTop: 8 }, onClick: e => events.push(e) });
  assert.equal(tree.props.type, 'submit'); assert.ok(tree.props.className.includes('wide'));
  assert.equal(tree.props['aria-describedby'], 'hint'); assert.equal(tree.props.style.marginTop, 8);
  assert.equal(tree.props.style.backgroundColor, 'transparent'); assert.equal(tree.props.style.gap, 4);
  assert.equal(tree.props.style['--iambox-pressed-opacity'], 0.6);
  tree.props.onClick(event); assert.equal(events[0], event);
  assert.equal(children(tree)[0].props.style.fontSize, 14);
});

test('web primary 버튼의 focus 색상은 흰 글자색과 분리되어 흰 표면에서 보인다', () => {
  const { readFileSync } = require('node:fs');
  const { createRequire } = require('node:module');
  // 이미 선언된 NativeWind 개발 환경의 PostCSS로 실제 소비 CSS를 파싱한다.
  const postcss = createRequire(require.resolve('nativewind/package.json'))('postcss');
  const { Button } = ui('web');
  const tree = Button({ label: '확인' });
  const css = postcss.parse(readFileSync(require.resolve('@iambox/ui/web.css'), 'utf8'));
  let outline;
  css.walkRules('.iambox-ui-button:focus-visible', rule => {
    rule.walkDecls('outline', decl => { outline = decl.value; });
  });
  assert.ok(outline, '키보드 포커스 외곽선 규칙이 필요하다');
  const variable = /var\((--[a-z-]+)\)/.exec(outline)?.[1];
  const outlineColor = variable ? tree.props.style[variable]
    : outline.includes('currentColor') ? tree.props.style.color : undefined;
  assert.equal(outlineColor, '#844CCF', 'primary 글자색이 흰색이어도 포커스는 브랜드 색을 사용한다');
  assert.notEqual(outlineColor, '#FFFFFF', '기본 흰 표면에서 링이 사라지면 안 된다');
});
