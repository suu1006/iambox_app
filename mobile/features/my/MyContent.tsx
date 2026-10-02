import type { ComponentType } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import ChevronRight from '../../assets/chevron-right.svg';
import ProfileIcon from '../../assets/my/profile.svg';
import SettingsIcon from '../../assets/my/settings.svg';
import BoxIcon from '../../assets/my/box.svg';
import HistoryIcon from '../../assets/my/history.svg';
import PaymentIcon from '../../assets/my/payment.svg';
import HeadsetIcon from '../../assets/my/headset.svg';
import NotificationIcon from '../../assets/my/notification.svg';
import DeliveryIcon from '../../assets/my/delivery.svg';
import ReservationIcon from '../../assets/my/reservation.svg';
import CareIcon from '../../assets/my/care.svg';
import NoticeIcon from '../../assets/my/notice.svg';
import FaqIcon from '../../assets/my/faq.svg';
import { ScreenContainer } from '../../components/layout';
import { Decorative, InfoDialog, useInfoDialog } from '../../components/ui';
import { mockAccessDetails } from '../../mocks/access';
import { mockMyDialogs } from '../../mocks/my';
import colors from '@iambox/design-tokens/colors.json';

type Icon = ComponentType<SvgProps>;
type MenuItem = { label: string; Icon: Icon; onPress: () => void };

function MenuSection({ title, items, className = '' }: { title: string; items: MenuItem[]; className?: string }) {
  return (
    <View className={className}>
      <Text accessibilityRole="header" className="mb-2 text-section-title text-heading">{title}</Text>
      {items.map(({ label, Icon, onPress }) => (
        <Pressable
          key={label}
          accessibilityRole="button"
          onPress={onPress}
          className="min-h-[48px] flex-row items-center gap-4 py-2.5 active:opacity-60"
        >
          <Icon width={28} height={28} color={colors.muted} accessible={false} />
          <Text className="flex-1 text-body text-heading">{label}</Text>
          <ChevronRight width={20} height={20} color={colors.muted} accessible={false} />
        </Pressable>
      ))}
    </View>
  );
}

type Props = { onMyBoxPress: () => void };

export function MyContent({ onMyBoxPress }: Props) {
  const { open, dialogProps } = useInfoDialog();
  const { width, fontScale } = useWindowDimensions();
  const largeText = fontScale > 1.2;
  const compact = width < 360;
  const shortcuts: MenuItem[] = [
    { label: '나의 박스', Icon: BoxIcon, onPress: onMyBoxPress },
    { label: '이용 내역', Icon: HistoryIcon, onPress: () => open(mockAccessDetails.history) },
    { label: '결제 내역', Icon: PaymentIcon, onPress: () => open(mockMyDialogs.payments) },
    { label: '문의하기', Icon: HeadsetIcon, onPress: () => open(mockAccessDetails.support) },
  ];
  const management: MenuItem[] = [
    { label: '알림설정', Icon: NotificationIcon, onPress: () => open(mockMyDialogs.notifications) },
    { label: '택배예약', Icon: DeliveryIcon, onPress: () => open(mockMyDialogs.delivery) },
    { label: '사전예약', Icon: ReservationIcon, onPress: () => open(mockMyDialogs.reservation) },
    { label: '케어서비스', Icon: CareIcon, onPress: () => open(mockMyDialogs.care) },
  ];
  const support: MenuItem[] = [
    { label: '공지사항', Icon: NoticeIcon, onPress: () => open(mockMyDialogs.notices) },
    { label: 'FAQ', Icon: FaqIcon, onPress: () => open(mockMyDialogs.faq) },
    { label: '문의하기', Icon: HeadsetIcon, onPress: () => open(mockAccessDetails.support) },
  ];

  return (
    <>
      <ScreenContainer>
        <View className="flex-row items-center gap-4 pt-8">
          <Decorative className={`translate-y-2 items-center justify-center rounded-pill bg-primary-50 ${compact || largeText ? 'h-14 w-14' : 'h-[72px] w-[72px]'}`}>
            <ProfileIcon width={compact || largeText ? 32 : 40} height={compact || largeText ? 32 : 40} color={colors.primary[300]} />
          </Decorative>
          <View className="flex-1" style={{ marginTop: 25 }}>
            <Text className="text-size-22 font-bold leading-8 text-heading">박스맨님</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => open(mockMyDialogs.profile)}
              className="min-h-[44px] flex-row items-center self-start gap-1 pb-4 pt-1 active:opacity-60"
            >
              <Text className="text-size-14 font-bold leading-5 text-primary">내 정보 관리</Text>
              <ChevronRight width={18} height={18} color={colors.primary.DEFAULT} accessible={false} />
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="설정"
            onPress={() => open(mockMyDialogs.settings)}
            className="h-12 w-12 shrink-0 items-center justify-center active:opacity-60"
          >
            <SettingsIcon width={28} height={28} color={colors.muted} accessible={false} />
          </Pressable>
        </View>

        <View className={`flex-row ${largeText ? 'flex-wrap' : ''}`}>
          {shortcuts.map(({ label, Icon, onPress }) => (
            <Pressable
              key={label}
              accessibilityRole="button"
              onPress={onPress}
              className={`items-center gap-content py-2 active:opacity-60 ${largeText ? 'mb-3 w-1/2' : 'flex-1'}`}
            >
              <View className={`items-center justify-center rounded-pill bg-primary-50 ${compact ? 'h-14 w-14' : 'h-[60px] w-[60px]'}`}>
                <Icon width={32} height={32} color={colors.primary.DEFAULT} accessible={false} />
              </View>
              <Text className="text-center text-body-small text-heading">{label}</Text>
            </Pressable>
          ))}
        </View>

        <MenuSection title="이용 관리" items={management} className="mt-section" />
        <MenuSection title="고객지원" items={support} className="mt-section" />

        <Pressable
          accessibilityRole="button"
          onPress={() => open(mockMyDialogs.logout)}
          className="mt-8 min-h-[48px] items-center justify-center rounded-button border border-primary-200 bg-primary-50 px-4 py-3 active:opacity-60"
        >
          <Text className="text-size-16 font-semibold leading-6 text-muted">로그아웃</Text>
        </Pressable>
        <View className="mt-3 flex-row flex-wrap items-center justify-center">
          <Pressable accessibilityRole="button" onPress={() => open(mockMyDialogs.terms)} className="min-h-[44px] justify-center px-2 py-3 active:opacity-60">
            <Text className="text-size-12 leading-5 text-muted">이용약관</Text>
          </Pressable>
          <Text accessible={false} className="text-size-12 text-subtle">|</Text>
          <Pressable accessibilityRole="button" onPress={() => open(mockMyDialogs.privacy)} className="min-h-[44px] justify-center px-2 py-3 active:opacity-60">
            <Text className="text-size-12 leading-5 text-muted">개인정보처리방침</Text>
          </Pressable>
        </View>
      </ScreenContainer>
      <InfoDialog {...dialogProps} />
    </>
  );
}
