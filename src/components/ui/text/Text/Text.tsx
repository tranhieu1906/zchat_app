import { Text as RNText, TextProps } from 'react-native';

import { useTheme } from '@/theme';

export type TextProperty = {
  readonly children: React.ReactNode | string;
  readonly code?: boolean;
  readonly copyable?: boolean;
  readonly delete?: boolean;
  readonly disabled?: boolean;
  readonly ellipsis?: boolean;
  readonly italic?: boolean;
  readonly keyboard?: boolean;
  readonly mark?: boolean;
  readonly strong?: boolean;
  readonly type?: 'danger' | 'link' | 'secondary' | 'success' | 'warning';
  readonly underline?: boolean;
} & TextProps;

function Text({
  children,
  code = false,
  delete: deleted = false,
  disabled = false,
  ellipsis = false,
  italic = false,
  keyboard = false,
  mark = false,
  strong = false,
  style,
  type = 'secondary',
  underline = false,
  ...props
}: TextProperty) {
  const { colors, fonts } = useTheme();

  const getTextStyles = () => {
    const baseStyles = {
      color: disabled ? colors.gray400 : colors.gray800,
      fontSize: 14,
      lineHeight: 22,
    };

    const typeStyles = {
      danger: {
        color: colors.error,
      },
      link: {
        color: colors.primary,
      },
      secondary: {
        color: colors.text,
      },
      success: {
        color: colors.success,
      },
      warning: {
        color: colors.warning,
      },
    };

    const decorationStyles = {
      code: {
        backgroundColor: colors.gray100,
        fontFamily: fonts.defaultFont.fontFamily,
        paddingHorizontal: 4,
        paddingVertical: 2,
      },
      delete: {
        textDecorationLine: 'line-through' as const,
      },
      italic: {
        fontStyle: 'italic' as const,
      },
      keyboard: {
        backgroundColor: colors.gray100,
        borderColor: colors.gray200,
        borderRadius: 2,
        borderWidth: 1,
        paddingHorizontal: 4,
        paddingVertical: 2,
      },
      mark: {
        backgroundColor: colors.warning,
      },
      strong: {
        fontWeight: '500' as const,
      },
      underline: {
        textDecorationLine: 'underline' as const,
      },
    };

    return {
      ...baseStyles,
      ...typeStyles[type],
      ...(code && decorationStyles.code),
      ...(deleted && decorationStyles.delete),
      ...(italic && decorationStyles.italic),
      ...(keyboard && decorationStyles.keyboard),
      ...(mark && decorationStyles.mark),
      ...(strong && decorationStyles.strong),
      ...(underline && decorationStyles.underline),
    };
  };

  return (
    <RNText
      numberOfLines={ellipsis ? 1 : undefined}
      style={[getTextStyles(), style]}
      {...props}
    >
      {children}
    </RNText>
  );
}

export default Text;
