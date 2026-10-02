import type { ComponentType } from 'react';
import { Pressable, Text, type PressableProps } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { buttonBaseRule, buttonVariants, type ButtonSharedProps } from '../shared/button.ts';

// Pressable의 disabled(null 포함), 이벤트·접근성 확장을 기존처럼 제공한다.
export type ButtonProps = Omit<PressableProps, 'children'> & Omit<ButtonSharedProps, 'disabled'> & {
  LeadingIcon?: ComponentType<SvgProps>;
  TrailingIcon?: ComponentType<SvgProps>;
  className?: string;
};

export function Button({ label, variant = 'primary', LeadingIcon, TrailingIcon, className = '', ...props }: ButtonProps) {
  const rule = buttonVariants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      className={`${buttonBaseRule.containerClassName} ${rule.containerClassName} ${className}`}
      {...props}
    >
      {LeadingIcon && <LeadingIcon width={buttonBaseRule.leadingIconSize} height={buttonBaseRule.leadingIconSize} color={rule.color} accessible={false} />}
      <Text className={`${buttonBaseRule.labelClassName} ${rule.labelClassName}`}>{label}</Text>
      {TrailingIcon && <TrailingIcon width={buttonBaseRule.trailingIconSize} height={buttonBaseRule.trailingIconSize} color={rule.color} accessible={false} />}
    </Pressable>
  );
}
