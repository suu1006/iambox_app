const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createBrightnessSession, bindBrightnessToAppState } = require('../features/access/brightnessSession.ts');

// 기기 API만 대체한다. 테스트 대상은 실제 세션의 비동기 순서와 복원 결과다.
function device({ brightness = 0.35, system = false } = {}) {
  const state = { brightness, system, systemBrightness: brightness, writes: [] };
  const api = {
    async getBrightnessAsync() { return state.brightness; },
    async isUsingSystemBrightnessAsync() { return state.system; },
    async setBrightnessAsync(value) {
      state.brightness = value;
      state.system = false;
      state.writes.push(value);
    },
    async restoreSystemBrightnessAsync() {
      state.brightness = state.systemBrightness;
      state.system = true;
      state.writes.push('system');
    },
  };
  return { state, api };
}

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

for (const brightness of [0, 0.35]) {
  test(`iOS는 최대 밝기 적용 후 기존 밝기 ${brightness}로 복원한다`, async () => {
    const { api, state } = device({ brightness });
    const session = createBrightnessSession(api, 'ios', assert.fail);
    await session.setEnabled(true);
    assert.equal(state.brightness, 1);
    await session.setEnabled(false);
    assert.equal(state.brightness, brightness);
  });
}

test('Android 시스템 밝기 사용 상태를 복원해 자동 밝기를 유지한다', async () => {
  const { api, state } = device({ system: true });
  const session = createBrightnessSession(api, 'android', assert.fail);
  await session.setEnabled(true);
  assert.equal(state.brightness, 1);
  state.systemBrightness = 0.6;
  await session.setEnabled(false);
  assert.equal(state.system, true);
  assert.equal(state.brightness, 0.6);
});

test('Android에서 기존 앱 밝기 설정을 사용했다면 그 값으로 복원한다', async () => {
  const { api, state } = device();
  const session = createBrightnessSession(api, 'android', assert.fail);
  await session.setEnabled(true);
  assert.equal(state.brightness, 1);
  await session.setEnabled(false);
  assert.equal(state.brightness, 0.35);
  assert.equal(state.system, false);
});

test('Android 시스템 밝기를 복원할 때 불필요한 밝기값 조회 실패에 영향받지 않는다', async () => {
  const { api, state } = device({ system: true });
  api.getBrightnessAsync = async () => { throw new Error('system brightness unavailable'); };
  const session = createBrightnessSession(api, 'android', assert.fail);
  await session.setEnabled(true);
  assert.equal(state.brightness, 1);
  await session.setEnabled(false);
  assert.equal(state.system, true);
});

test('같은 열림 상태를 다시 전달해도 원래 밝기를 덮어쓰지 않는다', async () => {
  const { api, state } = device();
  const session = createBrightnessSession(api, 'ios', assert.fail);
  await session.setEnabled(true);
  await session.setEnabled(true);
  await session.setEnabled(false);
  assert.equal(state.brightness, 0.35);
  assert.deepEqual(state.writes, [1, 0.35]);
});

test('밝기 조회 중 닫히면 뒤늦게 최대 밝기를 적용하지 않는다', async () => {
  const { api, state } = device();
  const reading = deferred();
  const started = deferred();
  api.getBrightnessAsync = async () => { started.resolve(); return reading.promise; };
  const session = createBrightnessSession(api, 'ios', assert.fail);
  const opening = session.setEnabled(true);
  await started.promise;
  const closing = session.setEnabled(false);
  reading.resolve(0.35);
  await Promise.all([opening, closing]);
  assert.equal(state.brightness, 0.35);
  assert.deepEqual(state.writes, []);
});

test('최대 밝기 적용 중 닫고 다시 열어도 마지막 닫기에서 원래 값으로 복원한다', async () => {
  const { api, state } = device();
  const writing = deferred();
  const started = deferred();
  const setBrightness = api.setBrightnessAsync;
  api.setBrightnessAsync = async (value) => {
    if (value === 1) { started.resolve(); await writing.promise; }
    await setBrightness(value);
  };
  const session = createBrightnessSession(api, 'ios', assert.fail);
  const opening = session.setEnabled(true);
  await started.promise;
  const closing = session.setEnabled(false);
  const reopening = session.setEnabled(true);
  writing.resolve();
  await Promise.all([opening, closing, reopening]);
  assert.equal(state.brightness, 1);
  await session.setEnabled(false);
  assert.equal(state.brightness, 0.35);
});

test('백그라운드 복원 후 재진입할 때 바뀐 밝기를 새 기준으로 저장한다', async () => {
  const { api, state } = device();
  const session = createBrightnessSession(api, 'ios', assert.fail);
  await session.setEnabled(true);
  await session.setEnabled(false);
  state.brightness = 0.7;
  await session.setEnabled(true);
  assert.equal(state.brightness, 1);
  await session.setEnabled(false);
  assert.equal(state.brightness, 0.7);
});

test('조회 실패 시 밝기를 바꾸지 않고 다음 열기를 처리한다', async () => {
  const { api, state } = device();
  const errors = [];
  const read = api.getBrightnessAsync;
  api.getBrightnessAsync = async () => { throw new Error('read failed'); };
  const session = createBrightnessSession(api, 'ios', (error) => errors.push(error));
  await session.setEnabled(true);
  assert.equal(state.brightness, 0.35);
  assert.equal(errors.length, 1);
  api.getBrightnessAsync = read;
  await session.setEnabled(true);
  assert.equal(state.brightness, 1);
  await session.setEnabled(false);
  assert.equal(state.brightness, 0.35);
});

test('복원이 실패해도 저장된 밝기를 유지해 다음 정리에서 다시 복원한다', async () => {
  const { api, state } = device();
  const errors = [];
  const setBrightness = api.setBrightnessAsync;
  const session = createBrightnessSession(api, 'ios', (error) => errors.push(error));
  await session.setEnabled(true);
  api.setBrightnessAsync = async () => { throw new Error('restore failed'); };
  await session.setEnabled(false);
  assert.equal(errors.length, 1);
  api.setBrightnessAsync = setBrightness;
  await session.setEnabled(false);
  assert.equal(state.brightness, 0.35);
});

test('앱 상태 이벤트로 복원·재적용하고 화면 정리 시 구독과 밝기를 복원한다', async () => {
  const { api, state } = device();
  const session = createBrightnessSession(api, 'ios', assert.fail);
  const listeners = new Set();
  const appState = {
    currentState: 'active',
    addEventListener(event, listener) {
      assert.equal(event, 'change');
      listeners.add(listener);
      return { remove: () => listeners.delete(listener) };
    },
  };
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  const cleanup = bindBrightnessToAppState(session, appState);
  await settle();
  assert.equal(state.brightness, 1);
  for (const listener of listeners) listener('inactive');
  await settle();
  assert.equal(state.brightness, 0.35);
  state.brightness = 0.7;
  for (const listener of listeners) listener('active');
  await settle();
  assert.equal(state.brightness, 1);
  cleanup();
  await settle();
  assert.equal(state.brightness, 0.7);
  assert.equal(listeners.size, 0);
});

test('최대 밝기 설정이 적용 후 실패해도 즉시 기존 밝기로 복원한다', async () => {
  const { api, state } = device();
  const errors = [];
  const setBrightness = api.setBrightnessAsync;
  api.setBrightnessAsync = async (value) => {
    await setBrightness(value);
    if (value === 1) throw new Error('write failed');
  };
  const session = createBrightnessSession(api, 'ios', (error) => errors.push(error));
  await session.setEnabled(true);
  assert.equal(state.brightness, 0.35);
  assert.equal(errors.length, 1);
});
