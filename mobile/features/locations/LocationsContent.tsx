import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Keyboard, Pressable, Text, View } from 'react-native';
import { BottomSheet, Button, type BottomSheetHandle } from '../../components/ui';
import { mockLocations } from '../../mocks/locations';
import { LocationMap } from './LocationMap';
import { LocationList } from './LocationList';
import { LocationSearchHeader } from './LocationSearchHeader';
import { LocationFilterModal } from './LocationFilterModal';
import CloseIcon from '../../assets/locations/close.svg';
import colors from '@iambox/design-tokens/colors.json';
import { filterLocations } from '../../utils/filterLocations';
import type { LocationPoint } from '../../types/location';

type Props = {
  onBack: () => void;
  onSelectLocation: (location: LocationPoint) => void;
  isFocused: boolean;
};

export function LocationsContent({ onBack, onSelectLocation, isFocused }: Props) {
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [clusterMemberIds, setClusterMemberIds] = useState<readonly string[] | null>(null);
  const sheetRef = useRef<BottomSheetHandle>(null);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [draftSizes, setDraftSizes] = useState<string[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const locations = useMemo(() => filterLocations(mockLocations, query, selectedSizes), [query, selectedSizes]);
  const draftCount = useMemo(() => filterLocations(mockLocations, query, draftSizes).length, [query, draftSizes]);
  const availableSizes = useMemo(() => [...new Set(mockLocations.flatMap((location) => location.availableSizes ?? []))], []);
  const selectedBranch = locations.find((location) => location.id === selectedBranchId);
  const visibleHighlightedId = selectedBranch?.id;
  const listLocations = clusterMemberIds ? locations.filter((location) => clusterMemberIds.includes(location.id)) : locations;
  useEffect(() => {
    if (selectedBranchId && !locations.some((location) => location.id === selectedBranchId)) setSelectedBranchId(null);
    setClusterMemberIds(null);
  }, [locations]);
  const expandSheet = () => sheetRef.current?.snapToIndex(2);
  const searchHeaderProps = {
    query, filterCount: selectedSizes.length, onChangeQuery: setQuery,
    onFocusSearch: () => sheetRef.current?.snapToIndex(0),
    onOpenFilter: () => {
      Keyboard.dismiss();
      setDraftSizes([...selectedSizes]);
      setFilterVisible(true);
    },
  };
  const selectLocation = useCallback((location: LocationPoint) => {
    Keyboard.dismiss();
    setSelectedBranchId(location.id);
    onSelectLocation(location);
  }, [onSelectLocation]);
  const clearSelection = useCallback(() => {
    setSelectedBranchId(null);
    setClusterMemberIds(null);
  }, []);
  const selectClusterLocations = useCallback((members: readonly LocationPoint[]) => {
    setSelectedBranchId(null);
    setClusterMemberIds(members.map((location) => location.id));
    sheetRef.current?.snapToIndex(2);
  }, []);

  const handleBack = useCallback(() => {
    if (filterVisible) {
      setFilterVisible(false);
    } else if (sheetIndex > 0) {
      Keyboard.dismiss();
      sheetRef.current?.snapToIndex(0);
    } else {
      onBack();
    }
    return true;
  }, [filterVisible, sheetIndex, onBack]);

  useEffect(() => {
    if (!isFocused) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => subscription.remove();
  }, [isFocused, handleBack]);

  return (
    <View
      className="flex-1 bg-surface"
      onAccessibilityEscape={isFocused ? handleBack : undefined}
    >
      <View
        className="flex-1"
        pointerEvents={!isFocused || filterVisible ? 'none' : 'auto'}
        accessibilityElementsHidden={!isFocused || filterVisible}
        importantForAccessibility={!isFocused || filterVisible ? 'no-hide-descendants' : 'auto'}
      >
        <LocationSearchHeader {...searchHeaderProps} />
        <View className="flex-1">
          <LocationMap
            locations={locations}
            selectedLocationId={visibleHighlightedId}
            onSelectLocation={selectLocation}
            onSelectClusterLocations={selectClusterLocations}
          />
          <BottomSheet
            ref={sheetRef}
            onChange={setSheetIndex}
            accessibilityLabel="지점 목록"
          >
            <LocationList
              locations={listLocations}
              selectedLocationId={visibleHighlightedId}
              onSelectLocation={selectLocation}
              emptyMessage="검색 결과가 없어요. 다른 검색어나 사이즈를 선택해 주세요."
              header={selectedSizes.length || clusterMemberIds ? (
                <View>
                {clusterMemberIds && <View className="px-screen pb-3">
                  <Text className="text-size-14 font-bold text-heading">같은 위치의 지점 {listLocations.length}곳</Text>
                  <Button variant="link" label="전체 지점 목록 보기" onPress={clearSelection} />
                </View>}
                <View className="flex-row flex-wrap gap-content px-screen pt-1">
                  {selectedSizes.map((size) => (
                    <Pressable
                      key={size} accessibilityRole="button" accessibilityLabel={`${size} 사이즈 필터 삭제`}
                      onPress={() => setSelectedSizes((sizes) => sizes.filter((value) => value !== size))}
                      className="min-h-[44px] flex-row items-center gap-1 rounded-pill bg-primary-50 px-3 py-2 active:opacity-60"
                    >
                      <Text className="text-size-13 font-bold text-primary">{size} 사이즈</Text>
                      <CloseIcon width={14} height={14} color={colors.primary.DEFAULT} accessible={false} />
                    </Pressable>
                  ))}
                </View>
                </View>
              ) : undefined}
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
    </View>
  );
}
