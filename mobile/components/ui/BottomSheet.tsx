import {
  createContext, forwardRef, useCallback, useContext, useImperativeHandle, useMemo, useRef, useState,
  type ReactNode,
} from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import GorhomBottomSheet from '@gorhom/bottom-sheet';
import colors from '@iambox/design-tokens/colors.json';
import { nativeShadows, radii } from '@iambox/design-tokens';
import { getDefaultBottomSheetSnapPoints } from '../../utils/bottomSheetLayout';

export type BottomSheetHandle = { snapToIndex: (index: number) => void };

export type BottomSheetProps = {
  children: ReactNode;
  header?: ReactNode;
  // Inputs using the native sheet context need a plain measurement alternative.
  measurementHeader?: ReactNode;
  snapPoints?: (number | `${number}%`)[];
  initialIndex?: number;
  onChange?: (index: number) => void;
  accessibilityLabel?: string;
};

type HandleContextValue = {
  header: ReactNode;
  accessibilityLabel: string;
  index: number;
  pointCount: number;
  snapToIndex: (index: number) => void;
  onLayout: (height: number) => void;
};

const HandleContext = createContext<HandleContextValue | null>(null);

// A stable component identity preserves the focused handle when its value changes.
function SheetHandle() {
  const value = useContext(HandleContext)!;
  const { header, accessibilityLabel, index, pointCount, snapToIndex, onLayout } = value;
  return (
    <View onLayout={({ nativeEvent }) => onLayout(nativeEvent.layout.height)}>
      <Pressable
        accessibilityRole="adjustable"
        accessibilityLabel={`${accessibilityLabel} 높이 조절`}
        accessibilityHint="두 번 탭하면 펼치거나 접습니다. 위아래로 쓸어 높이를 조절할 수 있습니다."
        accessibilityValue={{ min: 1, max: pointCount, now: index + 1, text: `${index + 1}/${pointCount}단계` }}
        accessibilityActions={[{ name: 'increment', label: '펼치기' }, { name: 'decrement', label: '접기' }]}
        onAccessibilityAction={({ nativeEvent }) => {
          if (nativeEvent.actionName === 'increment') snapToIndex(index + 1);
          if (nativeEvent.actionName === 'decrement') snapToIndex(index - 1);
        }}
        onPress={() => snapToIndex(index === pointCount - 1 ? 0 : pointCount - 1)}
        style={styles.handle}
      >
        <View accessible={false} pointerEvents="none" style={styles.handleIndicator} />
      </Pressable>
      {header}
    </View>
  );
}

/** Persistent sheet. Place inside a flex container alongside its background content. */
export const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(function BottomSheet({
  children, header, measurementHeader = header, snapPoints, initialIndex = 0, onChange,
  accessibilityLabel = '바텀 시트',
}, ref) {
  const sheetRef = useRef<GorhomBottomSheet>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const points = useMemo(
    () => snapPoints ?? getDefaultBottomSheetSnapPoints(containerHeight, headerHeight),
    [snapPoints, containerHeight, headerHeight],
  );
  const [storedIndex, setIndex] = useState(initialIndex);
  const index = points.length > 0
    ? Math.max(0, Math.min(storedIndex, points.length - 1))
    : storedIndex;
  // Correct before rendering the native sheet, and retain the correction if
  // the parent later adds snap points again.
  if (index !== storedIndex) setIndex(index);

  const snapToIndex = useCallback((nextIndex: number) => {
    if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= points.length) return;
    sheetRef.current?.snapToIndex(nextIndex);
  }, [points.length]);

  useImperativeHandle(ref, () => ({ snapToIndex }), [snapToIndex]);

  return (
    <View
      pointerEvents="box-none"
      style={StyleSheet.absoluteFill}
      onLayout={({ nativeEvent }) => setContainerHeight(nativeEvent.layout.height)}
    >
      <HandleContext.Provider value={{
        header, accessibilityLabel, index, pointCount: points.length,
        snapToIndex, onLayout: setHeaderHeight,
      }}>
        {containerHeight > 0 && points.length > 0 ? (
          <GorhomBottomSheet
            ref={sheetRef}
            index={index}
            snapPoints={points}
            enableDynamicSizing={false}
            enablePanDownToClose={false}
            enableOverDrag={false}
            animateOnMount={false}
            accessible={false}
            activeOffsetY={[-8, 8]}
            keyboardBehavior="extend"
            keyboardBlurBehavior="restore"
            enableBlurKeyboardOnGesture
            android_keyboardInputMode="adjustResize"
            handleComponent={SheetHandle}
            backgroundStyle={styles.background}
            style={styles.shadow}
            onChange={(nextIndex) => {
              setIndex(nextIndex);
              onChange?.(nextIndex);
            }}
          >
            {children}
          </GorhomBottomSheet>
        ) : (
          <View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.measurement}
          >
            <HandleContext.Provider value={{
              header: measurementHeader, accessibilityLabel, index, pointCount: points.length,
              snapToIndex, onLayout: setHeaderHeight,
            }}>
              <SheetHandle />
            </HandleContext.Provider>
          </View>
        )}
      </HandleContext.Provider>
    </View>
  );
});

const styles = StyleSheet.create({
  // Continue measuring while space is insufficient so smaller headers can restore the sheet.
  measurement: { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0 },
  handle: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  handleIndicator: { width: 40, height: 4, borderRadius: radii.handle, backgroundColor: colors.inactive },
  background: { backgroundColor: colors.surface, borderTopLeftRadius: radii.sheet, borderTopRightRadius: radii.sheet },
  shadow: nativeShadows.sheet,
});
