import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tabs, type TabKey } from '../../navigation/tabs';
import colors from '@iambox/design-tokens/colors.json';

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
            className="min-h-[80px] flex-1 items-center pb-1 pt-[2px] active:opacity-60"
          >
            <View className="mb-[6px] h-[52px] items-center justify-end">
              <View className={isQr ? 'h-12 w-12 rounded-full bg-primary' : undefined} style={isQr ? styles.qrShadow : undefined}>
                <Icon
                  width={isQr ? 48 : 26}
                  height={isQr ? 48 : 26}
                  color={isQr ? colors.onPrimary : selected ? colors.primary.DEFAULT : colors.inactive}
                  accessible={false}
                />
              </View>
            </View>
            <Text className={`text-center text-[11px] ${selected ? 'font-bold text-primary' : 'font-medium text-inactive'}`}>
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
  qrShadow: {
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});
