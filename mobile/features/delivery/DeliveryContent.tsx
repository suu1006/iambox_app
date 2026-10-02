import { useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import colors from '@iambox/design-tokens/colors.json';
import DeliveryHero from '../../assets/delivery_empty_hero.svg';
import LocationIcon from '../../assets/delivery_feature_location.svg';
import BoxIcon from '../../assets/delivery_feature_box.svg';
import BellIcon from '../../assets/delivery_feature_bell.svg';
import InfoIcon from '../../assets/icon_info.svg';
import ChevronRight from '../../assets/chevron-right.svg';
import { AppHeader, ScreenContainer } from '../../components/layout';
import { Button, Decorative } from '../../components/ui';
import { DeliveryModal } from './DeliveryModal';

const features = [
  { Icon: LocationIcon, label: '가까운 보관함에서\n간편 접수' },
  { Icon: BoxIcon, label: '택배 수거부터\n배송까지' },
  { Icon: BellIcon, label: '앱에서\n실시간 배송 조회' },
] as const;

export function DeliveryContent() {
  const [activeModal, setActiveModal] = useState<'use' | 'guide' | null>(null);
  const { width, fontScale } = useWindowDimensions();
  const stackedFeatures = fontScale > 1.3;
  const heroWidth = Math.min(280, Math.max(0, width - 48));

  return (
    <>
      <View
        className="flex-1"
        pointerEvents={activeModal ? 'none' : 'auto'}
        accessibilityElementsHidden={activeModal !== null}
        importantForAccessibility={activeModal ? 'no-hide-descendants' : 'auto'}
      >
        <ScreenContainer header={<AppHeader title="택배" showBrand={false} />}>
          <Decorative className="items-center">
            <DeliveryHero width={heroWidth} height={heroWidth * 220 / 320} preserveAspectRatio="xMidYMid meet" />
          </Decorative>

          <View className="mt-4 items-center">
            <Text accessibilityRole="header" className="text-center text-size-24 font-bold leading-8 tracking-tight text-heading">
              아이엠박스 택배 서비스로{'\n'}
              <Text className="text-primary">간편하게 보내세요</Text>
            </Text>
            <Text className="mt-3 text-center text-size-14 leading-line-22 text-muted">
              가까운 아이엠박스 보관함에서{'\n'}택배를 쉽고 빠르게 보낼 수 있어요.
            </Text>
          </View>

          <View className={`mt-6 ${stackedFeatures ? 'gap-4' : 'flex-row gap-2'}`}>
            {features.map(({ Icon, label }) => (
              <View key={label} className={stackedFeatures ? 'flex-row items-center gap-4' : 'flex-1 items-center'}>
                <Decorative>
                  <Icon width={48} height={48} />
                </Decorative>
                <Text className={`text-body-small text-heading ${stackedFeatures ? 'flex-1' : 'mt-2 text-center'}`}>
                  {label}
                </Text>
              </View>
            ))}
          </View>

          <Button
            label="택배 이용하기"
            accessibilityLabel="택배 이용하기"
            TrailingIcon={ChevronRight}
            onPress={() => setActiveModal('use')}
            className="mt-6 min-h-[52px]"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="이용 방법이 궁금하신가요?"
            onPress={() => setActiveModal('guide')}
            className="mt-4 min-h-[48px] flex-row flex-wrap items-center justify-center gap-1 active:opacity-60"
          >
            <InfoIcon width={20} height={20} accessible={false} />
            <Text className="text-center text-size-13 leading-5 text-muted">이용 방법이 궁금하신가요?</Text>
            <ChevronRight width={16} height={16} color={colors.muted} accessible={false} />
          </Pressable>
        </ScreenContainer>
      </View>
      <DeliveryModal
        visible={activeModal !== null}
        label={activeModal === 'guide' ? '택배 이용 방법' : '택배 이용하기'}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}
