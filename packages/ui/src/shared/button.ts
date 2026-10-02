import colors from '@iambox/design-tokens/colors.json';
import { radii, spacing, typography } from '@iambox/design-tokens';

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
  labelClassName: 'flex-shrink',
  minHeight: 48, paddingVertical: spacing['3'],
  leadingIconSize: 24, trailingIconSize: 20,
  focusColor: colors.primary.DEFAULT,
} as const;

export const buttonVariants = {
  primary: {
    containerClassName: 'gap-content rounded-button bg-primary px-4 active:opacity-70',
    labelClassName: 'text-button text-onPrimary',
    color: colors.onPrimary, backgroundColor: colors.primary.DEFAULT,
    gap: spacing.content, borderRadius: radii.button, paddingHorizontal: spacing['4'],
    ...typography.button, pressedOpacity: 0.7,
  },
  link: {
    containerClassName: 'gap-1 active:opacity-60',
    labelClassName: 'text-button-link text-primary',
    color: colors.primary.DEFAULT, backgroundColor: 'transparent',
    gap: spacing['1'], borderRadius: radii.none, paddingHorizontal: spacing['0'],
    ...typography['button-link'], pressedOpacity: 0.6,
  },
} as const;
