import { NaverMapMarkerOverlay } from '@mj-studio/react-native-naver-map';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect, Text } from 'react-native-svg';
import LogoSymbol from '../../assets/iambox-logo-symbol.svg';
import colors from '@iambox/design-tokens/colors.json';
import { formatLocationPrice } from '../../utils/formatLocationPrice';
import type { LocationPoint } from '../../types/location';

type Props = {
  location: LocationPoint;
  selected: boolean;
  onSelect: (location: LocationPoint) => void;
};

const markerWidth = 120;
const markerHeight = 76;

export function LocationMarker({ location, selected, onSelect }: Props) {
  const price = formatLocationPrice(location.priceFromKrw);
  const backgroundColor = selected ? colors.primary.DEFAULT : colors.surface;
  const nameColor = selected ? colors.onPrimary : colors.heading;
  const priceColor = selected ? colors.onPrimary : colors.primary.DEFAULT;

  return (
    <NaverMapMarkerOverlay
      latitude={location.latitude}
      longitude={location.longitude}
      width={markerWidth}
      height={markerHeight}
      anchor={{ x: 0.5, y: 1 }}
      zIndex={selected ? 1 : 0}
      onTap={() => onSelect(location)}
    >
      <View
        key={`${markerWidth}/${markerHeight}/${location.name}/${price}/${selected}`}
        collapsable={false}
        style={styles.marker}
      >
        <Svg width={markerWidth} height={markerHeight} style={StyleSheet.absoluteFill}>
          <Path
            d="M13.5 1.5H106.5Q118.5 1.5 118.5 13.5V55.5Q118.5 67.5 106.5 67.5H67L60 74.5L53 67.5H13.5Q1.5 67.5 1.5 55.5V13.5Q1.5 1.5 13.5 1.5Z"
            fill={backgroundColor}
            stroke={colors.primary.DEFAULT}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <Rect x={26.6} y={7.5} width={22.6} height={25} rx={4} fill={colors.surface} />
        </Svg>
        <LogoSymbol width={19.8} height={22} style={styles.logo} />
        <Svg width={markerWidth} height={markerHeight} style={StyleSheet.absoluteFill}>
          <Text x={54} y={26} fontSize={12} fontWeight="700" fill={nameColor}>
            {location.name}
          </Text>
          <Text x={60} y={54} textAnchor="middle" fontSize={17} fontWeight="800" fill={priceColor}>
            {price}
          </Text>
        </Svg>
      </View>
    </NaverMapMarkerOverlay>
  );
}

const styles = StyleSheet.create({
  marker: { width: markerWidth, height: markerHeight },
  logo: { position: 'absolute', left: 28, top: 9 },
});
