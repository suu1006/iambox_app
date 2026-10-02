import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheet, Button, type BottomSheetHandle } from '../../components/ui';
import { mockLocations } from '../../mocks/locations';
import { LocationDetail } from './LocationDetail';
import { LocationMap } from './LocationMap';
import { LocationList } from './LocationList';
import { LocationSearchHeader } from './LocationSearchHeader';
import { LocationFilterModal } from './LocationFilterModal';
import CloseIcon from '../../assets/locations/close.svg';
import colors from '@iambox/design-tokens/colors.json';
import { filterLocations } from '../../utils/filterLocations';
import type { LocationPoint } from '../../types/location';

type Props = { onBack: () => void };

export function LocationsContent({ onBack }: Props) {
  const [selectedLocation, setSelectedLocation] = useState<LocationPoint | null>(null);
  const [highlightedLocationId, setHighlightedLocationId] = useState<string>();
  const sheetRef = useRef<BottomSheetHandle>(null);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [draftSizes, setDraftSizes] = useState<string[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const locations = useMemo(() => filterLocations(mockLocations, query, selectedSizes), [query, selectedSizes]);
  const draftCount = useMemo(() => filterLocations(mockLocations, query, draftSizes).length, [query, draftSizes]);
  const availableSizes = useMemo(() => [...new Set(mockLocations.flatMap((location) => location.availableSizes ?? []))], []);
  const visibleHighlightedId = locations.some((location) => location.id === highlightedLocationId) ? highlightedLocationId : undefined;
  const expandSheet = () => sheetRef.current?.snapToIndex(2);
  const collapseSheet = () => {
    Keyboard.dismiss();
    sheetRef.current?.snapToIndex(0);
  };
  const searchHeaderProps = {
    query, filterCount: selectedSizes.length, onChangeQuery: setQuery, onFocus: expandSheet,
    onOpenFilter: () => {
      Keyboard.dismiss();
      setDraftSizes([...selectedSizes]);
      setFilterVisible(true);
    },
  };
  const closeDetail = useCallback(() => setSelectedLocation(null), []);
  const openDetail = useCallback((location: LocationPoint) => {
    Keyboard.dismiss();
    setHighlightedLocationId(location.id);
    setSelectedLocation(location);
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedLocation) {
        closeDetail();
        return true;
      }
      if (sheetIndex > 0) {
        Keyboard.dismiss();
        sheetRef.current?.snapToIndex(0);
        return true;
      }
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [selectedLocation, closeDetail, sheetIndex, onBack]);

  return (
    <View
      className="flex-1 bg-surface"
      onAccessibilityEscape={() => {
        if (selectedLocation) closeDetail();
        else onBack();
      }}
    >
      <View
        className="flex-1"
        pointerEvents={selectedLocation || filterVisible ? 'none' : 'auto'}
        accessibilityElementsHidden={!!selectedLocation || filterVisible}
        importantForAccessibility={selectedLocation || filterVisible ? 'no-hide-descendants' : 'auto'}
      >
        <LocationSearchHeader {...searchHeaderProps} />
        <View className="flex-1">
          <LocationMap
            locations={locations}
            selectedLocationId={visibleHighlightedId}
            onSelectLocation={openDetail}
          />
          <BottomSheet
            ref={sheetRef}
            onChange={setSheetIndex}
            accessibilityLabel="지점 목록"
            header={(
              <View className="flex-row items-center justify-between gap-3 px-6 pb-4">
                <Text accessibilityRole="header" accessibilityLiveRegion="polite" className="flex-1 text-[17px] font-bold text-heading">
                  {query.trim() || selectedSizes.length ? '검색 결과' : '예시 지점'} {locations.length}곳
                </Text>
                <Button
                  variant="link"
                  label={sheetIndex > 0 ? '접기' : '펼치기'}
                  accessibilityLabel={sheetIndex > 0 ? '지점 목록 접기' : '지점 목록 펼치기'}
                  onPress={sheetIndex > 0 ? collapseSheet : expandSheet}
                />
              </View>
            )}
          >
            <LocationList
              locations={locations}
              selectedLocationId={visibleHighlightedId}
              onSelectLocation={openDetail}
              visible={sheetIndex > 0}
              emptyMessage="검색 결과가 없어요. 다른 검색어나 사이즈를 선택해 주세요."
              header={(
                <View className="px-6 pt-1">
                  {!!selectedSizes.length && (
                    <View className="flex-row flex-wrap gap-2">
                      {selectedSizes.map((size) => (
                        <Pressable
                          key={size} accessibilityRole="button" accessibilityLabel={`${size} 사이즈 필터 삭제`}
                          onPress={() => setSelectedSizes((sizes) => sizes.filter((value) => value !== size))}
                          className="min-h-[44px] flex-row items-center gap-1 rounded-full bg-primary-50 px-3 py-2 active:opacity-60"
                        >
                          <Text className="text-[13px] font-bold text-primary">{size} 사이즈</Text>
                          <CloseIcon width={14} height={14} color={colors.primary.DEFAULT} accessible={false} />
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              )}
            />
          </BottomSheet>
        </View>
      </View>
      <LocationFilterModal
        visible={filterVisible} availableSizes={availableSizes} selectedSizes={draftSizes} resultCount={draftCount}
        onToggleSize={(size) => setDraftSizes((sizes) => sizes.includes(size) ? sizes.filter((value) => value !== size) : [...sizes, size])}
        onReset={() => setDraftSizes([])}
        onClose={() => setFilterVisible(false)}
        onApply={() => {
          setSelectedSizes([...draftSizes]);
          setFilterVisible(false);
          expandSheet();
        }}
      />
      {selectedLocation && (
        <View style={StyleSheet.absoluteFill}>
          <LocationDetail location={selectedLocation} onBack={closeDetail} />
        </View>
      )}
    </View>
  );
}
