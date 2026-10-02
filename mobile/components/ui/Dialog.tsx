import { useRef, useState, type Ref } from 'react';
import { AccessibilityInfo, Modal, ScrollView, Text, View, type ViewProps } from 'react-native';
import { Button } from './Button';

export type DialogContent = { title: string; description?: string; lines?: readonly string[] };

type CardProps = DialogContent & {
  onClose: () => void;
  confirmLabel?: string;
  titleRef?: Ref<Text>;
};

export function DialogCard({ title, description, lines, onClose, confirmLabel = '닫기', titleRef }: CardProps) {
  return (
    <View accessibilityViewIsModal onAccessibilityEscape={onClose} className="mx-auto max-h-full w-full max-w-[420px] rounded-dialog bg-surface p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text ref={titleRef} accessible accessibilityRole="header" className="text-size-22 font-bold text-heading">{title}</Text>
        {description ? <Text className="mt-2 text-size-14 leading-5 text-muted">{description}</Text> : null}
        {lines?.length ? (
          <View className="mt-5 gap-3 rounded-thumbnail bg-primary-50 p-4">
            {lines.map((line) => <Text key={line} className="text-size-15 leading-6 text-heading">{line}</Text>)}
          </View>
        ) : null}
      </ScrollView>
      <Button label={confirmLabel} onPress={onClose} className="mt-5" />
    </View>
  );
}

export function DialogBackdrop({ className = '', ...props }: ViewProps & { className?: string }) {
  return <View className={`flex-1 justify-center bg-black/40 px-screen py-12 ${className}`} {...props} />;
}

export function focusAccessibility(ref: { current: Text | null }) {
  if (ref.current) AccessibilityInfo.sendAccessibilityEvent(ref.current, 'focus');
}

type InfoDialogProps = {
  visible: boolean;
  content: DialogContent | null;
  onClose: () => void;
  confirmLabel?: string;
};

export function InfoDialog({ visible, content, onClose, confirmLabel }: InfoDialogProps) {
  const titleRef = useRef<Text>(null);
  if (!content) return null;
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose} onShow={() => focusAccessibility(titleRef)}>
      <DialogBackdrop>
        <DialogCard {...content} onClose={onClose} confirmLabel={confirmLabel} titleRef={titleRef} />
      </DialogBackdrop>
    </Modal>
  );
}

// 닫힘 페이드 동안 내용이 비지 않도록 마지막 내용은 유지하고 표시 여부만 바꾼다.
export function useInfoDialog() {
  const [content, setContent] = useState<DialogContent | null>(null);
  const [visible, setVisible] = useState(false);
  const open = (next: DialogContent) => {
    setContent(next);
    setVisible(true);
  };
  return { open, dialogProps: { visible, content, onClose: () => setVisible(false) } };
}
