import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform, Text, TurboModuleRegistry, View } from 'react-native';
import type { LocationPoint } from './types';

type Props = { locations: readonly LocationPoint[] };

export function LocationMap({ locations }: Props) {
  if (
    Platform.OS === 'web' ||
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    !TurboModuleRegistry.get('RNCNaverMapUtil')
  ) {
    return (
      <MapUnavailable
        detail="네이버 지도를 포함한 개발용 앱에서 확인할 수 있습니다."
      />
    );
  }

  if (Constants.expoConfig?.extra?.naverMapConfigured !== true) {
    return (
      <MapUnavailable
        detail="네이버 지도 Client ID를 설정하고 개발용 앱을 다시 빌드해 주세요."
      />
    );
  }

  // The SDK enforces its native module at import time, so load it only after these checks.
  const { NaverLocationMap } = require('./NaverLocationMap') as typeof import('./NaverLocationMap');
  return <NaverLocationMap locations={locations} />;
}

function MapUnavailable({ detail }: { detail: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-canvas px-8">
      <Text accessibilityRole="header" className="text-[18px] font-bold text-heading">
        지도를 준비하고 있어요
      </Text>
      <Text className="mt-2 text-center text-[14px] leading-6 text-muted">
        {__DEV__ ? detail : '현재 지도를 표시할 수 없습니다. 잠시 후 다시 확인해 주세요.'}
      </Text>
    </View>
  );
}
