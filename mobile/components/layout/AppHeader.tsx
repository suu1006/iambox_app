import { Text, View } from 'react-native';

type Props = { title: string; subtitle?: string; showBrand?: boolean };

export function AppHeader({ title, subtitle, showBrand = true }: Props) {
  return (
    <View className="px-6 pb-6 pt-5">
      {showBrand && <Text className="mb-5 text-[16px] font-extrabold text-primary">iambox</Text>}
      <Text accessibilityRole="header" className="text-[28px] font-extrabold leading-[38px] tracking-tight text-heading">
        {title}
      </Text>
      {subtitle ? <Text className="mt-2 text-[15px] leading-[18px] tracking-tight text-muted">{subtitle}</Text> : null}
    </View>
  );
}
