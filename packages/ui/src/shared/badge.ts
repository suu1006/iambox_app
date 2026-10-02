import colors from '@iambox/design-tokens/colors.json';
import { radii, spacing, typography } from '@iambox/design-tokens';

export type BadgeTone = 'solid' | 'soft' | 'neutral';
export type BadgeSize = 'default' | 'compact';
export type BadgeSharedProps = { label: string; tone?: BadgeTone; size?: BadgeSize };

export const badgeBaseRule = {
  containerClassName: 'self-start',
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
    containerClassName: 'rounded-pill px-3 py-1', labelClassName: 'text-badge',
    borderRadius: radii.pill, paddingHorizontal: spacing['3'], paddingVertical: spacing['1'],
    ...typography.badge, width: undefined, textAlign: 'left',
  },
  compact: {
    containerClassName: 'w-5 items-center rounded-badge py-0.5', labelClassName: 'text-center text-badge-compact',
    borderRadius: radii.badge, paddingHorizontal: spacing['0'], paddingVertical: spacing['0.5'],
    ...typography['badge-compact'],
    width: spacing['5'], textAlign: 'center',
  },
} as const;
