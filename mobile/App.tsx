import './global.css';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppHeader, BottomTabBar, PlaceholderContent } from './components/layout';
import { HomeContent } from './features/home/HomeContent';
import { AccessContent } from './features/access/AccessContent';
import { LocationsContent } from './features/locations/LocationsContent';
import { QrAccessModal } from './features/access/QrAccessModal';
import { tabs, type TabKey } from './navigation/tabs';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [previousTab, setPreviousTab] = useState<TabKey>('home');
  const [qrVisible, setQrVisible] = useState(false);
  const closeQr = useCallback(() => setQrVisible(false), []);
  const selectTab = (tab: TabKey) => {
    if (tab === 'locations' && activeTab !== 'locations') {
      setPreviousTab(activeTab);
    }
    setQrVisible(false);
    setActiveTab(tab);
  };
  const selectedTab = tabs.find((tab) => tab.key === activeTab)!;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
              <LocationsContent onBack={() => selectTab(previousTab)} />
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
    </GestureHandlerRootView>
  );
}
