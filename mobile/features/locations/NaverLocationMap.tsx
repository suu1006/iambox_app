import { NaverMapView } from '@mj-studio/react-native-naver-map';
import { StyleSheet } from 'react-native';
import { LocationMarker } from './LocationMarker';
import type { LocationPoint } from '../../types/location';

type Props = {
  locations: readonly LocationPoint[];
  selectedLocationId?: string;
  onSelectLocation: (location: LocationPoint) => void;
};

// Start near Gangnam/Seocho so their price bubbles do not overlap.
// Seongsu remains available by moving the map north.
const initialCamera = {
  latitude: 37.4965,
  longitude: 127.0175,
  zoom: 13,
};

export function NaverLocationMap({ locations, selectedLocationId, onSelectLocation }: Props) {
  return (
    <NaverMapView
      accessibilityLabel="네이버 예시 지점 지도"
      initialCamera={initialCamera}
      mapType="Basic"
      locale="ko"
      isShowLocationButton={false}
      isShowZoomControls={false}
      logoAlign="TopLeft"
      logoMargin={{ left: 12, top: 12 }}
      style={styles.map}
    >
      {locations.map((location) => (
        <LocationMarker
          key={location.id}
          location={location}
          selected={selectedLocationId === location.id}
          onSelect={onSelectLocation}
        />
      ))}
    </NaverMapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
