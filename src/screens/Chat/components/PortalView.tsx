import { PrefixPlatformEnum } from '@/models/common';
import { IMessage } from '@/models/ModelChat';
import { useAppDispatch } from '@/redux/hooks';
import { setReplyMessage } from '@/redux/slices/chatSlice';
import ChatService from '@/services/ChatService';
import { BlurView } from '@react-native-community/blur';
import * as Clipboard from 'expo-clipboard';
import {
  ArrowBendDownLeft,
  ArrowBendDownRight,
  Copy,
  PushPinSimple,
  Trash,
} from 'phosphor-react-native';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Portal } from 'react-native-portalize';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';
import { config, Variant } from '@/theme/_config';

import { Text } from '@/components/ui/text';

import MessageAttachment from './MessageAttachment';
import { listIconReaction } from './MessageItem';
import MessageQuote from './MessageQuote';

type PortalViewProps = {
  readonly isSender: boolean;
  readonly messageCordinates: {
    x: number;
    y: number;
  };
  readonly selectedMessage?: {
    layoutHeight: number;
    layoutWidth?: number;
  } & IMessage;
  readonly setMessages: Dispatch<SetStateAction<IMessage[]>>;
  readonly setSelectedMessage: Dispatch<
    SetStateAction<
      ({ layoutHeight: number; layoutWidth?: number } & IMessage) | undefined
    >
  >;
};

const BLUR_AMOUNT = 10;

function PortalView({
  isSender,
  messageCordinates,
  selectedMessage,
  setMessages,
  setSelectedMessage,
}: PortalViewProps) {
  const [containerDimensions, setContainerDimensions] = useState({
    height: 0,
    width: 0,
  });

  const dispatch = useAppDispatch();
  const { colors, variant } = useTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const { height, width } = useWindowDimensions();

  const mutations = {
    reaction: ChatService.useReactionMessage(),
    undoMessage: ChatService.useUndoMessage(),
  };

  useEffect(() => {
    if (selectedMessage) {
      scale.value = withSpring(1, { damping: 12 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = 0;
      opacity.value = 0;
    }
  }, [scale, opacity, selectedMessage]);

  const calculatePosition = useMemo(() => {
    if (!selectedMessage) return { shouldAnimate: false, x: 0, y: 0 };

    const messageY = messageCordinates.y;
    const messageX = isSender
      ? width - containerDimensions.width
      : messageCordinates.x - 30;

    const containerHeight = containerDimensions.height;
    const spaceBelow = height - messageY;
    const spaceAbove = messageY;
    const shouldShowBelow = spaceBelow >= containerHeight;
    const shouldShowAbove = spaceAbove >= containerHeight;

    // Calculate safe position
    let y = messageY;
    if (!shouldShowBelow && shouldShowAbove) {
      y = Math.max(0, messageY - containerHeight);
    } else if (!shouldShowBelow && !shouldShowAbove) {
      // If no space above or below, show in the middle
      y = Math.max(0, (height - containerHeight) / 2);
    }

    return {
      shouldAnimate: true,
      x: messageX,
      y,
    };
  }, [
    messageCordinates,
    selectedMessage,
    isSender,
    width,
    height,
    containerDimensions,
  ]);

  const actionButtons = useMemo(
    () => [
      { icon: <ArrowBendDownLeft size={20} />, key: 'reply', label: 'Trả lời' },
      // {
      //   icon: <ArrowBendDownRight size={20} />,
      //   key: 'forward',
      //   label: 'Chuyển tiếp',
      // },
      // { icon: <Copy size={20} />, key: 'copy', label: 'Sao chép' },
      // {
      //   icon: <PushPinSimple size={20} />,
      //   key: 'pin',
      //   label: 'Ghim',
      // },
      // {
      //   hidden:
      //     selectedMessage?.senderId !== selectedMessage?.pageId &&
      //     selectedMessage?.pageId.includes(PrefixPlatformEnum.personal_zalo),
      //   icon: <Trash color={config.colors.error} size={20} />,
      //   key: 'delete',
      //   label: 'Xoá',
      // },
    ],
    [selectedMessage],
  );

  const containerStyle = useAnimatedStyle(() => {
    const { x, y } = calculatePosition;

    return {
      left: x,
      maxWidth: 400,
      minWidth: 100,
      opacity: opacity.value,
      padding: 12,
      position: 'absolute',
      top: y,
      transform: [{ scale: scale.value }],
    };
  });

  if (!selectedMessage) {
    return null;
  }

  const handleReaction = async (message: IMessage, reaction: string) => {
    const result = await mutations.reaction.mutateAsync({
      messageId: message._id,
      pageId: message.pageId,
      reaction: reaction,
      scopedUserId: message.scopedUserId,
    });
    if (result) {
      setMessages((previous) =>
        previous.map((item) => (item._id === result._id ? result : item)),
      );
    }
    setSelectedMessage(undefined);
  };

  const renderMessage = () => {
    if (
      selectedMessage.attachments.length > 0 &&
      !selectedMessage.translateValue &&
      !selectedMessage.text &&
      !selectedMessage.deletedAt
    ) {
      return <MessageAttachment message={selectedMessage} />;
    }
    return (
      <>
        {selectedMessage.text ? (
          <Text
            style={{
              color:
                selectedMessage.senderId === selectedMessage.pageId
                  ? variant === Variant.DARK
                    ? colors.gray800
                    : colors.gray50
                  : colors.gray800,
            }}
          >
            {selectedMessage.text}
          </Text>
        ) : null}
        {selectedMessage.attachments.length > 0 && (
          <MessageAttachment message={selectedMessage} />
        )}
      </>
    );
  };

  const handleAction = async (key: string) => {
    switch (key) {
      case 'copy': {
        await Clipboard.setStringAsync(selectedMessage.text);
        break;
      }
      case 'delete': {
        const result = await mutations.undoMessage.mutateAsync({
          messageId: selectedMessage._id,
          pageId: selectedMessage.pageId,
          scopedUserId: selectedMessage.scopedUserId,
        });
        if (result) {
          setMessages((previous) =>
            previous.map((item) => (item._id === result._id ? result : item)),
          );
        }
        break;
      }
      case 'forward': {
        break;
      }
      case 'pin': {
        break;
      }
      case 'reply': {
        dispatch(setReplyMessage(selectedMessage));
        break;
      }
    }
    setSelectedMessage(undefined);
  };

  return (
    <Portal>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          setSelectedMessage(undefined);
        }}
        style={{ flex: 1 }}
      >
        <BlurView blurAmount={BLUR_AMOUNT} style={{ flex: 1 }} />

        <Animated.View
          onLayout={(event) => {
            setContainerDimensions({
              height: event.nativeEvent.layout.height,
              width: event.nativeEvent.layout.width,
            });
          }}
          style={[containerStyle]}
        >
          <View
            style={{
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <View
              style={{
                alignSelf:
                  selectedMessage.senderId === selectedMessage.pageId
                    ? 'flex-end'
                    : 'flex-start',
                backgroundColor:
                  selectedMessage.attachments.length > 0 &&
                  !selectedMessage.text
                    ? 'transparent'
                    : selectedMessage.senderId === selectedMessage.pageId
                      ? colors.primary
                      : colors.gray200,
                borderRadius: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                marginVertical: 2,
                maxWidth: '70%',
                padding:
                  selectedMessage.attachments?.length > 0 &&
                  !selectedMessage.text
                    ? 0
                    : 8,
                position: 'relative',
              }}
            >
              {selectedMessage.quote && !selectedMessage.deletedAt ? (
                <MessageQuote hiddenClose message={selectedMessage.quote} />
              ) : null}
              {renderMessage()}
            </View>

            <View
              style={{
                flexDirection: isSender ? 'row-reverse' : 'row',
                gap: 4,
              }}
            >
              {selectedMessage.reaction?.length > 0 && (
                <TouchableOpacity
                  onPress={() => handleReaction(selectedMessage, 'unreact')}
                  style={{
                    alignItems: 'center',
                    backgroundColor: 'white',
                    borderRadius: 100,
                    height: 40,
                    justifyContent: 'center',
                    width: 40,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>X</Text>
                </TouchableOpacity>
              )}
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 18,
                  flexDirection: 'row',
                  gap: 16,
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                }}
              >
                {listIconReaction.map((emoji) => (
                  <TouchableOpacity
                    key={emoji.key}
                    onPress={() => handleReaction(selectedMessage, emoji.key)}
                  >
                    <Text key={emoji.key} style={{ fontSize: 20 }}>
                      {emoji.icon}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 18,
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                padding: 8,
              }}
            >
              {actionButtons
                .filter((action) => !action.hidden)
                .map((action) => (
                  <TouchableOpacity
                    key={action.key}
                    onPress={() => {
                      void handleAction(action.key);
                    }}
                    style={{
                      alignItems: 'center',
                      width: '22%',
                    }}
                  >
                    <View
                      style={{
                        alignItems: 'center',
                        height: 40,
                        justifyContent: 'center',
                        marginBottom: 5,
                        width: 40,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{action.icon}</Text>
                    </View>
                    <Text style={{ fontSize: 11, textAlign: 'center' }}>
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Portal>
  );
}

export default PortalView;
