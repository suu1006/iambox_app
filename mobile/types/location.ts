import type { ImageSourcePropType } from 'react-native';
import type { LocationData } from '@iambox/contracts';

export type LocationPoint = LocationData & {
  photoSource?: ImageSourcePropType;
};
