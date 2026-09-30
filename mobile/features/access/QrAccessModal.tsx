import { useEffect, useRef } from 'react';
import { BackHandler, Platform, Text } from 'react-native';
import { DialogBackdrop, DialogCard, InfoDialog, focusAccessibility } from '../../components/ui';
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

  if (Platform.OS === 'ios') {
    return <InfoDialog visible={visible} content={mockAccessDetails.qr} onClose={onClose} />;
  }

  if (!visible) return null;
  // Android Modal은 별도 Dialog 창이다. Activity 밝기가 적용되는 같은 창에 표시한다.
  return (
    <DialogBackdrop onLayout={() => focusAccessibility(titleRef)} className="absolute inset-0 z-50">
      <DialogCard {...mockAccessDetails.qr} onClose={onClose} titleRef={titleRef} />
    </DialogBackdrop>
  );
}
