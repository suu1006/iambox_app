import { Text, View } from 'react-native';
import { badgeBaseRule, badgeSizes, badgeTones, type BadgeSharedProps } from '../shared/badge.ts';

export type BadgeProps = BadgeSharedProps;
export function Badge({ label, tone = 'solid', size = 'default' }: BadgeProps) {
  return (
    <View className={`${badgeBaseRule.containerClassName} ${badgeSizes[size].containerClassName} ${badgeTones[tone].containerClassName}`}>
      <Text className={`${badgeSizes[size].labelClassName} ${badgeTones[tone].labelClassName}`}>{label}</Text>
    </View>
  );
}
