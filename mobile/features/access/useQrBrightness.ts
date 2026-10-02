import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import { bindBrightnessToAppState, createBrightnessSession } from '../../utils/brightnessSession';

// 화면 재마운트 사이에도 같은 큐를 사용해 이전 복원과 새 적용의 순서를 보장한다.
let session: ReturnType<typeof createBrightnessSession> | undefined;

export function useQrBrightness(visible: boolean) {
  useEffect(() => {
    if (!visible || (Platform.OS !== 'ios' && Platform.OS !== 'android')) return;
    if (!requireOptionalNativeModule('ExpoBrightness')) {
      if (__DEV__) console.warn('QR 밝기 기능을 사용하려면 expo-brightness를 포함해 개발용 앱을 다시 빌드해 주세요.');
      return;
    }

    // 네이티브 모듈이 없는 기존 개발용 앱에서도 QR 안내창 자체는 열 수 있다.
    if (!session) {
      const brightness = require('expo-brightness') as typeof import('expo-brightness');
      session = createBrightnessSession(brightness, Platform.OS, (error) => {
        if (__DEV__) console.warn('QR 화면 밝기를 변경하거나 복원하지 못했습니다.', error);
      });
    }
    return bindBrightnessToAppState(session, AppState);
  }, [visible]);
}
