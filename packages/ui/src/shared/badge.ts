import colors from '@iambox/design-tokens/colors.json';

export type BadgeTone = 'solid' | 'soft' | 'neutral';
export type BadgeSize = 'default' | 'compact';
export type BadgeSharedProps = { label: string; tone?: BadgeTone; size?: BadgeSize };

export const badgeBaseRule = {
  containerClassName: 'self-start', labelClassName: 'font-bold', fontWeight: 700,
} as const;
export const badgeTones = {
  solid: {
    containerClassName: 'bg-primary', labelClassName: 'text-onPrimary',
    backgroundColor: colors.primary.DEFAULT, color: colors.onPrimary,
  },
  soft: {
    containerClassName: 'bg-primary-200', labelClassName: 'text-primary',
    backgroundColor: colors.primary[200], color: colors.primary.DEFAULT,
  },
  neutral: {
    containerClassName: 'bg-divider', labelClassName: 'text-muted',
    backgroundColor: colors.divider, color: colors.muted,
  },
} as const;
export const badgeSizes = {
  default: {
    containerClassName: 'rounded-full px-3 py-1', labelClassName: 'text-[12px] leading-[18px]',
    borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 4,
    fontSize: 12, lineHeight: 18, width: undefined, textAlign: 'left',
  },
  compact: {
    containerClassName: 'w-5 items-center rounded-[4px] py-0.5', labelClassName: 'text-center text-[11px] leading-4',
    borderRadius: 4, paddingHorizontal: 0, paddingVertical: 2,
    fontSize: 11, lineHeight: 16, width: 20, textAlign: 'center',
  },
} as const;
