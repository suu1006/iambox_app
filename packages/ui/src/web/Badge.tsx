import type { HTMLAttributes } from 'react';
import { badgeBaseRule, badgeSizes, badgeTones, type BadgeSharedProps } from '../shared/badge.ts';

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & BadgeSharedProps;
export function Badge({ label, tone = 'solid', size = 'default', style, ...props }: BadgeProps) {
  const sizeRule = badgeSizes[size];
  const toneRule = badgeTones[tone];
  return (
    <span {...props} style={{ display: 'inline-flex', alignSelf: 'flex-start', boxSizing: 'border-box',
      borderRadius: sizeRule.borderRadius, paddingLeft: sizeRule.paddingHorizontal,
      paddingRight: sizeRule.paddingHorizontal, paddingTop: sizeRule.paddingVertical,
      paddingBottom: sizeRule.paddingVertical, width: sizeRule.width,
      textAlign: sizeRule.textAlign, justifyContent: size === 'compact' ? 'center' : undefined,
      fontWeight: badgeBaseRule.fontWeight, fontSize: sizeRule.fontSize,
      lineHeight: `${sizeRule.lineHeight}px`, color: toneRule.color,
      backgroundColor: toneRule.backgroundColor, ...style }}>{label}</span>
  );
}
