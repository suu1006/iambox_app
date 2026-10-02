import { useRef } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Button, DialogBackdrop, focusAccessibility } from '../../components/ui';
import CloseIcon from '../../assets/locations/close.svg';
import colors from '@iambox/design-tokens/colors.json';

type Props = {
  visible: boolean;
  availableSizes: readonly string[];
  selectedSizes: readonly string[];
  resultCount: number;
  onToggleSize: (size: string) => void;
  onReset: () => void;
  onApply: () => void;
  onClose: () => void;
};

export function LocationFilterModal({
  visible, availableSizes, selectedSizes, resultCount, onToggleSize, onReset, onApply, onClose,
}: Props) {
  const titleRef = useRef<Text>(null);
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose} onShow={() => focusAccessibility(titleRef)}>
      <DialogBackdrop>
        <View accessibilityViewIsModal onAccessibilityEscape={onClose} className="mx-auto max-h-full w-full max-w-[420px] rounded-3xl bg-surface p-6">
          <View className="flex-row items-center justify-between gap-3">
            <Text ref={titleRef} accessible accessibilityRole="header" className="flex-1 text-[22px] font-bold text-heading">필터</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="필터 닫기" onPress={onClose} className="min-h-[44px] min-w-[44px] items-center justify-center active:opacity-60">
              <CloseIcon width={20} height={20} color={colors.muted} accessible={false} />
            </Pressable>
          </View>
          <ScrollView className="mt-5" showsVerticalScrollIndicator={false}>
            <Text className="text-[16px] font-bold text-heading">이용 가능한 사이즈</Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {availableSizes.map((size) => {
                const selected = selectedSizes.includes(size);
                return (
                  <Pressable
                    key={size} accessibilityRole="checkbox" accessibilityLabel={`${size} 사이즈`}
                    accessibilityState={{ checked: selected }} onPress={() => onToggleSize(size)}
                    className={`min-h-[48px] min-w-[64px] items-center justify-center rounded-xl border px-5 py-3 active:opacity-60 ${selected ? 'border-primary bg-primary-50' : 'border-divider bg-surface'}`}
                  >
                    <Text className={`text-[16px] font-bold ${selected ? 'text-primary' : 'text-heading'}`}>{size}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="mt-3 text-[13px] leading-5 text-muted">
              {availableSizes.length ? '선택한 사이즈 중 하나라도 이용 가능한 지점을 보여줘요.' : '등록된 이용 가능 사이즈가 없습니다.'}
            </Text>
            <Text accessibilityLiveRegion="polite" className="mt-4 text-[14px] text-muted">예시 지점 {resultCount}곳</Text>
          </ScrollView>
          <View className="mt-6 flex-row flex-wrap items-center gap-3">
            <Button label="초기화" variant="link" onPress={onReset} />
            <Button label={`결과 ${resultCount}곳 보기`} onPress={onApply} className="flex-1" />
          </View>
        </View>
      </DialogBackdrop>
    </Modal>
  );
}
