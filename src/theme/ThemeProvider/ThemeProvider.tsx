import type {
  FulfilledThemeConfiguration,
  Variant,
} from '@/theme/types/config';
import type { ComponentTheme, Theme } from '@/theme/types/theme';
import type { PropsWithChildren } from 'react';

import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import * as secureStorage from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance } from 'react-native';

import {
  generateBackgrounds,
  staticBackgroundStyles,
} from '@/theme/backgrounds';
import {
  generateBorderColors,
  generateBorderRadius,
  generateBorderWidths,
  staticBorderStyles,
} from '@/theme/borders';
import componentsGenerator from '@/theme/components';
import {
  generateFontColors,
  generateFontSizes,
  staticFontStyles,
} from '@/theme/fonts';
import { generateGutters, staticGutterStyles } from '@/theme/gutters';
import layout from '@/theme/layout';
import generateConfig from '@/theme/ThemeProvider/generateConfig';

type Context = {
  changeTheme: (variant: Variant) => void;
} & Theme;

export const ThemeContext = createContext<Context | undefined>(undefined);

function ThemeProvider({ children = false }: PropsWithChildren) {
  // Current theme variant
  // const [variant, setVariant] = useState(
  //   (secureStorage.getString('theme') ??
  //     Appearance.getColorScheme() ??
  //     'light') as Variant,
  // );
  const [variant, setVariant] = useState('light' as Variant);

  // Initialize theme and listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        // setVariant(colorScheme as Variant);
        // secureStorage.set('theme', colorScheme);
      }
    });

    // Initialize theme if not defined
    const appHasThemeDefined = secureStorage.getItem('theme');
    if (!appHasThemeDefined) {
      // const systemTheme = Appearance.getColorScheme() ?? 'light';
      // secureStorage.set('theme', systemTheme);
      // setVariant(systemTheme as Variant);
    }

    return () => {
      subscription.remove();
    };
  }, [secureStorage]);

  const changeTheme = useCallback(
    (nextVariant: Variant) => {
      setVariant(nextVariant);
      secureStorage.setItem('theme', nextVariant);
    },
    [secureStorage],
  );

  // Flatten config with current variant
  const fullConfig = useMemo(() => {
    return generateConfig(variant) satisfies FulfilledThemeConfiguration;
  }, [variant]);

  const fonts = useMemo(() => {
    return {
      ...generateFontSizes(),
      ...generateFontColors(fullConfig),
      ...staticFontStyles,
    };
  }, [fullConfig]);

  const backgrounds = useMemo(() => {
    return {
      ...generateBackgrounds(fullConfig),
      ...staticBackgroundStyles,
    };
  }, [fullConfig]);

  const gutters = useMemo(() => {
    return {
      ...generateGutters(fullConfig),
      ...staticGutterStyles,
    };
  }, [fullConfig]);

  const borders = useMemo(() => {
    return {
      ...generateBorderColors(fullConfig),
      ...generateBorderRadius(),
      ...generateBorderWidths(),
      ...staticBorderStyles,
    };
  }, [fullConfig]);

  const navigationTheme = useMemo(() => {
    if (variant === 'dark') {
      return {
        ...DarkTheme,
        colors: fullConfig.navigationColors,
        dark: true,
      };
    }
    return {
      ...DefaultTheme,
      colors: fullConfig.navigationColors,
      dark: false,
    };
  }, [variant, fullConfig.navigationColors]);

  const theme = useMemo(() => {
    return {
      backgrounds,
      borders,
      colors: fullConfig.colors,
      fonts,
      gutters,
      layout,
      variant,
    } satisfies ComponentTheme;
  }, [variant, fonts, backgrounds, borders, fullConfig.colors, gutters]);

  const components = useMemo(() => {
    return componentsGenerator(theme);
  }, [theme]);

  const value = useMemo(() => {
    return { ...theme, changeTheme, components, navigationTheme };
  }, [theme, components, navigationTheme, changeTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export default ThemeProvider;
