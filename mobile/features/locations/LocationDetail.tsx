import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { AppHeader, ScreenContainer } from '../../components/layout';
import { Button, focusAccessibility } from '../../components/ui';
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
      <ScreenContainer header={<AppHeader title="지점 상세" showBrand={false} />}>
        <Button
          variant="link"
          label="지도로 돌아가기"
          onPress={onBack}
          className="mb-6 self-start"
        />
        <View className="mb-3 flex-row items-center gap-3">
          <LocationLogo />
          <Text
            ref={titleRef}
            accessibilityRole="header"
            className="flex-1 text-[26px] font-extrabold text-heading"
          >
            {location.name}
          </Text>
        </View>
        <Text className="mb-7 text-[15px] leading-6 text-muted">{location.address}</Text>
        <View className="rounded-2xl border border-primary-200 bg-primary-50 p-5">
          <Text className="text-[13px] text-muted">예시 요금</Text>
          <Text className="mt-1 text-[30px] font-extrabold tracking-tight text-primary">
            {formatLocationPrice(location.priceFromKrw)}
          </Text>
          <Text className="mt-2 text-[13px] leading-5 text-muted">{location.priceBasis}</Text>
        </View>
        <Text accessibilityRole="header" className="mb-2 mt-7 text-[18px] font-bold text-heading">
          지점 안내
        </Text>
        <Text className="text-[15px] leading-7 text-muted">
          개인 물품을 보관하는 공간의 상세 화면 예시입니다. 실제 시설과 이용 요금은 추후 안내됩니다.
        </Text>
        <View className="mt-6 rounded-xl bg-canvas p-4">
          <Text className="text-[13px] leading-6 text-muted">
            화면 확인용 예시 데이터입니다. 실제 지점·주소·이용 요금과 다릅니다.
          </Text>
        </View>
      </ScreenContainer>
    </View>
  );
}
