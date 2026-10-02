import colors from '@iambox/design-tokens/colors.json';

export type ButtonVariant = 'primary' | 'link';
export type ButtonSharedProps = {
  label: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  accessibilityLabel?: string;
};

// 클래스는 NativeWind가 정적으로 탐색하며, 수치·색상은 HTML 렌더러가 사용한다.
// 두 플랫폼의 variant 정의는 이곳에서 함께 관리한다.
export const buttonBaseRule = {
  containerClassName: 'min-h-[48px] flex-row items-center justify-center py-3',
  labelClassName: 'flex-shrink font-bold leading-6',
  minHeight: 48, paddingVertical: 12, fontWeight: 700, lineHeight: 24,
  leadingIconSize: 24, trailingIconSize: 20,
  focusColor: colors.primary.DEFAULT,
} as const;

export const buttonVariants = {
  primary: {
    containerClassName: 'gap-2 rounded-xl bg-primary px-4 active:opacity-70',
    labelClassName: 'text-[16px] text-onPrimary',
    color: colors.onPrimary, backgroundColor: colors.primary.DEFAULT,
    gap: 8, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, pressedOpacity: 0.7,
  },
  link: {
    containerClassName: 'gap-1 active:opacity-60',
    labelClassName: 'text-[14px] text-primary',
    color: colors.primary.DEFAULT, backgroundColor: 'transparent',
    gap: 4, borderRadius: 0, paddingHorizontal: 0, fontSize: 14, pressedOpacity: 0.6,
  },
} as const;
