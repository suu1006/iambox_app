import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

type Props = { header?: ReactNode; children: ReactNode };

// 스크롤 화면의 공통 뼈대: 최대 폭 600px 가운데 정렬과 좌우 24px 여백을 적용한다.
export function ScreenContainer({ header, children }: Props) {
  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>
      <View className="mx-auto w-full max-w-[600px]">
        {header}
        <View className="px-screen">{children}</View>
      </View>
    </ScrollView>
  );
}
