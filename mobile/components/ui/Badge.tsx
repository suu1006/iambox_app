import { Text, View } from 'react-native';

type Props = { label: string; tone?: 'solid' | 'soft' };

const tones = {
  solid: { container: 'bg-primary', label: 'text-onPrimary' },
  soft: { container: 'bg-primary-200', label: 'text-primary' },
} as const;

export function Badge({ label, tone = 'solid' }: Props) {
  return (
    <View className={`self-start rounded-full px-3 py-1 ${tones[tone].container}`}>
      <Text className={`text-[12px] font-bold leading-[18px] ${tones[tone].label}`}>{label}</Text>
    </View>
  );
}
