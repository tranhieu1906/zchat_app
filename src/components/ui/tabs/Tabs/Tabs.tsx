import { useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';

import { useTheme } from '@/theme';
import layout from '@/theme/layout';

import { Text } from '@/components/ui/text';

type TabItem = {
  readonly badge?: number;
  readonly children: React.ReactNode;
  readonly disabled?: boolean;
  readonly key: string;
  readonly label: string;
};

type TabProps = {
  readonly activeKey?: string;
  readonly items: TabItem[];
  readonly onChange?: (key: string) => void;
  readonly size?: 'large' | 'middle' | 'small';
  readonly type?: 'card' | 'line';
};

function Tabs({
  activeKey,
  items,
  onChange,
  size = 'middle',
  type = 'line',
}: TabProps) {
  const { colors } = useTheme();
  const scrollViewReference = useRef<ScrollView>(null);
  const [internalActiveKey, setInternalActiveKey] = useState(
    activeKey ?? items[0].key,
  );
  const activeItem =
    items.find((item) => item.key === internalActiveKey) ?? items[0];

  const getSizeStyles = () => {
    switch (size) {
      case 'large': {
        return { fontSize: 14, paddingVertical: 8 };
      }
      case 'small': {
        return { fontSize: 10, paddingVertical: 4 };
      }
      default: {
        return { fontSize: 12, paddingVertical: 6 };
      }
    }
  };

  const getTypeStyles = () => {
    if (type === 'card') {
      return {
        backgroundColor: colors.gray50,
        borderRadius: 100,
        marginRight: 8,
        paddingHorizontal: 8,
      };
    }
    return {
      marginRight: 24,
      paddingBottom: 4,
    };
  };

  const getTextStyles = (isDisabled: boolean | undefined) => ({
    ...getSizeStyles(),
    opacity: isDisabled ? 0.5 : 1,
  });

  const getActiveIndicatorStyles = {
    backgroundColor: colors.primary,
    bottom: 0,
    height: 2,
    left: 0,
    position: 'absolute' as const,
    right: 0,
  };

  const handleTabChange = (key: string, index: number) => {
    if (onChange) {
      onChange(key);
    }
    setInternalActiveKey(key);

    // Calculate scroll position
    const screenWidth = Dimensions.get('window').width;
    const tabWidth = 100; // minWidth of tab
    const scrollPosition = Math.max(
      0,
      index * tabWidth - screenWidth / 2 + tabWidth / 2,
    );

    scrollViewReference.current?.scrollTo({
      animated: true,
      x: scrollPosition,
    });
  };

  return (
    <View style={[layout.col, layout.fullWidth, layout.flex_1]}>
      <View>
        <ScrollView
          contentContainerStyle={[
            layout.row,
            layout.itemsCenter,
            { paddingBottom: 12 },
          ]}
          horizontal
          ref={scrollViewReference}
          showsHorizontalScrollIndicator={false}
        >
          {items.map((item, index) => {
            const isActive = internalActiveKey === item.key;
            const isDisabled = item.disabled;

            return (
              <Pressable
                disabled={isDisabled}
                key={item.key}
                onPress={() => {
                  handleTabChange(item.key, index);
                }}
              >
                <View
                  style={[
                    layout.row,
                    layout.itemsCenter,
                    layout.justifyCenter,
                    getTypeStyles(),
                    { minWidth: 100 },
                    isActive &&
                      type === 'card' && {
                        backgroundColor: colors.gray100,
                      },
                  ]}
                >
                  <Text style={getTextStyles(isDisabled)}>{item.label}</Text>
                  {item.badge !== undefined && (
                    <View
                      style={[
                        layout.row,
                        layout.itemsCenter,
                        {
                          backgroundColor: isActive
                            ? colors.primary
                            : colors.gray100,
                          borderRadius: 100,
                          marginLeft: 4,
                          paddingHorizontal: 8,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: isActive ? colors.gray50 : colors.gray800,
                          fontSize: 12,
                        }}
                      >
                        {item.badge}
                      </Text>
                    </View>
                  )}
                  {type === 'line' && isActive ? (
                    <View style={getActiveIndicatorStyles} />
                  ) : undefined}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <View style={{ flex: 1 }}>{activeItem.children}</View>
    </View>
  );
}

export default Tabs;
