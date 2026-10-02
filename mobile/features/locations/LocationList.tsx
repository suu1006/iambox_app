import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import type { ReactNode } from 'react';
import { Badge, BottomSheetFlatList } from '../../components/ui';
import LocationIcon from '../../assets/location.svg';
import colors from '@iambox/design-tokens/colors.json';
import { formatLocationPrice } from '../../utils/formatLocationPrice';
import type { LocationPoint } from '../../types/location';

export type LocationListProps = {
  locations: readonly LocationPoint[];
  selectedLocationId?: string;
  onSelectLocation: (location: LocationPoint) => void;
  header?: ReactNode;
  visible?: boolean;
  emptyMessage?: string;
};

/** Sheet-aware list. Selection and navigation belong to the parent screen. */
export function LocationList({
  locations, selectedLocationId, onSelectLocation, header, visible = true,
  emptyMessage = '표시할 지점이 없습니다.',
}: LocationListProps) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 320 || fontScale > 1.5;
  const imageSize = width < 360 ? 88 : 112;

  return (
    <BottomSheetFlatList<LocationPoint>
      data={locations}
      keyExtractor={(location: LocationPoint) => location.id}
      extraData={selectedLocationId}
      style={{ opacity: visible ? 1 : 0 }}
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ paddingBottom: 24 }}
      ListHeaderComponent={(
        <View>
          {header}
          <Text className="px-6 pb-3 pt-4 text-[13px] leading-5 text-muted">
            화면 확인용 예시 지점·이미지·요금·이용 가능 사이즈입니다. 실제 운영 정보와 다릅니다.
          </Text>
        </View>
      )}
      ListEmptyComponent={(
        <View className="px-6 py-10">
          <Text className="text-center text-[15px] leading-6 text-muted">{emptyMessage}</Text>
        </View>
      )}
      ItemSeparatorComponent={() => <View className="mx-6 h-px bg-divider" />}
      renderItem={({ item: location }: { item: LocationPoint }) => {
        const selected = selectedLocationId === location.id;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${location.name} 상세 보기, ${location.address}, 이용 가능한 사이즈 ${location.availableSizes?.join(', ') || '정보 없음'}, 최저가 ${formatLocationPrice(location.priceFromKrw)}`}
            accessibilityState={{ selected }}
            onPress={() => onSelectLocation(location)}
            className={`min-h-[48px] px-6 py-5 active:opacity-60 ${selected ? 'bg-primary-50' : 'bg-surface'}`}
          >
            <View className={stacked ? 'gap-4' : 'flex-row items-start gap-4'}>
              <View
                accessible={false}
                className="items-center justify-center overflow-hidden rounded-2xl bg-canvas"
                style={location.photoSource
                  ? { width: imageSize, height: imageSize + 8 }
                  : { width: imageSize, minHeight: imageSize + 8, paddingVertical: 12 }}
              >
                {location.photoSource ? (
                  <Image
                    accessible={false}
                    source={location.photoSource}
                    resizeMode="cover"
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <>
                    <LocationIcon width={28} height={28} color={colors.inactive} accessible={false} />
                    <Text className="mt-2 text-center text-[12px] leading-5 text-muted">이미지 준비 중</Text>
                  </>
                )}
              </View>
              <View className={stacked ? 'min-w-0' : 'min-w-0 flex-1'}>
                <Text className="text-[18px] font-bold leading-6 text-primary">{location.name}</Text>
                <View className="mt-1 flex-row items-center gap-1">
                  <LocationIcon width={16} height={16} color={colors.muted} accessible={false} />
                  <Text className="min-w-0 flex-1 text-[13px] leading-5 text-heading">{location.address}</Text>
                </View>
                {!!location.availableSizes?.length && (
                  <View className="mt-2 flex-row flex-wrap items-center gap-1.5">
                    <Text className="text-[13px] leading-5 text-muted">이용가능 :</Text>
                    {location.availableSizes.map((size) => (
                      <Badge key={size} label={size} tone="neutral" size="compact" />
                    ))}
                  </View>
                )}
                <Text className="mt-2 text-[12px] font-bold leading-5 text-muted">최저가</Text>
                <Text className="text-[22px] font-extrabold leading-8 text-heading">
                  {formatLocationPrice(location.priceFromKrw)}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );
}
