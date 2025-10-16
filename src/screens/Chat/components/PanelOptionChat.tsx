/* eslint-disable react/no-unstable-nested-components */
import { useAppSelector } from '@/redux/hooks';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ArrowBendUpRight,
  ChatText,
  Image,
  Microphone,
} from 'phosphor-react-native';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Paths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';
import { config } from '@/theme/_config';

import { Text } from '@/components/ui/text';

type OptionType = 'image' | 'message_flow' | 'quick_reply' | 'voice_record';

type PanelOptionChatProps = {
  readonly setShowOptions: (show: boolean) => void;
  readonly showOptions: boolean;
};

function PanelOptionChat({
  setShowOptions,
  showOptions,
}: PanelOptionChatProps) {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { keyboardHeight, selectedPhotos } = useAppSelector(
    (state) => state.chat,
  );
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(slideAnim, {
      duration: 300,
      toValue: showOptions ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [showOptions, slideAnim]);

  const OPTIONS = useMemo(
    () => [
      {
        color: '#4F7FFF',
        count: selectedPhotos.length,
        icon: (color: string) => (
          <Image color={color} size={24} weight="fill" />
        ),
        label: 'Ảnh',
        type: 'image' as const,
      },
      // {
      //   color: '#3CAEA3',
      //   icon: (color: string) => (
      //     <ChatText color={color} size={24} weight="fill" />
      //   ),
      //   label: 'Trả lời nhanh',
      //   type: 'quick_reply' as const,
      // },
      // {
      //   color: '#8A4FFF',
      //   icon: (color: string) => (
      //     <ArrowBendUpRight color={color} size={24} weight="fill" />
      //   ),
      //   label: 'Luồng tin nhắn',
      //   type: 'message_flow' as const,
      // },
      // {
      //   color: '#FF6B6B',
      //   icon: (color: string) => (
      //     <Microphone color={color} size={24} weight="fill" />
      //   ),
      //   label: 'Ghi âm',
      //   type: 'voice_record' as const,
      // },
    ],
    [selectedPhotos],
  );

  const handleOptionPress = useCallback(
    (optionType: OptionType) => {
      switch (optionType) {
        case 'image': {
          navigation.navigate(Paths.ChatImage);
          break;
        }
        default: {
          break;
        }
      }
      // Handle option press logic here
    },
    [navigation],
  );

  const renderOption = useCallback(
    (
      icon: React.ReactNode,
      label: string,
      type: OptionType,
      color: string,
      count?: number,
    ) => (
      <TouchableOpacity
        activeOpacity={0.7}
        key={type}
        onPress={() => {
          handleOptionPress(type);
        }}
        style={{ alignItems: 'center', width: 70 }}
      >
        <View style={{ position: 'relative' }}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: color,
              borderRadius: 25,
              height: 50,
              justifyContent: 'center',
              marginBottom: 8,
              width: 50,
            }}
          >
            {icon}
          </View>
          {count && count > 0 ? (
            <View
              style={{
                backgroundColor: config.backgrounds.primary,
                borderRadius: 100,
                paddingHorizontal: 8,
                position: 'absolute',
                right: -6,
                top: -5,
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 10,
                }}
              >
                {count}
              </Text>
            </View>
          ) : null}
        </View>
        <Text
          style={{
            color: '#000',
            fontSize: 12,
            textAlign: 'center',
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    ),
    [handleOptionPress],
  );

  const calculatedHeight = useMemo(
    () => (keyboardHeight > 0 ? keyboardHeight - bottom : 312),
    [keyboardHeight, bottom],
  );

  return (
    <Animated.View
      style={{
        height: showOptions ? Math.max(calculatedHeight, 0) : 0,
        opacity: slideAnim,
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [300, 0],
            }),
          },
        ],
        zIndex: 20,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          paddingTop: 20,
        }}
      >
        {OPTIONS.map(({ color, count, icon, label, type }) =>
          renderOption(icon('#FFFFFF'), label, type, color, count),
        )}
      </View>
    </Animated.View>
  );
}

export default PanelOptionChat;
