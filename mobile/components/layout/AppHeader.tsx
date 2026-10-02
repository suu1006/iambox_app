import { Text, View } from 'react-native';
import { BrandLogo } from './BrandLogo';

type Props = { title: string; subtitle?: string; showBrand?: boolean };

export function AppHeader({ title, subtitle, showBrand = true }: Props) {
  return (
    <View className="px-6 pb-6 pt-5">
      {showBrand && (
        <View className="mb-5">
          <BrandLogo width={110.4} />
        </View>
      )}
      <Text accessibilityRole="header" className="text-[28px] font-extrabold leading-[38px] tracking-tight text-heading">
        {title}
      </Text>
      {subtitle ? <Text className="mt-2 text-[15px] leading-[18px] tracking-tight text-muted">{subtitle}</Text> : null}
    </View>
  );
}
