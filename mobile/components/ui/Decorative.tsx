import { View, type ViewProps } from 'react-native';

type Props = ViewProps & { className?: string };

// 장식용 그림은 스크린리더와 터치 대상에서 제외한다.
export function Decorative(props: Props) {
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" {...props} />;
}
