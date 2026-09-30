import { NaverMapMarkerOverlay, NaverMapView, type Region } from '@mj-studio/react-native-naver-map';
import { Alert, StyleSheet } from 'react-native';
import colors from '../../theme/colors.json';
import type { LocationPoint } from './types';

type Props = { locations: readonly LocationPoint[] };

// Naver's region starts at the southwest corner, unlike react-native-maps' center.
const initialRegion: Region = {
  latitude: 37.4674,
  longitude: 126.96,
  latitudeDelta: 0.11,
  longitudeDelta: 0.14,
};

export function NaverLocationMap({ locations }: Props) {
  return (
    <NaverMapView
      accessibilityLabel="네이버 예시 지점 지도"
      initialRegion={initialRegion}
      mapType="Basic"
      locale="ko"
      isShowLocationButton={false}
      isShowZoomControls={false}
      style={styles.map}
    >
      {locations.map((location) => (
        <NaverMapMarkerOverlay
          key={location.id}
          latitude={location.latitude}
          longitude={location.longitude}
          image={{ symbol: 'blue' }}
          caption={{ text: location.name, color: colors.heading, haloColor: colors.surface }}
          onTap={() => Alert.alert(location.name, '지도 표시 확인용 예시 지점입니다.')}
        />
      ))}
    </NaverMapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
