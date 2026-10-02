import { useRef } from 'react';
import { AccessibilityInfo, Modal, Pressable, Text, View } from 'react-native';
import { DialogBackdrop } from '../../components/ui';

type Props = { visible: boolean; label: string; onClose: () => void };

// 접수·이용 안내 내용은 다음 단계에서 채운다. 현재는 열기와 닫기만 제공한다.
export function DeliveryModal({ visible, label, onClose }: Props) {
  const closeRef = useRef<View>(null);

  return (
    <Modal
      transparent
      visible={visible}
      accessibilityLabel={label}
      animationType="fade"
      onRequestClose={onClose}
      onShow={() => {
        if (closeRef.current) AccessibilityInfo.sendAccessibilityEvent(closeRef.current, 'focus');
      }}
    >
      <DialogBackdrop>
        <View
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
          className="mx-auto w-full max-w-[420px] rounded-dialog bg-surface p-6"
        >
          <View className="min-h-[180px]" />
          <Pressable
            ref={closeRef}
            accessibilityRole="button"
            accessibilityLabel={`${label} 닫기`}
            onPress={onClose}
            className="mt-5 min-h-[48px] items-center justify-center rounded-button bg-primary px-4 py-3 active:opacity-60"
          >
            <Text className="text-button text-onPrimary">닫기</Text>
          </Pressable>
        </View>
      </DialogBackdrop>
    </Modal>
  );
}
