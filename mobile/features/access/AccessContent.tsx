import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import ArrowRight from '../../assets/arrow-right.svg';
import ChevronRight from '../../assets/chevron-right.svg';
import Guide from '../../assets/guide.svg';
import Headset from '../../assets/headset.svg';
import StorageIllustration from '../../assets/imbox_storage_A-024.svg';
import Location from '../../assets/location.svg';
import QrScan from '../../assets/qr-scan.svg';
import { AppHeader, ScreenContainer } from '../../components/layout';
import { Badge, Button, Decorative, InfoDialog, useInfoDialog } from '../../components/ui';
import { mockAccessDetails, mockStorageUsage } from '../../mocks/access';
import colors from '@iambox/design-tokens/colors.json';

// 폭 360px 미만(320px에서 확인)에서는 보관함 그림이 카드 오른쪽에서 잘리지 않도록 크기와 위치를 줄인다.
const compactIllustration = { right: -32, width: 174, height: 130 };

const visitLinks = [
  { key: 'location', label: '지점 위치 · 길찾기', Icon: Location },
  { key: 'guide', label: '출입 방법 안내', Icon: Guide },
] as const;

type Props = { onOpenQr: () => void };

export function AccessContent({ onOpenQr }: Props) {
  const { open, dialogProps } = useInfoDialog();
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 360;
  const largeText = fontScale > 1.2;
  const usage = mockStorageUsage;

  return (
    <>
      <ScreenContainer header={<AppHeader title="이용중인 지점" subtitle="오늘도 가볍게, 아이엠박스" showBrand={false} />}>
        <View className="overflow-hidden rounded-[20px] bg-primary-50 px-4 pt-4">
          <View className={largeText ? 'pb-4' : 'min-h-[126px] justify-center pb-4'}>
            <Decorative
              className={largeText ? 'h-[140px] w-full' : 'absolute -right-9 -top-2 h-[142px] w-[213px]'}
              style={!largeText && compact ? compactIllustration : undefined}
            >
              <StorageIllustration width="100%" height="100%" preserveAspectRatio="xMidYMid meet" accessible={false} />
            </Decorative>
            <Badge label={usage.status} />
            <Text accessibilityRole="header" className={`mt-3 font-bold tracking-tight text-heading ${compact ? 'text-[20px] leading-7' : 'text-[24px] leading-8'}`}>
              {usage.branchName} · {usage.unitNumber}
            </Text>
            <Text className="mt-0.5 text-[16px] leading-6 text-muted">{usage.size} 사이즈 · {usage.floor}</Text>
          </View>

          <View className={`border-t border-primary-200 py-3 ${largeText ? 'gap-3' : 'flex-row'}`}>
            <View className={largeText ? '' : 'flex-1 pr-2'}>
              <Text className="text-[12px] leading-[18px] text-muted">이용 기간</Text>
              <Text className={`mt-1 font-bold leading-6 tracking-tight text-heading ${compact ? 'text-[12px]' : 'text-[14px]'}`}>
                {usage.startsAt} – {usage.endsAt}
              </Text>
            </View>
            {/* 39%는 시안의 구분선 위치에 맞춘 폭, 28%는 좁은 화면에서 이용 기간 날짜가 한 줄에 들어가도록 줄인 폭이다. */}
            <View className={largeText ? '' : `border-l border-primary-200 pl-4 ${compact ? 'w-[28%]' : 'w-[39%]'}`}>
              <Text className="text-[12px] leading-[18px] text-muted">남은 기간</Text>
              <Text className="mt-1 text-[16px] font-bold leading-6 text-heading">{usage.remainingDays}일</Text>
            </View>
          </View>

          <Button
            label="출입 QR 열기"
            LeadingIcon={QrScan}
            accessibilityHint="출입 QR 준비 안내를 엽니다"
            onPress={onOpenQr}
            className="mt-1"
          />
          <Button label="이용 내역 보기" variant="link" TrailingIcon={ArrowRight} onPress={() => open(mockAccessDetails.history)} />
        </View>

        <View className="mt-6">
          <Text accessibilityRole="header" className="px-1 text-[20px] font-bold leading-7 tracking-tight text-heading">방문 시 확인하세요</Text>
          <View>
            {visitLinks.map(({ key, label, Icon }, index) => (
              <Pressable
                key={key}
                accessibilityRole="button"
                onPress={() => open(mockAccessDetails[key])}
                className={`min-h-[58px] flex-row items-center gap-3 px-1 py-3 active:opacity-60 ${index === 0 ? 'border-b border-divider' : ''}`}
              >
                <Icon width={28} height={28} color={colors.muted} accessible={false} />
                <Text className="flex-1 text-[16px] font-medium leading-6 text-heading">{label}</Text>
                <ChevronRight width={22} height={22} color={colors.muted} accessible={false} />
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="도움이 필요하신가요? 문의하기"
          onPress={() => open(mockAccessDetails.support)}
          className={`mt-2 min-h-[50px] gap-2 rounded-lg bg-canvas px-3 py-3 active:opacity-60 ${largeText ? '' : 'flex-row items-center'}`}
        >
          <View className="flex-1 flex-row items-center gap-2">
            <Headset width={24} height={24} color={colors.muted} accessible={false} />
            <Text className="flex-shrink text-[13px] leading-5 text-muted">도움이 필요하신가요?</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="text-[13px] font-bold leading-5 text-primary">문의하기</Text>
            <ArrowRight width={20} height={20} color={colors.primary.DEFAULT} accessible={false} />
          </View>
        </Pressable>
      </ScreenContainer>

      <InfoDialog {...dialogProps} />
    </>
  );
}
