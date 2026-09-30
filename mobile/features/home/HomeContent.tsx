import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { EventBanner } from './EventBanner';
import StorageBoxes from '../../assets/01_storage_boxes.svg';
import StartupStore from '../../assets/04_startup_store.svg';
import HomeStorage from '../../assets/home-storage.svg';
import HomeDelivery from '../../assets/home-delivery.svg';
import HomeCare from '../../assets/home-care.svg';
import HomeStartup from '../../assets/home-startup.svg';
import HomeLocation from '../../assets/home-location.svg';
import HomeOnsite from '../../assets/home-onsite.svg';
import HomeNotice from '../../assets/home-notice.svg';
import ChevronRight from '../../assets/chevron-right.svg';

const services = [
  { title: '택배요청', description: '간편하게 접수하세요', Icon: HomeDelivery },
  { title: '케어서비스', description: '소중한 물품을 위한 케어', Icon: HomeCare },
];

const shortcuts = [
  { title: '창업문의', Icon: HomeStartup },
  { title: '지점 찾기', Icon: HomeLocation },
  { title: '출장서비스', Icon: HomeOnsite },
  { title: '공지사항', Icon: HomeNotice },
];

type Props = { onLocationsPress: () => void };

// 지점 찾기는 기존 탭으로 연결한다. 나머지 서비스는 실제 접수 전 준비 안내만 표시한다.
export function HomeContent({ onLocationsPress }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const [selectedService, setSelectedService] = useState('');
  const [showServiceInfo, setShowServiceInfo] = useState(false);
  const openServiceInfo = (title: string) => {
    setSelectedService(title);
    setShowServiceInfo(true);
  };

  return (
    <>
      <ScrollView className="flex-1 bg-surface" contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>
        <View className="mx-auto w-full max-w-[600px] px-5">
          <View className="relative overflow-hidden pb-5 pt-5">
            <Text className="text-[26px] font-extrabold tracking-tight text-primary">iambox</Text>
            <View className="mt-6 flex-row items-center">
              <Text accessibilityRole="header" className="flex-1 text-[26px] font-extrabold leading-[36px] tracking-tight text-heading">
                {'짐 걱정은 덜고,\n'}
                <Text className="text-primary">일상은 가볍게</Text>
              </Text>
              <View className="h-[110px] w-[95px] rounded-2xl bg-[#F6F1FC]" pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <StorageBoxes width="100%" height="100%" />
              </View>
            </View>
          </View>

          <View className="flex-row items-stretch gap-2.5">
            <View className="min-w-0 flex-1">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="물품 보관"
                onPress={() => openServiceInfo('물품 보관')}
                className="min-w-0 flex-1 overflow-hidden rounded-[20px] bg-primary px-4 pb-4 pt-5 active:opacity-80"
              >
                <View className="flex-row items-center justify-between gap-1">
                  <Text className="flex-1 text-[18px] font-bold leading-6 tracking-tight text-white">물품 보관</Text>
                  <ChevronRight width={18} height={18} color="#FFFFFF" accessible={false} />
                </View>
                <Text className="mt-2 text-[13px] leading-5 text-[#EEE0FF]">{compact ? '소중한 짐을\n안전하게\n보관하세요' : '소중한 짐을\n안전하게 보관하세요'}</Text>
                <View className="mt-6 min-h-[126px] flex-1 justify-end" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  <HomeStorage width="100%" height={126} />
                </View>
              </Pressable>
            </View>

            <View className="min-w-0 flex-1 gap-2.5">
              {services.map(({ title, description, Icon }) => (
                <Pressable
                  key={title}
                  accessibilityRole="button"
                  accessibilityLabel={title}
                  onPress={() => openServiceInfo(title)}
                  className="min-h-[128px] grow shrink-0 overflow-hidden rounded-[20px] bg-[#F6F2FD] px-3.5 pb-1 pt-3.5 active:opacity-80"
                >
                  <View className="flex-row items-center justify-between gap-1">
                    <Text className="flex-1 text-[17px] font-bold leading-6 tracking-tight text-heading">{title}</Text>
                    <ChevronRight width={17} height={17} color="#818598" accessible={false} />
                  </View>
                  <Text className="mt-1 text-[12px] leading-[18px] tracking-tight text-muted">{compact && title === '케어서비스' ? '소중한 물품을\n위한 케어' : description}</Text>
                  <View className="mt-1 h-[62px] w-full max-w-[114px] self-end" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                    <Icon width="100%" height="100%" />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mt-5 flex-row items-start">
            {shortcuts.map(({ title, Icon }) => (
              <Pressable
                key={title}
                accessibilityRole="button"
                accessibilityLabel={title}
                onPress={() => title === '지점 찾기' ? onLocationsPress() : openServiceInfo(title)}
                className="min-w-0 flex-1 items-center pb-1 active:opacity-60"
              >
                <View className="h-16 w-16 items-center justify-center rounded-full bg-[#F6F2FD]" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  <Icon width={32} height={32} />
                </View>
                <Text className="mt-2 text-center text-[12px] font-semibold leading-[18px] tracking-tight text-muted">{title}</Text>
              </Pressable>
            ))}
          </View>

          <EventBanner />

          <View className="mb-3 mt-6 flex-row items-center justify-between">
            <Text accessibilityRole="header" className="text-[22px] font-bold text-heading">생생후기</Text>
            <Text className="text-[13px] text-muted">전체보기 ›</Text>
          </View>
          <View className="flex-row items-center gap-3 rounded-[20px] border border-divider bg-white p-3">
            <View className="h-[82px] w-[88px] items-center justify-center rounded-xl bg-[#F6F2FD]" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <StartupStore width="100%" height="100%" />
            </View>
            <View className="flex-1">
              <Text accessibilityLabel="별점 5점 만점에 5점" className="text-[18px] tracking-[1px] text-[#FFB02E]">★★★★★</Text>
              <Text className="mt-1 text-[15px] font-bold leading-[22px] text-heading">이사 날짜가 안 맞아도 안심이에요</Text>
              <Text className="mt-1 text-[12px] text-muted">보관 이용 후기 · 예시</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <Modal visible={showServiceInfo} transparent animationType="fade" onRequestClose={() => setShowServiceInfo(false)}>
        <View className="flex-1 items-center justify-center bg-black/30 px-6">
          <View accessibilityViewIsModal className="w-full max-w-[360px] rounded-3xl bg-white p-6">
            <Text accessibilityRole="header" className="text-[20px] font-bold text-heading">{selectedService}</Text>
            <Text className="mt-3 text-[15px] leading-6 text-muted">서비스 이용 안내를 준비하고 있어요.</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="안내 닫기" onPress={() => setShowServiceInfo(false)} className="mt-6 min-h-12 items-center justify-center rounded-xl bg-primary px-4 py-3 active:opacity-80">
              <Text className="text-[15px] font-bold text-white">확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
