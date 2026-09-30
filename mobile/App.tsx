import './global.css';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from './components/AppHeader';
import { BottomTabBar } from './components/BottomTabBar';
import { PlaceholderContent } from './components/PlaceholderContent';
import { tabs, type TabKey } from './navigation/tabs';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const selectedTab = tabs.find((tab) => tab.key === activeTab)!;

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-surface">
        <StatusBar style="dark" />
        <AppHeader title={selectedTab.label} />
        <PlaceholderContent label={selectedTab.label} Icon={selectedTab.Icon} />
        <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
