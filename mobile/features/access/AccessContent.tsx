import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import ArrowRight from '../../assets/arrow-right.svg';
import ChevronRight from '../../assets/chevron-right.svg';
import Guide from '../../assets/guide.svg';
import Headset from '../../assets/headset.svg';
import Location from '../../assets/location.svg';
import QrScan from '../../assets/qr-scan.svg';
import { mockAccessDetails, mockStorageUsage, type AccessDetailKey } from '../../mocks/access';
import colors from '../../theme/colors.json';

// 제공 SVG는 같은 PNG를 base64로 두 번 담은 3.5MB 파일이라 JS 번들에 넣지 않도록 PNG로 추출해 사용한다.
const storageIllustration = require('../../assets/imbox_storage_A-024.png');

const visitLinks = [
  { key: 'location', label: '지점 위치 · 길찾기', Icon: Location },
  { key: 'guide', label: '출입 방법 안내', Icon: Guide },
] as const;

type Props = { onOpenQr: () => void };
type InfoDetailKey = Exclude<AccessDetailKey, 'qr'>;

export function AccessContent({ onOpenQr }: Props) {
  const [detailKey, setDetailKey] = useState<InfoDetailKey | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 360;
  const largeText = fontScale > 1.2;
  const usage = mockStorageUsage;
  // 닫힘 페이드 동안 내용이 비지 않도록 마지막으로 연 안내는 유지하고 표시 여부만 바꾼다.
  const detail = detailKey ? mockAccessDetails[detailKey] : null;
  const openDetail = (key: InfoDetailKey) => {
    setDetailKey(key);
    setDetailVisible(true);
  };
  const closeDetail = () => setDetailVisible(false);

  return (
    <>
      <ScrollView className="flex-1 bg-surface" contentContainerClassName="pb-6" showsVerticalScrollIndicator={false}>
        <View className="mx-auto w-full max-w-[600px] px-6">
          <View className="px-1 pb-[14px] pt-4">
            <Text accessibilityRole="header" className="text-[28px] font-extrabold leading-[38px] tracking-tight text-heading">
              {'이용중인 지점'}
            </Text>
            <Text className="mt-2 text-[15px] leading-[18px] tracking-tight text-muted">오늘도 가볍게, 아이엠박스</Text>
          </View>

          <View className="overflow-hidden rounded-[20px] bg-[#F4F0FF] px-4 pt-4">
            <View className={largeText ? 'pb-4' : 'min-h-[126px] justify-center pb-4'}>
              <View
                pointerEvents="none"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                className={largeText ? 'h-[140px] w-full' : 'absolute -right-9 -top-2 h-[142px] w-[213px]'}
                style={!largeText && compact ? { right: -32, width: 174, height: 130 } : undefined}
              >
                <Image source={storageIllustration} resizeMode="contain" className="h-full w-full" />
              </View>
              <View className="self-start rounded-full bg-primary px-3 py-1">
                <Text className="text-[12px] font-bold leading-[18px] text-white">{usage.status}</Text>
              </View>
              <Text accessibilityRole="header" className={`mt-3 font-bold tracking-tight text-heading ${compact ? 'text-[20px] leading-7' : 'text-[24px] leading-8'}`}>
                {usage.branchName} · {usage.unitNumber}
              </Text>
              <Text className="mt-0.5 text-[16px] leading-6 text-[#5E6573]">{usage.size} 사이즈 · {usage.floor}</Text>
            </View>

            <View className={`border-t border-[#E4DEF2] py-3 ${largeText ? 'gap-3' : 'flex-row'}`}>
              <View className={largeText ? '' : 'flex-1 pr-2'}>
                <Text className="text-[12px] leading-[18px] text-muted">이용 기간</Text>
                <Text className={`mt-1 font-bold leading-6 tracking-tight text-heading ${compact ? 'text-[12px]' : 'text-[14px]'}`}>
                  {usage.startsAt} – {usage.endsAt}
                </Text>
              </View>
              <View className={largeText ? '' : `border-l border-[#E4DEF2] pl-4 ${compact ? 'w-[28%]' : 'w-[39%]'}`}>
                <Text className="text-[12px] leading-[18px] text-muted">남은 기간</Text>
                <Text className="mt-1 text-[16px] font-bold leading-6 text-heading">{usage.remainingDays}일</Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityHint="출입 QR 준비 안내를 엽니다"
              onPress={onOpenQr}
              className="mt-1 min-h-[48px] flex-row items-center justify-center gap-2 rounded-lg bg-primary px-3 py-3 active:opacity-70"
            >
              <QrScan width={26} height={26} color={colors.surface} accessible={false} />
              <Text className="text-[16px] font-bold leading-6 text-white">출입 QR 열기</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => openDetail('history')}
              className="min-h-[52px] flex-row items-center justify-center gap-1 py-3 active:opacity-60"
            >
              <Text className="text-[14px] font-bold leading-6 text-primary">이용 내역 보기</Text>
              <ArrowRight width={21} height={21} color={colors.primary} accessible={false} />
            </Pressable>
          </View>

          <View className="mt-6">
            <Text accessibilityRole="header" className="px-1 text-[20px] font-bold leading-7 tracking-tight text-heading">방문 전 확인하세요</Text>
            <View>
              {visitLinks.map(({ key, label, Icon }, index) => (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  onPress={() => openDetail(key)}
                  className={`min-h-[58px] flex-row items-center gap-3 px-1 py-3 active:opacity-60 ${index === 0 ? 'border-b border-divider' : ''}`}
                >
                  <Icon width={28} height={28} color="#5E6573" accessible={false} />
                  <Text className="flex-1 text-[16px] font-medium leading-6 text-heading">{label}</Text>
                  <ChevronRight width={22} height={22} color="#5E6573" accessible={false} />
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="도움이 필요하신가요? 문의하기"
            onPress={() => openDetail('support')}
            className={`mt-2 min-h-[50px] gap-2 rounded-lg bg-[#F5F6F9] px-3 py-3 active:opacity-60 ${largeText ? '' : 'flex-row items-center'}`}
          >
            <View className="flex-1 flex-row items-center gap-2">
              <Headset width={24} height={24} color="#5E6573" accessible={false} />
              <Text className="flex-shrink text-[13px] leading-5 text-muted">도움이 필요하신가요?</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-[13px] font-bold leading-5 text-primary">문의하기</Text>
              <ArrowRight width={20} height={20} color={colors.primary} accessible={false} />
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <Modal transparent visible={detailVisible} animationType="fade" onRequestClose={closeDetail}>
        <View className="flex-1 justify-center bg-black/40 px-6 py-12">
          <View accessibilityViewIsModal className="mx-auto max-h-full w-full max-w-[420px] rounded-3xl bg-surface p-6">
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text accessibilityRole="header" className="text-[22px] font-bold text-heading">{detail?.title}</Text>
              <Text className="mt-2 text-[14px] leading-5 text-muted">{detail?.description}</Text>
              <View className="my-5 gap-3 rounded-2xl bg-[#F4F0FF] p-4">
                {detail?.lines.map((line) => <Text key={line} className="text-[15px] leading-6 text-heading">{line}</Text>)}
              </View>
            </ScrollView>
            <Pressable accessibilityRole="button" onPress={closeDetail} className="min-h-[48px] items-center justify-center rounded-xl bg-primary px-4 py-3 active:opacity-70">
              <Text className="text-[16px] font-bold text-white">닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
