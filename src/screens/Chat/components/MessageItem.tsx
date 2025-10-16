import AvatarManager from '@/managers/AvatarManager';
import { IMessage } from '@/models/ModelChat';
import { Image } from 'expo-image';
import {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/theme';
import { config, Variant } from '@/theme/_config';

import { Text } from '@/components/ui/text';

import MessageActions from './MessageActions';
import MessageAttachment from './MessageAttachment';
import MessageQuote from './MessageQuote';

export const listIconReaction = [
  { icon: '👍', key: 'like' },
  { icon: '❤️', key: 'love' },
  { icon: '😮', key: 'wow' },
  { icon: '😆', key: 'smile' },
  { icon: '😡', key: 'angry' },
  { icon: '😢', key: 'sad' },
];

function MessageItem({
  isShowAvatar = false,
  message,
  onLongPress,
  setIsSender,
}: {
  readonly isShowAvatar?: boolean;
  readonly message: IMessage;
  readonly onLongPress: (
    event: GestureResponderEvent,
    data: { layoutHeight: number } & IMessage,
  ) => void;
  readonly setIsSender: Dispatch<SetStateAction<boolean>>;
}) {
  const [layoutHeight, setLayoutHeight] = useState(0);

  const { colors, variant } = useTheme();

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setLayoutHeight(height);
  }, []);

  const listReaction = useMemo(
    () =>
      listIconReaction.filter((reaction) => {
        const existReaction = message.reaction?.find(
          (react) => react.reaction === reaction.key,
        );
        return existReaction;
      }),
    [message.reaction],
  );

  const avatar = useMemo(() => {
    return AvatarManager.getAvatarUser(message.pageId, {
      avatar: message.from?.avatar,
      scopedUserId: message.scopedUserId,
    });
  }, [message.from?.avatar, message.pageId, message.scopedUserId]);

  const renderMessage = useCallback(() => {
    if (
      message.attachments?.length > 0 &&
      !message.translateValue &&
      !message.text &&
      !message.deletedAt
    ) {
      return <MessageAttachment message={message} />;
    }
    return (
      <>
        {message.text ? (
          <Text
            style={{
              color:
                message.senderId === message.pageId
                  ? variant === Variant.DARK
                    ? colors.gray800
                    : colors.gray50
                  : colors.gray800,
            }}
          >
            {message.text}
          </Text>
        ) : null}
        {message.attachments?.length > 0 && (
          <MessageAttachment message={message} />
        )}
      </>
    );
  }, [message, variant]);

  if (message.action) {
    return (
      <View
        style={{
          alignItems: 'center',
          flex: 1,
          gap: 4,
        }}
      >
        <MessageActions message={message} />
      </View>
    );
  }

  return (
    <View
      style={{
        alignItems: 'flex-end',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor:
            message.from?.avatar || !isShowAvatar
              ? 'transparent'
              : colors.primary,
          borderRadius: 10,
          flexDirection: 'row',
          height: 20,
          justifyContent: 'center',
          marginRight: 4,
          width: 20,
        }}
      >
        {isShowAvatar ? (
          avatar ? (
            <Image
              source={{
                uri: avatar,
              }}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 10,
                height: 20,
                width: 20,
              }}
            />
          ) : (
            <Text style={{ color: config.colors.gray100 }}>
              {message.from?.name?.charAt(0).toUpperCase() ?? ''}
            </Text>
          )
        ) : null}
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent:
            message.senderId === message.pageId ? 'flex-end' : 'flex-start',
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onLayout={onLayout}
          onLongPress={(event: GestureResponderEvent) => {
            if (!message.deletedAt) {
              onLongPress(event, { ...message, layoutHeight });
            }
          }}
          onPressIn={() => {
            setIsSender(message.senderId === message.pageId);
          }}
          style={{
            alignSelf:
              message.senderId === message.pageId ? 'flex-end' : 'flex-start',
            backgroundColor:
              message.attachments?.length > 0 && !message.text
                ? 'transparent'
                : message.senderId === message.pageId
                  ? colors.primary
                  : colors.gray200,
            borderRadius: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            marginVertical: 2,
            maxWidth: '70%',
            padding: message.attachments?.length > 0 && !message.text ? 0 : 8,
            position: 'relative',
          }}
        >
          {message.quote && !message.deletedAt ? (
            <MessageQuote hiddenClose message={message.quote} />
          ) : null}
          {renderMessage()}
          {listReaction.length > 0 && (
            <View
              style={{
                alignItems: 'center',
                backgroundColor: 'white',
                borderRadius: 24,
                bottom: -16,
                display: 'flex',
                justifyContent: 'center',
                minWidth: 30,
                paddingHorizontal: 4,
                paddingVertical: 2,
                position: 'absolute',
                right: 0,
                zIndex: 1200,
              }}
            >
              {listReaction.map((item) => {
                return (
                  <Text key={item.key} style={{ fontSize: 12 }}>
                    {item.icon}
                  </Text>
                );
              })}
            </View>
          )}
          {message.deletedAt ? <Text type="danger">Đã thu hồi</Text> : null}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default memo(MessageItem);
