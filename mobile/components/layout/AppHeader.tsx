import { Text, View } from 'react-native';

type Props = { title: string };

export function AppHeader({ title }: Props) {
  return (
    <View className="px-6 pb-6 pt-5">
      <Text className="mb-5 text-[16px] font-extrabold text-primary">iambox</Text>
      <Text accessibilityRole="header" className="text-[28px] font-bold text-heading">
        {title}
      </Text>
    </View>
  );
}
