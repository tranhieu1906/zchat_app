/* eslint-disable react-hooks/rules-of-hooks */
import withMainLayout from '@/hoc/withMainLayout';
import AvatarManager from '@/managers/AvatarManager';
import SocketManager, { ISocketEvent } from '@/managers/SocketManager';
import { IAttachment } from '@/models/common';
import {
  CursorData,
  GetMessageDto,
  IMessage,
  SendMessageDto,
} from '@/models/ModelChat';
import { useAppSelector } from '@/redux/hooks';
import {
  setIsScrollToMessage,
  setReplyMessage,
} from '@/redux/slices/chatSlice';
import ChatService from '@/services/ChatService';
import PageService from '@/services/PageService';
import StringUtiles from '@/utils/StringUtiles';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { Image } from 'expo-image';
import moment from 'moment';
import { CaretLeft, NoteBlank, Tag } from 'phosphor-react-native';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  GestureResponderEvent,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';

import { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { config } from '@/theme/_config';

import { SafeScreen } from '@/components/templates';
import { Text } from '@/components/ui/text';
import ModalTag from '@/screens/Chat/components/ModalTag';

import ChatInputBar from './components/ChatInputBar';
import MessageItem from './components/MessageItem';
import PanelOptionChat from './components/PanelOptionChat';
import PortalView from './components/PortalView';

function ChatScreen() {
  const [messageCordinates, setMessageCordinates] = useState({ x: 0, y: 0 });
  const [selectedMessage, setSelectedMessage] = useState<
    { layoutHeight: number } & IMessage
  >();
  const [isSender, setIsSender] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [cursor, setCursor] = useState<CursorData>({
    afterCursor: undefined,
    beforeCursor: undefined,
  });

  const abortControllerReference = useRef<AbortController | null>(null);
  const flatListReference = useRef<FlashList<IMessage>>(null);
  const bottomSheetReference = useRef<BottomSheetModal>(null);
  const { colors, components, variant } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { conversationActive, replyMessage } = useAppSelector(
    (state) => state.chat,
  );
  const { pageSetting } = useAppSelector((state) => state.page);
  const { blackListWords } = pageSetting?.settingLiveChat ?? {};

  if (!conversationActive) return;
  const { pageId, scopedUserId } = conversationActive;
  const resultScopedUser = scopedUserId.includes('g')
    ? undefined
    : PageService.useGetDetaiScopedUser(pageId, scopedUserId);

  const scopedUser = useMemo(() => resultScopedUser?.data, [resultScopedUser]);

  const mutations = {
    getListMessage: ChatService.useGetListMessage(),
  };

  const handleGetListMessage = useCallback(
    async (type?: 'loadMore' | 'loadPrevious') => {
      const parameters: GetMessageDto = {
        pageId: pageId,
        scopedUserId: scopedUserId,
        signal: abortControllerReference.current?.signal,
      };

      if (type === 'loadMore') {
        if (!cursor.afterCursor) return;
        parameters.afterCursor = cursor.afterCursor;
      } else if (type === 'loadPrevious') {
        if (!cursor.beforeCursor) return;
        parameters.beforeCursor = cursor.beforeCursor;
      }

      await mutations.getListMessage
        .mutateAsync(parameters)
        .then((result) => {
          const dataMessage = result.data;
          const updateMessageList = {
            default: () => {
              dispatch(setIsScrollToMessage(false));
              setMessages(dataMessage);
              setCursor({ ...cursor, afterCursor: result.cursor.afterCursor });
            },
            loadMore: () => {
              setMessages([...messages, ...dataMessage]);
              setCursor({ ...cursor, afterCursor: result.cursor.afterCursor });
            },
            loadPrevious: () => {
              setMessages([...dataMessage, ...messages]);
              setCursor({
                ...cursor,
                beforeCursor: result.cursor.beforeCursor,
              });
              if (!result.cursor.beforeCursor) {
                dispatch(setIsScrollToMessage(false));
              }
            },
          };

          (type ? updateMessageList[type] : updateMessageList.default)();
        })
        .catch(() => {});
    },
    [
      pageId,
      scopedUserId,
      mutations.getListMessage,
      cursor,
      dispatch,
      messages,
    ],
  );

  const handleUpdateMessage = useCallback(
    (item: IMessage) => {
      if (item.scopedUserId !== scopedUserId) return;

      setMessages((previousMessages) => {
        const indexMessage = previousMessages.findIndex(
          ({ _id }) => _id === item._id,
        );

        if (indexMessage === -1) {
          const insertIndex = previousMessages.findIndex(
            (message) =>
              moment(message.timestamp).valueOf() <
              moment(item.timestamp).valueOf(),
          );
          const newMessages = previousMessages.filter(({ _id }) => !!_id);
          newMessages.splice(insertIndex, 0, item);
          return newMessages;
        }

        // Update existing message
        return previousMessages.map((message) =>
          message._id === item._id ? item : message,
        );
      });
    },
    [scopedUserId],
  );

  const parseMessage = useCallback(
    (message: string) => {
      return StringUtiles.regexText(message, scopedUser);
    },
    [scopedUser],
  );

  const createTemporaryMessages = useCallback(
    (body: SendMessageDto) => {
      const { attachments, text } = body;
      const baseMessage: Partial<IMessage> = {
        loading: true,
        pageId: pageId,
        recipientId: scopedUserId,
        scopedUserId: scopedUserId,
        senderId: pageId,
        timestamp: moment().toISOString(),
      };

      const temporaryMessages: Partial<IMessage>[] = [];
      if (text)
        temporaryMessages.push({
          ...baseMessage,
          quote: replyMessage,
          text: text,
        });
      if (attachments) {
        for (const attachment of attachments) {
          temporaryMessages.push({
            ...baseMessage,
            attachments: [
              {
                payload: {
                  thumbnailUrl: attachment.thumbnailUrl,
                  url: attachment.url,
                },
                type: attachment.filetype,
              },
            ],
          });
        }
      }
      return temporaryMessages;
    },
    [replyMessage, pageId, scopedUserId],
  );

  const handleSendMessage = useCallback(
    async (message?: string, attachments?: IAttachment[]) => {
      const body: Partial<SendMessageDto> = { attachments: [], mentions: [] };

      if (message) {
        body.text = parseMessage(message);

        if (blackListWords?.length) {
          const existForbiddenWord = blackListWords.find((word) =>
            body.text?.toLowerCase().includes(word.toLowerCase()),
          );
          if (existForbiddenWord) {
            Alert.alert(
              'Thất bại',
              `Không thể gửi tin nhắn vì có chứa từ cấm: ${existForbiddenWord}`,
            );
            return;
          }
        }
      }

      if (attachments) {
        body.attachments = attachments;
      }

      if (replyMessage) {
        body.replyMessage = replyMessage;
      }

      const temporaryMessages = createTemporaryMessages(body) as IMessage[];

      setMessages((previousMessages) => [
        ...temporaryMessages,
        ...previousMessages,
      ]);
      flatListReference.current?.scrollToIndex({
        animated: true,
        index: 0,
      });
      dispatch(setReplyMessage(undefined));

      const response = await ChatService.sendMessage(
        pageId,
        scopedUserId,
        body,
      );
      setMessages((previousMessages) => {
        return response
          ? previousMessages.map((message) => {
              delete message.loading;

              return message;
            })
          : previousMessages.filter((item) => !!item.loading);
      });
    },
    [
      replyMessage,
      createTemporaryMessages,
      dispatch,
      pageId,
      scopedUserId,
      parseMessage,
      blackListWords,
    ],
  );

  const onLongPress = useCallback(
    (
      event: GestureResponderEvent,
      message: { layoutHeight: number } & IMessage,
    ) => {
      const { locationX, locationY, pageX, pageY } = event.nativeEvent;
      const y = pageY - locationY;
      const x = pageX - locationX;

      setMessageCordinates({
        x,
        y,
      });
      setSelectedMessage(message);
    },
    [],
  );

  const renderItem = useCallback(
    ({ index, item }: ListRenderItemInfo<IMessage>) => {
      const nextMessage = messages[index + 1] as IMessage | undefined;
      const previousMessage = messages[index - 1] as IMessage | undefined;
      const showDateHeader =
        index === messages.length - 1 ||
        !nextMessage ||
        moment(item.timestamp).date() !== moment(nextMessage.timestamp).date();

      const isShowAvatar =
        previousMessage?.senderId !== item.senderId &&
        item.senderId !== item.pageId;
      return (
        <View
          style={{
            marginBottom: item.reaction?.length || 0 > 0 ? 20 : 8,
          }}
        >
          {showDateHeader ? (
            <Text
              style={{
                alignSelf: 'center',
                color: 'gray',
                marginVertical: 10,
              }}
            >
              {moment(item.timestamp).format('DD/MM/YYYY')}
            </Text>
          ) : null}
          <View
            style={
              item.senderId === item.pageId && {
                alignItems: 'flex-end',
                flex: 1,
                flexDirection: 'row',
                gap: 4,
              }
            }
          >
            <MessageItem
              isShowAvatar={isShowAvatar}
              message={item}
              onLongPress={onLongPress}
              setIsSender={setIsSender}
            />
          </View>
        </View>
      );
    },
    [messages, onLongPress],
  );

  const avatarConversation = useMemo(() => {
    return AvatarManager.getAvatarUser(pageId, {
      avatar: conversationActive.from?.avatar,
      scopedUserId: scopedUserId,
    });
  }, [pageId, conversationActive.from?.avatar, scopedUserId]);

  useEffect(() => {
    SocketManager.onUpdateSocket(ISocketEvent.message, handleUpdateMessage);
    void handleGetListMessage();
  }, []);

  return (
    <BottomSheetModalProvider>
      <SafeScreen>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
            }}
          >
            {/* Header */}
            <View
              style={{
                alignItems: 'center',
                borderBottomColor:
                  variant === 'dark'
                    ? config.colors.gray800
                    : config.borders.colors.gray200,
                borderBottomWidth: 0.5,
                flexDirection: 'row',
                gap: 8,
                padding: 10,
              }}
            >
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  gap: 4,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}
                >
                  <CaretLeft color={config.colors.gray400} />
                </TouchableOpacity>
                <View style={components.avatar}>
                  {avatarConversation ? (
                    <Image
                      source={{
                        uri: avatarConversation,
                      }}
                      style={components.avatar}
                    />
                  ) : (
                    <Text style={{ color: config.colors.gray100 }}>
                      {conversationActive.from.name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
              </View>
              <Text
                ellipsis
                style={{ flexShrink: 1, fontSize: 18, fontWeight: '500' }}
              >
                {conversationActive.from.name}
              </Text>
              <View
                style={{ flexDirection: 'row', gap: 16, marginLeft: 'auto' }}
              >
                <TouchableOpacity
                  onPress={() => {
                    bottomSheetReference.current?.present();
                  }}
                >
                  <View style={{ position: 'relative' }}>
                    <Tag color={config.colors.gray400} />
                    {scopedUser?.tags?.length ? (
                      <View
                        style={{
                          alignItems: 'center',
                          backgroundColor: colors.error,
                          borderRadius: 100,
                          height: 18,
                          justifyContent: 'center',
                          minWidth: 18,
                          paddingHorizontal: 4,
                          position: 'absolute',
                          right: -8,
                          top: -8,
                        }}
                      >
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 'bold',
                            lineHeight: 18,
                            textAlign: 'center',
                          }}
                        >
                          {scopedUser.tags.length > 99
                            ? '99+'
                            : scopedUser.tags.length}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}
                >
                  <NoteBlank color={config.colors.gray400} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              {/* List message */}
              <FlashList
                contentContainerStyle={{ padding: 4 }}
                data={messages}
                estimatedItemSize={100}
                inverted
                keyExtractor={(item, index) => item._id || index.toString()}
                onEndReached={() => {
                  void handleGetListMessage('loadMore');
                }}
                onEndReachedThreshold={0.7}
                ref={flatListReference}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
              />
              {/* Footer */}
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  gap: 8,
                }}
              >
                <ChatInputBar
                  onSendMessage={handleSendMessage}
                  setShowOptions={setShowOptions}
                  showOptions={showOptions}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
        {/* {showOptions ? (
          <Pressable
            onPress={() => {
              setShowOptions(false);
            }}
            style={{
              backgroundColor: 'transparent',
              bottom: 0,
              left: 0,
              position: 'absolute',
              right: 0,
              top: 0,
              zIndex: 10,
            }}
          />
        ) : null} */}
        <PanelOptionChat
          setShowOptions={setShowOptions}
          showOptions={showOptions}
        />
        <PortalView
          isSender={isSender}
          messageCordinates={messageCordinates}
          selectedMessage={selectedMessage}
          setMessages={setMessages}
          setSelectedMessage={setSelectedMessage}
        />
      </SafeScreen>
      <ModalTag
        bottomSheetReference={bottomSheetReference}
        scopedUser={scopedUser}
      />
    </BottomSheetModalProvider>
  );
}

export default memo(withMainLayout(ChatScreen));
