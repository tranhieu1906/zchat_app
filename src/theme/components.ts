import type { ComponentTheme } from '@/theme/types/theme';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

type AllStyle = {} & Record<string, ImageStyle | TextStyle | ViewStyle>;

const generateComponentStyles = ({
  backgrounds,
  fonts,
  layout,
}: ComponentTheme) => {
  return {
    avatar: {
      ...layout.justifyCenter,
      ...layout.itemsCenter,
      ...backgrounds.primary,
      borderRadius: 20,
      height: 40,
      width: 40,
    },
    buttonCircle: {
      ...layout.justifyCenter,
      ...layout.itemsCenter,
      ...backgrounds.primary,
      ...fonts.gray400,
      borderRadius: 35,
      height: 64,
      width: 64,
    },
    circle250: {
      borderRadius: 140,
      height: 250,
      width: 250,
    },
  } as const satisfies AllStyle;
};

export default generateComponentStyles;
