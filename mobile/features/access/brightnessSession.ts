export type BrightnessApi = {
  getBrightnessAsync(): Promise<number>;
  setBrightnessAsync(value: number): Promise<void>;
  isUsingSystemBrightnessAsync(): Promise<boolean>;
  restoreSystemBrightnessAsync(): Promise<void>;
};

type AppStateSource = {
  currentState: string | null;
  addEventListener(event: 'change', listener: (state: string) => void): { remove(): void };
};

export function bindBrightnessToAppState(
  session: { setEnabled(enabled: boolean): Promise<void> },
  appState: AppStateSource,
) {
  const subscription = appState.addEventListener('change', (state) => {
    void session.setEnabled(state === 'active');
  });
  void session.setEnabled(appState.currentState === 'active');
  return () => {
    subscription.remove();
    void session.setEnabled(false);
  };
}

export function createBrightnessSession(
  api: BrightnessApi,
  platform: 'ios' | 'android',
  onError: (error: unknown) => void,
) {
  let revision = 0;
  let pending = Promise.resolve();
  let previous: { system: true } | { system: false; brightness: number } | undefined;

  const restore = async () => {
    if (!previous) return;
    if (previous.system) {
      await api.restoreSystemBrightnessAsync();
    } else {
      await api.setBrightnessAsync(previous.brightness);
    }
    // 실패하면 값을 남겨 다음 닫기/정리에서 다시 복원할 수 있게 한다.
    previous = undefined;
  };

  return {
    setEnabled(enabled: boolean): Promise<void> {
      const request = ++revision;
      // 읽기·적용·복원을 직렬화해 이전 닫기가 새 열기의 기준값을 오염시키지 않게 한다.
      pending = pending.then(async () => {
        if (!enabled) {
          await restore();
          return;
        }
        if (request !== revision || previous) return;

        const system = platform === 'android' && await api.isUsingSystemBrightnessAsync();
        const snapshot = system
          ? { system: true as const }
          : { system: false as const, brightness: await api.getBrightnessAsync() };
        if (request !== revision) return;

        previous = snapshot;
        try {
          await api.setBrightnessAsync(1);
        } catch (error) {
          // 네이티브 호출이 일부 적용된 뒤 실패해도 최대 밝기가 남지 않도록 시도한다.
          await restore();
          throw error;
        }
      }).catch(onError);
      return pending;
    },
  };
}
