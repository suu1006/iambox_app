'use client';

import type { ButtonHTMLAttributes, ComponentType, CSSProperties, SVGProps } from 'react';
import { buttonBaseRule, buttonVariants, type ButtonSharedProps } from '../shared/button.ts';

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & ButtonSharedProps & {
  LeadingIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  TrailingIcon?: ComponentType<SVGProps<SVGSVGElement>>;
};

export function Button({ label, variant = 'primary', LeadingIcon, TrailingIcon, accessibilityLabel,
  className = '', style, type = 'button', ...props }: ButtonProps) {
  const rule = buttonVariants[variant];
  const containerStyle: CSSProperties & { '--iambox-pressed-opacity': number; '--iambox-focus-color': string } = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
    minHeight: buttonBaseRule.minHeight, paddingTop: buttonBaseRule.paddingVertical,
    paddingBottom: buttonBaseRule.paddingVertical, paddingLeft: rule.paddingHorizontal,
    paddingRight: rule.paddingHorizontal, gap: rule.gap, borderRadius: rule.borderRadius,
    border: 0, backgroundColor: rule.backgroundColor, color: rule.color, fontFamily: 'inherit',
    '--iambox-pressed-opacity': rule.pressedOpacity, '--iambox-focus-color': buttonBaseRule.focusColor, ...style,
  };
  return (
    <button type={type} aria-label={accessibilityLabel}
      className={`iambox-ui-button ${className}`} style={containerStyle} {...props}>
      {LeadingIcon && <LeadingIcon width={buttonBaseRule.leadingIconSize} height={buttonBaseRule.leadingIconSize} color={rule.color} aria-hidden={true} focusable={false} />}
      <span style={{ flexShrink: 1, fontWeight: rule.fontWeight, letterSpacing: rule.letterSpacing,
        lineHeight: `${rule.lineHeight}px`, fontSize: rule.fontSize }}>{label}</span>
      {TrailingIcon && <TrailingIcon width={buttonBaseRule.trailingIconSize} height={buttonBaseRule.trailingIconSize} color={rule.color} aria-hidden={true} focusable={false} />}
    </button>
  );
}
