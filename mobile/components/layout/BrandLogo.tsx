import { View } from 'react-native';
import IamboxLogo from '../../assets/iambox-logo.svg';

type Props = { width?: number };

export function BrandLogo({ width = 147.2 }: Props) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="아이엠박스"
      style={{ width, maxWidth: '100%', aspectRatio: 368 / 80, flexShrink: 1 }}
    >
      <IamboxLogo width="100%" height="100%" accessible={false} />
    </View>
  );
}
