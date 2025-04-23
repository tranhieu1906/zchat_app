import React, { JSX } from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { useTheme } from '@/theme';

import Text from '@/components/ui/text/Text/Text';

type ButtonProps = {
  readonly children: React.ReactNode | string;
  readonly disabled?: boolean;
  readonly icon?: JSX.Element;
  readonly size?: 'large' | 'middle' | 'small';
  readonly type?: 'link' | 'primary' | 'secondary' | 'text';
} & TouchableOpacityProps;

function Button({
  children,
  disabled = false,
  icon = undefined,
  size = 'middle',
  style,
  type = 'primary',
  ...props
}: ButtonProps) {
  const { colors, layout } = useTheme();

  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: 6,
      borderWidth: type === 'text' || type === 'link' ? 0 : 0.5,
      gap: 8,
      opacity: disabled ? 0.5 : 1,
    };

    const sizeStyles = {
      large: {
        height: 48,
        paddingHorizontal: 20,
      },
      middle: {
        height: 40,
        paddingHorizontal: 15,
      },
      small: {
        height: 32,
        paddingHorizontal: 12,
      },
    };

    const typeStyles = {
      link: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
      primary: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
      },
      secondary: {
        backgroundColor: 'transparent',
        borderColor: colors.gray200,
      },
      text: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...typeStyles[type],
    };
  };

  const getTextColor = () => {
    switch (type) {
      case 'link': {
        return colors.primary;
      }
      case 'primary': {
        return colors.gray50;
      }
      case 'secondary': {
        return colors.gray800;
      }
      case 'text': {
        return colors.gray800;
      }
      default: {
        return colors.gray50;
      }
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      {...props}
      style={[
        layout.row,
        layout.itemsCenter,
        layout.justifyCenter,
        getButtonStyles(),
        style,
      ]}
    >
      {icon ? React.cloneElement(icon, { color: getTextColor() }) : undefined}
      {typeof children === 'string' ? (
        <Text
          style={{
            color: getTextColor(),
            fontSize: size === 'small' ? 12 : 14,
            fontWeight: type === 'link' ? '500' : '400',
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

export default Button;
