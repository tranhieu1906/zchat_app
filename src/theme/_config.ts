import type { ThemeConfiguration } from '@/theme/types/config';

import { DarkTheme, DefaultTheme } from '@react-navigation/native';

export const enum Variant {
  DARK = 'dark',
}

export const colorsLight = {
  background: '#F3F0FF',
  error: '#DC2626',
  gray100: '#E9ECEF',
  gray200: '#CED4DA',
  gray400: '#6C757D',
  gray50: '#F8F9FA',
  gray800: '#343A40',
  primary: '#3B82F6',
  purple100: '#E5DBFF',
  purple500: '#6B21A8',
  skeleton: '#CED4DA',
  success: '#10B981',
  text: '#232b39',
  warning: '#F59E0B',
} as const;

export const colorsDark = {
  background: '#212121',
  error: '#EF4444',
  gray100: '#343A40',
  gray200: '#495057',
  gray400: '#ADB5BD',
  gray50: '#212529',
  gray800: '#F8F9FA',
  primary: '#3B82F6',
  purple100: '#2D273F',
  purple500: '#9D7FEA',
  skeleton: '#495057',
  success: '#34D399',
  text: '#F5F5F5',
  warning: '#FBBF24',
} as const;

const sizes = [12, 16, 24, 32, 40, 80] as const;

export const config = {
  backgrounds: colorsLight,
  borders: {
    colors: colorsLight,
    radius: [4, 16],
    widths: [1, 2],
  },
  colors: colorsLight,
  fonts: {
    colors: colorsLight,
    sizes,
  },
  gutters: sizes,
  navigationColors: {
    ...DefaultTheme.colors,
    background: colorsLight.gray50,
    card: colorsLight.gray50,
  },
  variants: {
    dark: {
      backgrounds: colorsDark,
      borders: {
        colors: colorsDark,
      },
      colors: colorsDark,
      fonts: {
        colors: colorsDark,
      },
      navigationColors: {
        ...DarkTheme.colors,
        background: colorsDark.background,
        card: colorsDark.background,
      },
    },
  },
} as const satisfies ThemeConfiguration;
