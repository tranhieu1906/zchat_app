/* eslint-disable react-hooks/rules-of-hooks */
import withMainLayout from '@/hoc/withMainLayout';
import AvatarManager from '@/managers/AvatarManager';
import SocketManager, { ISocketEvent } from '@/managers/SocketManager';
import { IAttachment } from '@/models/common';
import {
  CursorData,
  GetCommentDto,
  IComment,
  SendCommentDto,
  SendMessageDto,
  TypeReaction,
} from '@/models/ModelChat';
import { useAppSelector } from '@/redux/hooks';
import { setIsScrollToMessage } from '@/redux/slices/chatSlice';
import ChatService from '@/services/ChatService';
import PageService from '@/services/PageService';
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

import ChatInputBar from './components/ChatInputBar';
import MessageCommentItem from './components/MessageCommentItem';
import ModalTag from './components/ModalTag';
import PanelOptionChat from './components/PanelOptionChat';

function ChatComment() {
  const [comments, setComments] = useState<IComment[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [cursor, setCursor] = useState<CursorData>({
    afterCursor: undefined,
    beforeCursor: undefined,
  });

  const flatListReference = useRef<FlashList<IComment>>(null);
  const bottomSheetReference = useRef<BottomSheetModal>(null);
  const { colors, components, variant } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { conversationActive } = useAppSelector((state) => state.chat);

  if (!conversationActive) return null;
  const { feedId, pageId, scopedUserId } = conversationActive;
  const resultScopedUser = scopedUserId.includes('g')
    ? undefined
    : PageService.useGetDetaiScopedUser(pageId, scopedUserId);

  const scopedUser = useMemo(() => resultScopedUser?.data, [resultScopedUser]);
  const mutations = {
    useGetDetailPost: ChatService.useGetDetailPost(feedId),
    useGetListComment: ChatService.useGetListComment(),
  };

  const post = useMemo(
    () => mutations.useGetDetailPost.data,
    [mutations.useGetDetailPost.data],
  );

  const handleGetListComment = useCallback(
    async (type?: 'loadMore' | 'loadPrevious') => {
      const parameters: GetCommentDto = {
        postId: feedId,
        scopedUserId: scopedUserId,
      };

      if (type === 'loadMore') {
        if (!cursor.afterCursor) return;
        parameters.afterCursor = cursor.afterCursor;
      } else if (type === 'loadPrevious') {
        if (!cursor.beforeCursor) return;
        parameters.beforeCursor = cursor.beforeCursor;
      }

      await mutations.useGetListComment
        .mutateAsync(parameters)
        .then((result) => {
          const dataMessage = result.data;
          const updateMessageList = {
            default: () => {
              dispatch(setIsScrollToMessage(false));
              setComments(dataMessage);
              setCursor({ ...cursor, afterCursor: result.cursor.afterCursor });
            },
            loadMore: () => {
              setComments([...comments, ...dataMessage]);
              setCursor({ ...cursor, afterCursor: result.cursor.afterCursor });
            },
            loadPrevious: () => {
              setComments([...dataMessage, ...comments]);
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
      feedId,
      scopedUserId,
      mutations.useGetListComment,
      cursor,
      dispatch,
      comments,
    ],
  );

  const createTemporaryComment = useCallback(
    (body: SendMessageDto) => {
      const { attachments, text } = body;
      const baseComment: Partial<IComment> = {
        createdAt: new Date(),
        feedId: feedId,
        loading: true,
        mentions: [],
        pageReaction: TypeReaction.NONE,
        phoneInfo: [],
        senderId: pageId,
        updatedAt: new Date(),
      };

      const temporaryComments: Partial<IComment>[] = [];
      if (attachments?.length) {
        const [firstAttachment, ...restAttachments] = attachments || [];
        temporaryComments.push({
          ...baseComment,
          attachment: firstAttachment
            ? {
                id: '',
                type: firstAttachment.filetype,
                url: firstAttachment.url,
              }
            : undefined,
          message: text,
        });

        for (const attachment of restAttachments) {
          temporaryComments.push({
            ...baseComment,
            attachment: {
              id: '',
              type: attachment.filetype,
              url: attachment.url,
            },
          });
        }
      } else {
        temporaryComments.push({ ...baseComment, message: text });
      }

      return temporaryComments;
    },
    [feedId, pageId],
  );

  const handleSendComment = useCallback(
    async (message?: string, attachments?: IAttachment[]) => {
      const replyCommentId = comments[0]?._id || post?._id;

      const parameters: SendCommentDto = {
        attachments: attachments ?? [],
        message: message,
        objectId: replyCommentId ?? '',
        pageId: pageId,
      };
      const listTemporaryComments = createTemporaryComment({
        attachments: attachments,
        text: message,
      }) as any;

      setComments((previousMessages) => [
        ...listTemporaryComments,
        ...previousMessages,
      ]);

      flatListReference.current?.scrollToIndex({
        animated: true,
        index: 0,
      });

      const response = await ChatService.sendComment(parameters);
      setComments((previousMessages) => {
        return response
          ? previousMessages.map((message) => {
              delete message.loading;

              return message;
            })
          : previousMessages.filter((item) => !!item.loading);
      });
    },
    [comments, createTemporaryComment, pageId, post?._id],
  );

  const renderItem = useCallback(
    ({ index, item }: ListRenderItemInfo<IComment>) => {
      const previousMessage = comments[index - 1] as IComment | undefined;
      const nextMessage = comments[index + 1] as IComment | undefined;

      const showDateHeader =
        index === comments.length - 1 ||
        !nextMessage ||
        moment(item.createdAt).date() !== moment(nextMessage.createdAt).date();
      const isShowAvatar =
        previousMessage?.senderId !== item.senderId && item.senderId !== pageId;
      return (
        <View>
          {showDateHeader ? (
            <Text
              style={{
                alignSelf: 'center',
                color: 'gray',
                marginVertical: 10,
              }}
            >
              {moment(item.createdAt).format('DD/MM/YYYY')}
            </Text>
          ) : null}
          <View
            style={
              item.senderId === pageId && {
                alignItems: 'flex-end',
                flex: 1,
                flexDirection: 'row',
                gap: 4,
              }
            }
          >
            <MessageCommentItem
              comment={item}
              isShowAvatar={isShowAvatar}
              setComments={setComments}
            />
          </View>
        </View>
      );
    },
    [comments, pageId],
  );

  const handleUpdateComment = useCallback(
    (item: IComment) => {
      if (item.feedId !== feedId) return;

      setComments((previousComments) => {
        const listParentIds = previousComments
          .flatMap((c) => c.parentIds)
          .filter(Boolean);

        const isOwnTopLevel = !item.parentId && item.senderId === scopedUserId;
        const isReply = item.parentId && listParentIds.includes(item.parentId);

        if (!isOwnTopLevel && !isReply) return previousComments;

        const index = previousComments.findIndex((c) => c._id === item._id);

        if (index === -1) {
          const filtered = previousComments.filter((c) => c._id);
          const insertIndex = filtered.findIndex(
            (c) =>
              moment(c.createdAt).valueOf() < moment(item.createdAt).valueOf(),
          );
          const newComments = [...filtered];
          if (insertIndex === -1) {
            newComments.unshift(item);
            flatListReference.current?.scrollToIndex({
              animated: true,
              index: 0,
            });
          } else {
            newComments.splice(insertIndex, 0, item);
          }
          return newComments;
        } else {
          return previousComments.map((c) => (c._id === item._id ? item : c));
        }
      });
    },
    [feedId, scopedUserId],
  );

  const avatarConversation = useMemo(() => {
    return AvatarManager.getAvatarUser(pageId, {
      avatar: conversationActive.from?.avatar,
      scopedUserId: scopedUserId,
    });
  }, [pageId, conversationActive.from?.avatar, scopedUserId]);

  useEffect(() => {
    void handleGetListComment();
  }, []);

  useEffect(() => {
    SocketManager.onUpdateSocket(ISocketEvent.comment, handleUpdateComment);
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
                      source={{ uri: avatarConversation }}
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
            {/* List message */}
            <View style={{ flex: 1 }}>
              <FlashList
                contentContainerStyle={{ padding: 4 }}
                data={comments}
                estimatedItemSize={68}
                inverted
                keyExtractor={(item, index) => item._id || index.toString()}
                onEndReached={() => {
                  void handleGetListComment('loadMore');
                }}
                onEndReachedThreshold={0.7}
                ref={flatListReference}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
              />
            </View>
            {/* Footer */}
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                gap: 8,
              }}
            >
              <ChatInputBar
                onSendMessage={handleSendComment}
                setShowOptions={setShowOptions}
                showOptions={showOptions}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
        {/* {showOptions ? (
          <Pressable
            onPress={() => {
              setShowOptions(false);
            }}
            style={{
              backgroundColor: 'transparent', // hoặc rgba(0,0,0,0.1) nếu muốn bóng mờ
              bottom: 0,
              left: 0,
              position: 'absolute',
              right: 0,
              top: 0,
              zIndex: 10, // lớn hơn nội dung bên dưới
            }}
          />
        ) : null} */}

        <PanelOptionChat
          setShowOptions={setShowOptions}
          showOptions={showOptions}
        />
      </SafeScreen>
      <ModalTag
        bottomSheetReference={bottomSheetReference}
        scopedUser={scopedUser}
      />
    </BottomSheetModalProvider>
  );
}

export default memo(withMainLayout(ChatComment));
