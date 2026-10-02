import colorsSource from './colors.json';
import typeSource from './typography.json';
import spaceSource from './spacing.json';
import radiusSource from './radii.json';
import shadowSource from './shadows.json';

type Aliases<S, R> = S & { [K in keyof R]: number };
type TextStyle = { fontSize: number; lineHeight: number; fontWeight?: number; letterSpacing?: string };
type NativeShadow = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export const colors: typeof colorsSource;
export const fontSizes: typeof typeSource.fontSize;
export const lineHeights: typeof typeSource.lineHeight;
export const fontWeights: typeof typeSource.fontWeight;
export const letterSpacing: typeof typeSource.letterSpacing;
export const fontFamilies: typeof typeSource.fontFamily;
export const spacing: Aliases<typeof spaceSource.scale, typeof spaceSource.roles>;
export const radii: Aliases<typeof radiusSource.scale, typeof radiusSource.roles>;
export const typography: { [K in keyof typeof typeSource.styles]: TextStyle };
export const nativeShadows: { [K in keyof typeof shadowSource]: NativeShadow };
