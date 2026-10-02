import { fontSizes, spacing } from '@iambox/design-tokens';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import SearchIcon from '../../assets/locations/search.svg';
import FilterIcon from '../../assets/locations/filter.svg';
import CloseIcon from '../../assets/locations/close.svg';
import colors from '@iambox/design-tokens/colors.json';

type Props = {
  query: string;
  filterCount: number;
  onChangeQuery: (query: string) => void;
  onFocusSearch: () => void;
  onOpenFilter: () => void;
};

export function LocationSearchHeader({
  query, filterCount, onChangeQuery, onFocusSearch, onOpenFilter,
}: Props) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 320 || fontScale > 1.5;
  return (
    <View className={`gap-content px-screen pb-6 pt-3 ${stacked ? '' : 'flex-row items-center'}`}>
      <View className={`min-h-[48px] flex-row items-center gap-content rounded-button bg-canvas pl-3 ${stacked ? '' : 'min-w-0 flex-1'}`}>
        <SearchIcon width={20} height={20} color={colors.muted} accessible={false} />
        <TextInput
          accessibilityLabel="지역·지점명 검색"
          placeholder="지역·지점명 검색"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={onChangeQuery}
          onFocus={onFocusSearch}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          style={styles.input}
        />
        {!!query && (
          <Pressable
            accessibilityRole="button" accessibilityLabel="검색어 지우기"
            onPress={() => onChangeQuery('')}
            className="min-h-[48px] min-w-[44px] items-center justify-center active:opacity-60"
          >
            <CloseIcon width={16} height={16} color={colors.muted} accessible={false} />
          </Pressable>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={filterCount ? `사이즈 필터, ${filterCount}개 적용됨` : '사이즈 필터'}
        accessibilityHint="이용 가능한 사이즈를 선택합니다."
        onPress={onOpenFilter}
        className={`min-h-[48px] flex-row items-center justify-center gap-1.5 rounded-button border px-3 py-3 active:opacity-60 ${filterCount ? 'border-primary bg-primary-50' : 'border-divider bg-surface'}`}
      >
        <FilterIcon width={20} height={20} color={filterCount ? colors.primary.DEFAULT : colors.heading} accessible={false} />
        <Text className={`text-size-14 font-bold ${filterCount ? 'text-primary' : 'text-heading'}`}>
          {filterCount ? `필터 ${filterCount}` : '필터'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 48, minWidth: 0, flex: 1, paddingVertical: spacing['3'], fontSize: fontSizes['16'], color: colors.heading },
});
