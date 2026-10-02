import { Text, View } from 'react-native';
import { BrandLogo } from './BrandLogo';

type Props = { title: string; subtitle?: string; showBrand?: boolean };

export function AppHeader({ title, subtitle, showBrand = true }: Props) {
  return (
    <View className="px-screen pb-6 pt-5">
      {showBrand && (
        <View className="mb-5">
          <BrandLogo width={110.4} />
        </View>
      )}
      <Text accessibilityRole="header" className="text-page-title text-heading">
        {title}
      </Text>
      {subtitle ? <Text className="mt-2 text-size-15 leading-line-18 tracking-tight text-muted">{subtitle}</Text> : null}
    </View>
  );
}
