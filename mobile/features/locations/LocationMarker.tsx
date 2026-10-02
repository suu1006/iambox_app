import { memo } from 'react';
import { fontSizes } from '@iambox/design-tokens';
import colors from '@iambox/design-tokens/colors.json';
import { NaverMapMarkerOverlay } from '@mj-studio/react-native-naver-map';
import { formatLocationPrice } from '../../utils/formatLocationPrice';
import type { MarkerImage } from '../../utils/markerImageCache';
import type { LocationPoint } from '../../types/location';

type Props = {
  location: LocationPoint;
  selected: boolean;
  image?: MarkerImage;
  alpha?: number;
  onSelect: (location: LocationPoint) => void;
};

// No React children here: neither platform needs to capture or track a View.
export const LocationMarker = memo(function LocationMarker({ location, selected, image, alpha = 1, onSelect }: Props) {
  return (
    <NaverMapMarkerOverlay
      latitude={location.latitude}
      longitude={location.longitude}
      image={image ? { httpUri: image.uri } : { symbol: 'black' }}
      tintColor={image ? undefined : colors.primary.DEFAULT}
      width={image ? image.width : 22}
      height={image ? image.height : 30}
      anchor={{ x: 0.5, y: 1 }}
      alpha={alpha}
      zIndex={selected ? 2 : 1}
      isForceShowIcon={selected}
      isHideCollidedCaptions={!selected}
      caption={image ? undefined : {
        text: location.name, textSize: fontSizes['12'], color: colors.heading,
        haloColor: colors.surface, requestedWidth: 100,
      }}
      subCaption={image ? undefined : {
        text: formatLocationPrice(location.priceFromKrw), textSize: fontSizes['12'],
        color: colors.primary.DEFAULT, haloColor: colors.surface,
      }}
      onTap={() => onSelect(location)}
    />
  );
});
