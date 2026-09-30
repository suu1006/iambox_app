import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import StorageBoxes from '../../assets/01_storage_boxes.svg';
import MovingTruck from '../../assets/02_moving_truck.svg';
import BranchMapPin from '../../assets/03_branch_map_pin.svg';
import StartupStore from '../../assets/04_startup_store.svg';
import { Badge, Decorative } from '../../components/ui';

const events = [
  { title: '첫 보관의 시작을 응원해요', Icon: StorageBoxes },
  { title: '새로운 시작, 이사도 가볍게', Icon: MovingTruck },
  { title: '내 주변 보관 공간을 만나보세요', Icon: BranchMapPin },
  { title: 'iambox와 함께 성장해요', Icon: StartupStore },
];

// 마지막 카드도 왼쪽으로 넘긴 뒤, 같은 모습의 첫 카드로 위치만 되돌린다.
const slides = [...events, events[0]];

export function EventBanner() {
  const [page, setPage] = useState(0);
  const [width, setWidth] = useState(0);
  const currentPage = useRef(0);
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (width <= 0) return;

    let active = true;
    translateX.setValue(-currentPage.current * width);

    const timer = setInterval(() => {
      const nextPage = currentPage.current + 1;
      Animated.timing(translateX, {
        toValue: -nextPage * width,
        duration: 500,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!active || !finished) return;
        currentPage.current = nextPage % events.length;
        if (nextPage === events.length) translateX.setValue(0);
        setPage(currentPage.current);
      });
    }, 4000);

    return () => {
      active = false;
      clearInterval(timer);
      translateX.stopAnimation();
    };
  }, [translateX, width]);

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      className="mt-4 min-h-[135px] overflow-hidden rounded-[20px] bg-primary-100"
    >
      {width > 0 && (
        <Animated.View style={{ flexDirection: 'row', width: width * slides.length, transform: [{ translateX }] }}>
          {slides.map(({ title, Icon }, index) => (
            <View
              key={`${title}-${index}`}
              style={{ width, flexShrink: 0 }}
              accessibilityElementsHidden={index !== page}
              importantForAccessibility={index === page ? 'auto' : 'no-hide-descendants'}
              className="min-h-[135px] flex-row items-center pb-7 pl-4 pr-2 pt-4"
            >
              <View className="flex-1">
                <Badge label="이벤트 예시" tone="soft" />
                <Text accessibilityRole="header" className="mt-2 text-[17px] font-bold leading-6 text-heading">{title}</Text>
              </View>
              <Decorative className="h-[85px] w-[100px]">
                <Icon width="100%" height="100%" />
              </Decorative>
            </View>
          ))}
        </Animated.View>
      )}
      <View className="absolute bottom-2 right-4 items-center justify-center rounded-full bg-divider px-2.5 py-1">
        <Text accessibilityLabel={`전체 ${events.length}개 이벤트 중 ${page + 1}번째`} className="text-[11px] leading-[14px] text-muted">
          {page + 1}/{events.length}
        </Text>
      </View>
    </View>
  );
}
