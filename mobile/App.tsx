import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeIcon from './assets/nav-home.svg';
import LocationIcon from './assets/nav-location.svg';
import EntryQrIcon from './assets/nav-entry-qr.svg';
import MovingBoxIcon from './assets/nav-moving-box.svg';
import MyIcon from './assets/nav-my.svg';

const colors = { primary: '#7B2DDA', inactive: '#818598', surface: '#FFFFFF' } as const;
const tabs = [
  { key: 'home', label: '홈', Icon: HomeIcon },
  { key: 'locations', label: '지점찾기', Icon: LocationIcon },
  { key: 'access', label: '출입QR', Icon: EntryQrIcon },
  { key: 'items', label: '이삿짐', Icon: MovingBoxIcon },
  { key: 'my', label: '마이', Icon: MyIcon },
] as const;
type TabKey = (typeof tabs)[number]['key'];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const selectedTab = tabs.find((tab) => tab.key === activeTab)!;
  const SelectedIcon = selectedTab.Icon;
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <Text style={styles.brand}>iambox</Text>
          <Text accessibilityRole="header" style={styles.title}>{selectedTab.label}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.placeholderIcon}>
            <SelectedIcon width={36} height={36} color={colors.primary} accessible={false} />
          </View>
          <Text style={styles.placeholderTitle}>{selectedTab.label}</Text>
          <Text style={styles.placeholderDescription}>화면을 준비하고 있어요.</Text>
        </ScrollView>
        <View style={styles.navigation}>
          <View pointerEvents="none" style={styles.navigationDivider} />
          {tabs.map((tab) => {
            const selected = activeTab === tab.key;
            const isQr = tab.key === 'access';
            const Icon = tab.Icon;
            return (
              <Pressable
                key={tab.key}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected }}
                onPress={() => setActiveTab(tab.key)}
                style={({ pressed }) => [styles.tab, pressed && styles.pressedTab]}
              >
                <View style={styles.tabIcon}>
                  <View style={isQr ? styles.qrIcon : undefined}>
                    <Icon width={isQr ? 48 : 26} height={isQr ? 48 : 26}
                      color={isQr ? colors.surface : selected ? colors.primary : colors.inactive}
                      accessible={false} />
                  </View>
                </View>
                <Text style={[styles.tabLabel, selected && styles.selectedTabLabel]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  brand: { fontSize: 16, fontWeight: '800', color: '#2563EB', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#101828' },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#F8FAFC' },
  placeholderIcon: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  placeholderTitle: { fontSize: 22, fontWeight: '700', color: '#101828', marginBottom: 8 },
  placeholderDescription: { fontSize: 15, color: '#667085', textAlign: 'center' },
  navigation: { flexDirection: 'row', backgroundColor: colors.surface, paddingHorizontal: 8, paddingBottom: 8, paddingTop: 0 },
  navigationDivider: { position: 'absolute', top: 14, left: 12, right: 12, height: StyleSheet.hairlineWidth, backgroundColor: '#E8E9EF' },
  tab: { flex: 1, alignItems: 'center', minHeight: 80, paddingTop: 2, paddingBottom: 4 },
  pressedTab: { opacity: 0.6 },
  tabIcon: { height: 52, alignItems: 'center', justifyContent: 'flex-end', marginBottom: 6 },
  qrIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 3, elevation: 3,
  },
  tabLabel: { fontSize: 11, fontWeight: '500', color: colors.inactive, textAlign: 'center' },
  selectedTabLabel: { color: colors.primary, fontWeight: '700' },
});
