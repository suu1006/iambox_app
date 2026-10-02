import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import colors from '@iambox/design-tokens/colors.json';
import { fontFamilies, spacing } from '@iambox/design-tokens';
import '@iambox/ui/web.css';
import './globals.css';

export const metadata: Metadata = {
  title: '아이엠박스',
  description: '아이엠박스',
  icons: { icon: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${colors.primary.DEFAULT}"/><path d="M14 7h4v18h-4z" fill="${colors.onPrimary}"/></svg>`)}` },
};
const theme = {
  '--primary': colors.primary.DEFAULT, '--primary-soft': colors.primary[50],
  '--heading': colors.heading, '--muted': colors.muted,
  '--surface': colors.surface, '--canvas': colors.canvas, '--divider': colors.divider,
  '--font-body': fontFamilies.web, '--space-none': `${spacing['0']}px`,
} as CSSProperties;

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="ko" style={theme}><body>{children}</body></html>;
}
