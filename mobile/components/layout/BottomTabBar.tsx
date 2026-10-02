import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tabs, type TabKey } from '../../navigation/tabs';
import colors from '@iambox/design-tokens/colors.json';
import { nativeShadows } from '@iambox/design-tokens';

type Props = { activeTab: TabKey; onTabChange: (tab: TabKey) => void };

export function BottomTabBar({ activeTab, onTabChange }: Props) {
  return (
    <View className="flex-row bg-surface px-2 pb-2">
      <View pointerEvents="none" className="absolute left-3 right-3 top-[14px] bg-divider" style={styles.divider} />
      {tabs.map(({ key, label, Icon }) => {
        const selected = activeTab === key;
        const isQr = key === 'access';
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            onPress={() => onTabChange(key)}
            className="min-h-[80px] flex-1 items-center pb-1 pt-0.5 active:opacity-60"
          >
            <View className="mb-1.5 h-[52px] items-center justify-end">
              <View className={isQr ? 'h-12 w-12 rounded-pill bg-primary' : undefined} style={isQr ? styles.qrShadow : undefined}>
                <Icon
                  width={isQr ? 48 : 26}
                  height={isQr ? 48 : 26}
                  color={isQr ? colors.onPrimary : selected ? colors.primary.DEFAULT : colors.inactive}
                  accessible={false}
                />
              </View>
            </View>
            <Text className={`text-center text-size-11 ${selected ? 'font-bold text-primary' : 'font-medium text-inactive'}`}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Preserve the native hairline and platform-specific shadow values.
const styles = StyleSheet.create({
  divider: { height: StyleSheet.hairlineWidth },
  qrShadow: nativeShadows.qrAction,
});
