const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawn } = require('node:child_process');
const { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, symlinkSync, rmSync, existsSync, realpathSync } = require('node:fs');
const path = require('node:path');
const { tmpdir } = require('node:os');
const { createRequire } = require('node:module');
const fromMobile = createRequire(path.resolve(__dirname, '../../../mobile/package.json'));

// 실행 중인 NativeWind의 실제 Tailwind CLI가 JSON 변경을 다시 생성해야 한다.
// 한 번만 CSS를 만드는 검증으로는 오래된 스타일을 계속 제공하는 문제를 잡지 못한다.
test('모바일 Tailwind watch는 공통 JSON 변경 후 별칭 스타일을 다시 생성한다', { timeout: 15000 }, async () => {
  // macOS의 /var -> /private/var 별칭이 CLI cwd와 감시 의존성 경로를 나누지 않게 한다.
  const fixture = realpathSync(mkdtempSync(path.join(tmpdir(), 'iambox-token-watch-')));
  const mobile = path.join(fixture, 'mobile');
  mkdirSync(path.join(mobile, 'node_modules/@iambox'), { recursive: true });
  cpSync(path.dirname(require.resolve('@iambox/design-tokens/colors.json')), path.join(fixture, 'packages/design-tokens/src'), { recursive: true });
  cpSync(path.resolve(__dirname, '../../design-tokens/package.json'), path.join(fixture, 'packages/design-tokens/package.json'));
  symlinkSync(path.join(fixture, 'packages/design-tokens'), path.join(mobile, 'node_modules/@iambox/design-tokens'), 'dir');
  symlinkSync(path.dirname(fromMobile.resolve('nativewind/package.json')), path.join(mobile, 'node_modules/nativewind'), 'dir');
  const source = readFileSync(path.resolve(__dirname, '../../../mobile/tailwind.config.js'), 'utf8')
    .replace(/content: \{ relative: true, files: \[[^\]]+\] \}/, "content: [{ raw: 'px-screen text-body' }]");
  writeFileSync(path.join(mobile, 'tailwind.config.js'), source);
  writeFileSync(path.join(mobile, 'input.css'), '@tailwind utilities;');
  const output = path.join(mobile, 'output.css');
  const child = spawn(process.execPath, [fromMobile.resolve('tailwindcss/lib/cli.js'), '-i', 'input.css', '-o', 'output.css', '--watch', '--poll'], {
    cwd: mobile, env: { ...process.env, NATIVEWIND_OS: 'ios' }, stdio: ['pipe', 'ignore', 'pipe'],
  });
  let errors = '';
  child.stderr.on('data', data => { errors += data.toString(); });
  const waitForPadding = async (expected, update) => {
    const deadline = Date.now() + 5000;
    while (Date.now() < deadline) {
      if (existsSync(output) && readFileSync(output, 'utf8').includes(`padding-left: ${expected}px`)) return;
      // 첫 출력보다 감시 준비가 늦어지는 환경에서도 실제 파일 변경을 전달한다.
      update?.();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.fail(`watch가 변경된 padding ${expected}px를 생성하지 않았다: ${errors}`);
  };
  try {
    await waitForPadding(24);
    const file = path.join(fixture, 'packages/design-tokens/src/spacing.json');
    const spacing = JSON.parse(readFileSync(file, 'utf8'));
    spacing.scale['6'] = 26;
    writeFileSync(file, JSON.stringify(spacing));
    await waitForPadding(26, () => writeFileSync(file, JSON.stringify(spacing)));
  } finally {
    if (child.exitCode === null) {
      const exited = new Promise(resolve => child.once('exit', resolve));
      child.kill();
      await exited;
    }
    rmSync(fixture, { recursive: true, force: true });
  }
});
