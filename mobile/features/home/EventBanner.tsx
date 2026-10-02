import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Text, View } from 'react-native';

// 시안 배너(2022×778)는 문구가 그림에 포함되어 있어 같은 문구를 접근성 라벨로 제공한다.
const BANNER_ASPECT_RATIO = 2022 / 778;

const events = [
  {
    label: '부산 한정 이벤트. 부산에서 보관하면 첫 결제 15% 추가 할인. 부산 4개 지점, 선착순 쿠폰 10장',
    image: require('../../assets/home-event-busan-discount.png'),
  },
  {
    label: '보관함 묶음 할인. 큰 보관함이 꽉 찼다면? 2개 이상 함께 쓰고 할인. 대형 만실인 대상 지점, 사전 신청 필요',
    image: require('../../assets/home-event-storage-bundle.png'),
  },
  {
    label: '이용후기 이벤트. 보관 후기 남기고 최대 10만원 할인쿠폰. 사진 3장, 100자 이상, 검수 후 지급',
    image: require('../../assets/home-event-review-coupon.png'),
  },
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
      style={{ aspectRatio: BANNER_ASPECT_RATIO }}
      className="mt-4 w-full overflow-hidden rounded-[20px] bg-primary-100"
    >
      {width > 0 && (
        // 슬라이드가 측정한 폭으로 컨테이너 크기를 다시 정하지 않도록 레이아웃 흐름에서 뺀다.
        <Animated.View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, flexDirection: 'row', width: width * slides.length, transform: [{ translateX }] }}>
          {slides.map(({ label, image }, index) => (
            <View
              key={`${label}-${index}`}
              style={{ width, height: '100%', flexShrink: 0 }}
              accessibilityElementsHidden={index !== page}
              importantForAccessibility={index === page ? 'auto' : 'no-hide-descendants'}
            >
              <Image
                source={image}
                resizeMode="cover"
                accessible
                accessibilityRole="image"
                accessibilityLabel={label}
                className="h-full w-full"
              />
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
