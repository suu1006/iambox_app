import type { ComponentType } from 'react';
import { Pressable, Text, type PressableProps } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import colors from '../../theme/colors.json';

type Variant = 'primary' | 'link';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  LeadingIcon?: ComponentType<SvgProps>;
  TrailingIcon?: ComponentType<SvgProps>;
  className?: string;
};

const variants = {
  primary: {
    container: 'gap-2 rounded-xl bg-primary px-4 active:opacity-70',
    label: 'text-[16px] text-onPrimary',
    iconColor: colors.onPrimary,
  },
  link: {
    container: 'gap-1 active:opacity-60',
    label: 'text-[14px] text-primary',
    iconColor: colors.primary.DEFAULT,
  },
} as const;

export function Button({ label, variant = 'primary', LeadingIcon, TrailingIcon, className = '', ...props }: Props) {
  const style = variants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-[48px] flex-row items-center justify-center py-3 ${style.container} ${className}`}
      {...props}
    >
      {LeadingIcon && <LeadingIcon width={24} height={24} color={style.iconColor} accessible={false} />}
      <Text className={`font-bold leading-6 ${style.label}`}>{label}</Text>
      {TrailingIcon && <TrailingIcon width={20} height={20} color={style.iconColor} accessible={false} />}
    </Pressable>
  );
}
