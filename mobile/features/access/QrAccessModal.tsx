import { useEffect, useRef } from 'react';
import { AccessibilityInfo, BackHandler, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { mockAccessDetails } from '../../mocks/access';
import { useQrBrightness } from './useQrBrightness';

type Props = { visible: boolean; onClose: () => void };

export function QrAccessModal({ visible, onClose }: Props) {
  const titleRef = useRef<Text>(null);
  useQrBrightness(visible);

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  const focusTitle = () => {
    if (titleRef.current) AccessibilityInfo.sendAccessibilityEvent(titleRef.current, 'focus');
  };
  const detail = mockAccessDetails.qr;
  const content = (
    <View accessibilityViewIsModal onAccessibilityEscape={onClose} className="mx-auto max-h-full w-full max-w-[420px] rounded-3xl bg-surface p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text ref={titleRef} accessible accessibilityRole="header" className="text-[22px] font-bold text-heading">{detail.title}</Text>
        <Text className="mt-2 text-[14px] leading-5 text-muted">{detail.description}</Text>
        <View className="my-5 gap-3 rounded-2xl bg-[#F4F0FF] p-4">
          {detail.lines.map((line) => <Text key={line} className="text-[15px] leading-6 text-heading">{line}</Text>)}
        </View>
      </ScrollView>
      <Pressable accessibilityRole="button" onPress={onClose} className="min-h-[48px] items-center justify-center rounded-xl bg-primary px-4 py-3 active:opacity-70">
        <Text className="text-[16px] font-bold text-white">닫기</Text>
      </Pressable>
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose} onShow={focusTitle}>
        <View className="flex-1 justify-center bg-black/40 px-6 py-12">{content}</View>
      </Modal>
    );
  }

  if (!visible) return null;
  // Android Modal은 별도 Dialog 창이다. Activity 밝기가 적용되는 같은 창에 표시한다.
  return (
    <View onLayout={focusTitle} className="absolute inset-0 z-50 justify-center bg-black/40 px-6 py-12">
      {content}
    </View>
  );
}
