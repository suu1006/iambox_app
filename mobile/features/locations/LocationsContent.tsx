import { Text, View } from 'react-native';
import { AppHeader } from '../../components/layout/AppHeader';
import { previewLocations } from '../../mocks/locations';
import { LocationMap } from './LocationMap';

export function LocationsContent() {
  return (
    <View className="flex-1 bg-surface">
      <AppHeader title="지점찾기" />
      <View className="border-b border-divider px-6 pb-4">
        <Text className="mb-1 text-[15px] font-semibold text-heading">
          예시 지점 {previewLocations.length}곳
        </Text>
        <Text className="text-[13px] leading-5 text-muted">
          화면 확인을 위한 예시이며 실제 운영 지점과 다릅니다.
        </Text>
      </View>
      <LocationMap locations={previewLocations} />
    </View>
  );
}
