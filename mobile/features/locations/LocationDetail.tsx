import { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/layout';
import { focusAccessibility } from '../../components/ui';
import ChevronRight from '../../assets/chevron-right.svg';
import colors from '@iambox/design-tokens/colors.json';
import { formatLocationPrice } from '../../utils/formatLocationPrice';
import { LocationLogo } from './LocationLogo';
import type { LocationPoint } from '../../types/location';

type Props = { location: LocationPoint; onBack: () => void };

export function LocationDetail({ location, onBack }: Props) {
  const titleRef = useRef<Text>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => focusAccessibility(titleRef));
    return () => cancelAnimationFrame(frame);
  }, [location.id]);

  return (
    <View className="flex-1 bg-surface" onAccessibilityEscape={onBack}>
      <ScreenContainer header={(
        <View className="flex-row items-center gap-3 px-screen pb-3 pt-5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="지도로 돌아가기"
            onPress={onBack}
            className="h-12 w-12 items-center justify-center active:opacity-60"
          >
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <ChevronRight width={24} height={24} color={colors.heading} accessible={false} />
            </View>
          </Pressable>
          <LocationLogo />
          <Text
            ref={titleRef}
            accessibilityRole="header"
            className="min-w-0 flex-1 text-size-26 font-extrabold text-heading"
          >
            {location.name}
          </Text>
        </View>
      )}>
        <Text className="mb-7 text-size-15 leading-6 text-muted">{location.address}</Text>
        <View className="rounded-thumbnail border border-primary-200 bg-primary-50 p-5">
          <Text className="text-size-13 text-muted">예시 요금</Text>
          <Text className="mt-1 text-size-30 font-extrabold tracking-tight text-primary">
            {formatLocationPrice(location.priceFromKrw)}
          </Text>
          <Text className="mt-2 text-body-small text-muted">{location.priceBasis}</Text>
        </View>
        <Text accessibilityRole="header" className="mb-2 mt-7 text-size-18 font-bold text-heading">
          지점 안내
        </Text>
        <Text className="text-size-15 leading-7 text-muted">
          개인 물품을 보관하는 공간의 상세 화면 예시입니다. 실제 시설과 이용 요금은 추후 안내됩니다.
        </Text>
        <View className="mt-section rounded-button bg-canvas p-4">
          <Text className="text-size-13 leading-6 text-muted">
            화면 확인용 예시 데이터입니다. 실제 지점·주소·이용 요금과 다릅니다.
          </Text>
        </View>
      </ScreenContainer>
    </View>
  );
}
