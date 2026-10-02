import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { EventBanner } from './EventBanner';
import StorageBoxes from '../../assets/01_storage_boxes.svg';
import StartupStore from '../../assets/04_startup_store.svg';
import HomeDelivery from '../../assets/home-delivery.svg';
import StorageIllustration from '../../assets/imbox_storage_A-024.svg';
import HomePreVisit from '../../assets/home-pre-visit.svg';
import HomeStartup from '../../assets/home-startup.svg';
import HomeLocation from '../../assets/home-location.svg';
import HomeOnsite from '../../assets/home-onsite.svg';
import HomeNotice from '../../assets/home-notice.svg';
import ChevronRight from '../../assets/chevron-right.svg';
import { BrandLogo, ScreenContainer } from '../../components/layout';
import { Decorative, InfoDialog, useInfoDialog, type DialogContent } from '../../components/ui';
import colors from '@iambox/design-tokens/colors.json';

const services = [
  { title: '택배요청', description: '간편하게 접수하세요', Icon: HomeDelivery },
  { title: '사전방문', description: '방문 전에 둘러보세요', Icon: HomePreVisit },
];

const shortcuts = [
  { title: '창업문의', Icon: HomeStartup },
  { title: '지점 찾기', Icon: HomeLocation },
  { title: 'AI 견적', Icon: HomeOnsite },
  { title: '공지사항', Icon: HomeNotice },
];

type Props = { onLocationsPress: () => void };

const serviceInfo = (title: string): DialogContent => ({ title, description: '서비스 이용 안내를 준비하고 있어요.' });

// 지점 찾기는 기존 탭으로 연결한다. 나머지 서비스는 실제 접수 전 준비 안내만 표시한다.
export function HomeContent({ onLocationsPress }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const { open, dialogProps } = useInfoDialog();
  const openServiceInfo = (title: string) => open(serviceInfo(title));

  return (
    <>
      <ScreenContainer>
        <View className="relative overflow-hidden pb-5 pt-5">
          <BrandLogo />
          <View className="mt-section flex-row items-center">
            <Text accessibilityRole="header" className="flex-1 text-size-26 font-extrabold leading-line-36 tracking-tight text-heading">
              {'짐 걱정은 덜고,\n'}
              <Text className="text-primary">일상은 가볍게</Text>
            </Text>
            <Decorative className="h-[110px] w-[95px] rounded-thumbnail bg-primary-50">
              <StorageBoxes width="100%" height="100%" />
            </Decorative>
          </View>
        </View>

        <View className="flex-row items-stretch gap-2.5">
          <View className="min-w-0 flex-1">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="물품 보관"
              onPress={() => openServiceInfo('물품 보관')}
              className="min-w-0 flex-1 overflow-hidden rounded-card bg-primary px-4 pb-4 pt-5 active:opacity-80"
            >
              <View className="flex-row items-center justify-between gap-1">
                <Text className="flex-1 text-size-18 font-bold leading-6 tracking-tight text-onPrimary">물품 보관</Text>
                <ChevronRight width={18} height={18} color={colors.onPrimary} accessible={false} />
              </View>
              <Text className="mt-2 text-body-small text-onPrimaryMuted">{compact ? '소중한 짐을\n안전하게\n보관하세요' : '소중한 짐을\n안전하게 보관하세요'}</Text>
              <Decorative className="mt-section min-h-[126px] flex-1 justify-end">
                <StorageIllustration
                  width="100%"
                  height={126}
                  preserveAspectRatio="xMidYMid meet"
                  style={{ transform: [{ scale: 1.25 }] }}
                />
              </Decorative>
            </Pressable>
          </View>

          <View className="min-w-0 flex-1 gap-2.5">
            {services.map(({ title, description, Icon }) => (
              <Pressable
                key={title}
                accessibilityRole="button"
                accessibilityLabel={title}
                onPress={() => openServiceInfo(title)}
                className="min-h-[128px] grow shrink-0 overflow-hidden rounded-card bg-primary-50 px-3.5 pb-1 pt-3.5 active:opacity-80"
              >
                <View className="flex-row items-center justify-between gap-1">
                  <Text className="flex-1 text-size-17 font-bold leading-6 tracking-tight text-heading">{title}</Text>
                  <ChevronRight width={17} height={17} color={colors.inactive} accessible={false} />
                </View>
                <Text className="mt-1 text-caption tracking-tight text-muted">{compact && title === '사전방문' ? '방문 전에\n둘러보세요' : description}</Text>
                <Decorative className="mt-1 h-[62px] w-full max-w-[114px] self-end">
                  <Icon width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
                </Decorative>
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
              <Decorative className="h-16 w-16 items-center justify-center rounded-pill bg-primary-50">
                <Icon width={32} height={32} color={colors.primary.DEFAULT} />
              </Decorative>
              <Text className="mt-2 text-center text-size-12 font-semibold leading-line-18 tracking-tight text-muted">{title}</Text>
            </Pressable>
          ))}
        </View>

        <EventBanner />

        <View className="mb-3 mt-section flex-row items-center justify-between">
          <Text accessibilityRole="header" className="text-size-22 font-bold text-heading">생생후기</Text>
          <Text className="text-size-13 text-muted">전체보기 ›</Text>
        </View>
        <View className="flex-row items-center gap-3 rounded-card border border-divider bg-surface p-3">
          <Decorative className="h-[82px] w-[88px] items-center justify-center rounded-button bg-primary-50">
            <StartupStore width="100%" height="100%" />
          </Decorative>
          <View className="flex-1">
            <Text accessibilityLabel="별점 5점 만점에 5점" className="text-size-18 tracking-rating text-rating">★★★★★</Text>
            <Text className="mt-1 text-size-15 font-bold leading-line-22 text-heading">이사 날짜가 안 맞아도 안심이에요</Text>
            <Text className="mt-1 text-size-12 text-muted">보관 이용 후기 · 예시</Text>
          </View>
        </View>
      </ScreenContainer>
      <InfoDialog {...dialogProps} confirmLabel="확인" />
    </>
  );
}
