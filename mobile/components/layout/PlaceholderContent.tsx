import type { ComponentType } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import colors from '../../theme/colors.json';

type Props = { label: string; Icon: ComponentType<SvgProps> };

export function PlaceholderContent({ label, Icon }: Props) {
  return (
    <ScrollView contentContainerClassName="grow items-center justify-center bg-canvas p-6">
      <View className="mb-5 h-20 w-20 items-center justify-center rounded-3xl bg-iconSurface">
        <Icon width={36} height={36} color={colors.primary} accessible={false} />
      </View>
      <Text className="mb-2 text-[22px] font-bold text-heading">{label}</Text>
      <Text className="text-center text-[15px] text-muted">화면을 준비하고 있어요.</Text>
    </ScrollView>
  );
}
