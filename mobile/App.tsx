import './global.css';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from './components/layout/AppHeader';
import { BottomTabBar } from './components/layout/BottomTabBar';
import { PlaceholderContent } from './components/layout/PlaceholderContent';
import { HomeContent } from './features/home/HomeContent';
import { AccessContent } from './features/access/AccessContent';
import { LocationsContent } from './features/locations/LocationsContent';
import { QrAccessModal } from './features/access/QrAccessModal';
import { tabs, type TabKey } from './navigation/tabs';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [qrVisible, setQrVisible] = useState(false);
  const closeQr = useCallback(() => setQrVisible(false), []);
  const selectTab = (tab: TabKey) => {
    setQrVisible(false);
    setActiveTab(tab);
  };
  const selectedTab = tabs.find((tab) => tab.key === activeTab)!;

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-surface">
        <StatusBar style="dark" />
        <View
          className="flex-1"
          pointerEvents={qrVisible ? 'none' : 'auto'}
          accessibilityElementsHidden={qrVisible}
          importantForAccessibility={qrVisible ? 'no-hide-descendants' : 'auto'}
        >
          {activeTab === 'home' ? (
            <HomeContent onLocationsPress={() => selectTab('locations')} />
          ) : activeTab === 'access' ? (
            <AccessContent onOpenQr={() => setQrVisible(true)} />
          ) : activeTab === 'locations' ? (
            <LocationsContent />
          ) : (
            <>
              <AppHeader title={selectedTab.label} />
              <PlaceholderContent label={selectedTab.label} Icon={selectedTab.Icon} />
            </>
          )}
          <BottomTabBar activeTab={activeTab} onTabChange={selectTab} />
        </View>
        <QrAccessModal visible={qrVisible} onClose={closeQr} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
