const assert = require('node:assert/strict');
const { test } = require('node:test');
const { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const fromMobile = createRequire(path.resolve(__dirname, '../../../mobile/package.json'));
const postcss = createRequire(fromMobile.resolve('nativewind/package.json'))('postcss');
const tailwind = fromMobile('tailwindcss');
const { loadUI } = require('./loadUI.cjs');

function tokenEntry(name) {
  let resolved;
  assert.doesNotThrow(() => { resolved = require.resolve(name); }, `${name} 공개 진입점을 제공해야 한다`);
  return resolved;
}
async function declarations(theme, classes) {
  const result = await postcss([tailwind({ content: [{ raw: classes }], theme: { extend: theme } })])
    .process('@tailwind utilities;', { from: undefined });
  const rules = {};
  result.root.walkRules(rule => {
    const values = {};
    rule.walkDecls(decl => { values[decl.prop] = decl.value; });
    rules[rule.selector] = values;
  });
  return rules;
}

// 토큰을 읽지 않거나 CSS 단위를 잘못 변환하면 사용자에게 보이는 스타일이 달라진다.
test('Tailwind 소비자는 용도별 타이포그래피·간격·모서리를 실제 CSS로 생성한다', async () => {
  const theme = require(tokenEntry('@iambox/design-tokens/tailwind'));
  const css = await declarations(theme, 'text-body text-caption text-section-title px-screen gap-content rounded-card rounded-dialog');
  assert.deepEqual(css['.text-body'], { 'font-size': '16px', 'line-height': '24px' });
  assert.deepEqual(css['.text-caption'], { 'font-size': '12px', 'line-height': '18px' });
  assert.deepEqual(css['.text-section-title'], { 'font-size': '20px', 'line-height': '28px', 'font-weight': '700' });
  assert.deepEqual(css['.px-screen'], { 'padding-left': '24px', 'padding-right': '24px' });
  assert.equal(css['.gap-content'].gap, '8px');
  assert.equal(css['.rounded-card']['border-radius'], '20px');
  assert.equal(css['.rounded-dialog']['border-radius'], '24px');
});

// 실제 원본을 바꿔 어댑터를 다시 읽는다. 별칭을 복제 상수로 두면 이 테스트가 실패한다.
test('원본 변경은 숫자 소비자와 Tailwind 별칭·그림자에 함께 전파된다', async () => {
  const entry = tokenEntry('@iambox/design-tokens');
  const fixture = mkdtempSync(path.join(tmpdir(), 'iambox-token-fixture-'));
  try {
    cpSync(path.dirname(entry), fixture, { recursive: true });
    function change(name, update) {
      const file = path.join(fixture, `${name}.json`);
      const data = JSON.parse(readFileSync(file, 'utf8'));
      update(data);
      writeFileSync(file, JSON.stringify(data));
    }
    change('spacing', value => { value.scale['6'] = 26; value.scale['3'] = 13; value.scale['12'] = 52; });
    change('radii', value => { value.scale['20'] = 21; value.scale['12'] = 15; });
    change('typography', value => {
      value.fontSize['16'] = 19;
      value.lineHeight['24'] = 27;
      value.styles.button.fontWeight = 'medium';
      value.styles.button.letterSpacing = 'tight';
      value.styles['badge-compact'].fontWeight = 'medium';
    });
    change('colors', value => { value.primary.DEFAULT = '#123456'; });
    change('shadows', value => { value.qrAction.shadowOpacity = 0.4; value.sheet.elevation = 9; });
    const tokens = require(path.join(fixture, 'index.cjs'));
    const css = await declarations(require(path.join(fixture, 'tailwind.cjs')), 'text-body text-button leading-6 px-screen rounded-card');
    assert.equal(tokens.spacing.screen, 26);
    assert.equal(css['.px-screen']['padding-left'], '26px');
    assert.equal(tokens.radii.card, 21);
    assert.equal(css['.rounded-card']['border-radius'], '21px');
    assert.equal(tokens.typography.body.fontSize, 19);
    assert.equal(tokens.typography.body.lineHeight, 27);
    assert.equal(css['.text-body']['font-size'], '19px');
    assert.equal(css['.text-body']['line-height'], '27px');
    assert.equal(css['.leading-6']['line-height'], '27px', '기존 숫자 클래스도 변경된 원본 값을 읽는다');
    assert.equal(tokens.nativeShadows.qrAction.shadowColor, '#123456');
    assert.equal(tokens.nativeShadows.qrAction.shadowOpacity, 0.4);
    assert.equal(tokens.nativeShadows.sheet.elevation, 9);
    assert.equal('colorToken' in tokens.nativeShadows.qrAction, false, '네이티브 스타일에는 내부 참조 키를 전달하지 않는다');
    const button = loadUI('web', path.join(fixture, 'index.cjs')).Button({ label: '확인' });
    const label = [button.props.children].flat().find(node => node?.type === 'span');
    assert.equal(label.props.style.fontSize, 19, '웹 Button이 원본 타이포그래피를 소비해야 한다');
    assert.equal(label.props.style.lineHeight, '27px');
    assert.equal(label.props.style.fontWeight, 500, '조합별 굵기도 모바일과 같은 참조를 사용한다');
    assert.equal(label.props.style.letterSpacing, '-0.025em');
    assert.equal(css['.text-button']['font-weight'], '500');
    const badge = loadUI('web', path.join(fixture, 'index.cjs')).Badge({ label: 'M', size: 'compact' });
    assert.equal(badge.props.style.fontWeight, 500);
    assert.equal(button.props.style.paddingTop, 13);
    assert.equal(button.props.style.borderRadius, 15);
    assert.equal(button.props.style.minHeight, 48, '공통 터치 최소 크기는 간격 단계 변경과 독립적으로 유지한다');
    const nativeButton = loadUI('native', path.join(fixture, 'index.cjs')).Button({ label: '확인' });
    const nativeCss = await declarations(require(path.join(fixture, 'tailwind.cjs')), nativeButton.props.className);
    assert.equal(nativeCss['.min-h-\\[48px\\]']['min-height'], '48px');
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
