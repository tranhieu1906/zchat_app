import withMainLayout from '@/hoc/withMainLayout';
import AvatarManager from '@/managers/AvatarManager';
import SocketManager, { ISocketEvent } from '@/managers/SocketManager';
import { CommonPlatform, TypeConversation } from '@/models/common';
import {
  CursorData,
  GetConversationDto,
  IConversation,
  IFilterConversation,
} from '@/models/ModelChat';
import { IPage } from '@/models/ModelPage';
import { useAppSelector } from '@/redux/hooks';
import {
  setConversationActive,
  setFilterConversation,
} from '@/redux/slices/chatSlice';
import ChatService from '@/services/ChatService';
import { loadAuth } from '@/utils/auth';
import { handleSnippet, isConversationMatched } from '@/utils/PageUtilities';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FlashList } from '@shopify/flash-list';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { cloneDeep, debounce, isNil, orderBy, uniqBy } from 'lodash';
import moment from 'moment';
import {
  ArrowBendUpLeft,
  BellSlash,
  CaretLeft,
  ChatCircleText,
  ChatsCircle,
  EnvelopeOpen,
  Phone,
  PushPin,
  PushPinSlash,
} from 'phosphor-react-native';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, TextInput, TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';

import { Paths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { config } from '@/theme/_config';

import { SafeScreen } from '@/components/templates';
import { Text } from '@/components/ui/text';

enum EKeyAction {
  PINNED,
  MARK_UNREAD,
  MARK_READ,
}

function ConversationsScreen() {
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [cursor, setCursor] = useState<CursorData>({
    afterCursor: undefined,
    beforeCursor: undefined,
  });

  const { colors, components, variant } = useTheme();
  const { pageSelected, pageSetting, tags } = useAppSelector(
    (state) => state.page,
  );
  const { actionConversations } = useAppSelector((state) => state.action);

  const { conversationActive, filterConversation } = useAppSelector(
    (state) => state.chat,
  );
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const { currentUser } = loadAuth();
  const listConversationReference = useRef<IConversation[]>([]);
  const socketQueueReference = useRef<IConversation[]>([]);
  const pageSelectedReference = useRef<IPage>(pageSelected);
  const filterConversationReference =
    useRef<IFilterConversation>(filterConversation);
  const conversationActiveReference = useRef<IConversation | undefined>(
    conversationActive,
  );
  const swipeableReference = useRef<SwipeableMethods>(null);

  const mutations = {
    bulkUpdateConversation: ChatService.useBulkUpdateConversation(),
    getListConversation: ChatService.useGetListConversations(),
    seenConversation: ChatService.useSeenConversation(),
  };

  const sortConversations = useCallback(
    (conversations: IConversation[]) => {
      if (filterConversation.sortByUnread) {
        return orderBy(
          conversations,
          ['isPinned', 'unread', 'updatedAt'],
          ['desc', 'desc', 'desc'],
        );
      }
      return orderBy(
        conversations,
        ['isPinned', 'updatedAt'],
        ['desc', 'desc'],
      );
    },
    [filterConversation.sortByUnread],
  );

  const handleUpdateConversation = (item: IConversation) => {
    const listConversations = cloneDeep(listConversationReference.current);
    const indexConversation = listConversations.findIndex(
      (element) => element._id === item._id,
    );

    const isPageSelected =
      pageSelectedReference.current.pageIds?.includes(item.pageId) ??
      pageSelectedReference.current.pageId === item.pageId;
    if (!isPageSelected) return;

    if (indexConversation !== -1) {
      listConversations[indexConversation] = {
        ...listConversations[indexConversation],
        ...item,
      };
    } else if (
      isConversationMatched({
        conversation: item,
        filterConversation: filterConversationReference.current,
        settingLiveChat: pageSetting?.settingLiveChat,
        user: currentUser,
      })
    ) {
      listConversations.unshift(item);
    }
    listConversationReference.current = sortConversations(listConversations);

    if (item._id === conversationActiveReference.current?._id) {
      dispatch(
        setConversationActive({
          ...conversationActiveReference.current,
          ...item,
        }),
      );
    }

    setConversations(listConversationReference.current);
  };

  const handleReceiveConversation = useCallback(
    async (item: IConversation) => {
      if (mutations.getListConversation.isPending) {
        socketQueueReference.current.push(item);
        return;
      }

      const listConversations = listConversationReference.current;

      // Trường hợp cùng nhẵn vào 1 nhóm zalo mà nhóm zalo trong danh sách hội thoại thuộc page khác thì bỏ qua.
      if (item.globalGroupId) {
        const conversationGroup = listConversations.find(
          (conversation) => conversation.globalGroupId === item.globalGroupId,
        );
        if (conversationGroup && conversationGroup.pageId !== item.pageId)
          return;
      }

      const isPageSelected =
        pageSelectedReference.current.pageIds?.includes(item.pageId) ??
        pageSelectedReference.current.pageId === item.pageId;
      if (!isPageSelected) return;

      const indexConversation = listConversations.findIndex(
        (element) => element._id === item._id,
      );
      if (indexConversation !== -1) {
        const currentItem = listConversations[indexConversation];
        const isReceiveMessage =
          item.unread !== currentItem.unread ||
          item.unreadCount !== currentItem.unreadCount;
        const newConversation = {
          ...listConversations[indexConversation],
          ...item,
        };

        if (item._id === conversationActiveReference.current?._id) {
          if (isReceiveMessage) {
            newConversation.unread = false;
            newConversation.unreadCount = 0;
            await mutations.seenConversation.mutateAsync({
              feedId: item.feedId,
              pageId: item.pageId,
              scopedUserId: item.scopedUserId,
              unread: false,
            });
          }

          dispatch(setConversationActive(newConversation));
        }

        if (!item.lastSentByPage) {
          // handleNotification(item);
        }
        const newConversations = sortConversations([
          newConversation,
          ...listConversations,
        ]);
        listConversationReference.current = uniqBy(newConversations, '_id');
      } else if (
        isConversationMatched({
          conversation: item,
          filterConversation: filterConversationReference.current,
          settingLiveChat: pageSetting?.settingLiveChat,
          user: currentUser,
        })
      ) {
        const newConversations = sortConversations([
          item,
          ...listConversations,
        ]);
        listConversationReference.current = uniqBy(newConversations, '_id');
      }

      setConversations(listConversationReference.current);
    },
    [
      currentUser,
      dispatch,
      mutations.getListConversation.isPending,
      mutations.seenConversation,
      pageSetting?.settingLiveChat,
      sortConversations,
    ],
  );

  const handleSelectedConversation = useCallback(
    async (conversation: IConversation) => {
      if (conversationActive?._id === conversation._id) return;
      const newConversations = listConversationReference.current;
      const index = newConversations.findIndex(
        (item) => item._id === conversation._id,
      );
      const newConversationActive = {
        ...newConversations[index],
        unread: false,
        unreadCount: 0,
      };
      conversationActiveReference.current = newConversationActive;
      dispatch(setConversationActive(newConversationActive));
      listConversationReference.current = newConversations.map((item) =>
        item._id === newConversationActive._id ? newConversationActive : item,
      );
      setConversations(listConversationReference.current);

      await mutations.seenConversation.mutateAsync({
        feedId: conversation.feedId,
        pageId: conversation.pageId,
        scopedUserId: conversation.scopedUserId,
        unread: false,
      });
    },
    [conversationActive?._id, dispatch, mutations.seenConversation],
  );

  const handleGetListConversation = useCallback(
    (type?: 'loadMore' | 'refresh') => {
      const parameters: GetConversationDto = {
        filter: filterConversation,
        pageId: pageSelected.pageIds?.length
          ? pageSelected.pageIds
          : pageSelected.pageId,
      };

      if (type === 'loadMore') {
        if (!cursor.afterCursor) return;
        parameters.afterCursor = cursor.afterCursor;
      }

      if (type === 'refresh') {
        parameters.afterCursor = undefined;
      }

      mutations.getListConversation
        .mutateAsync(parameters)
        .then((result) => {
          const dataConversation: IConversation[] = [];
          const uniqGroupConversation: Record<string, IConversation> = {};
          for (const item of result.data) {
            if (
              !item.globalGroupId ||
              !uniqGroupConversation[item.globalGroupId]
            ) {
              dataConversation.push(item);
            } else {
              uniqGroupConversation[item.globalGroupId] = item;
            }
          }

          const updateConversationList = {
            default: () => {
              listConversationReference.current = dataConversation;
              setConversations(dataConversation);
              setCursor({
                ...cursor,
                afterCursor: result.cursor.afterCursor,
              });
              if (socketQueueReference.current.length > 0) {
                for (const item of socketQueueReference.current) {
                  void handleReceiveConversation(item);
                }
                socketQueueReference.current = [];
              }
            },
            loadMore: () => {
              const newConverastion = [
                ...listConversationReference.current,
                ...dataConversation,
              ];
              listConversationReference.current = newConverastion;
              setConversations(newConverastion);
              setCursor({ ...cursor, afterCursor: result.cursor.afterCursor });
            },
          };
          if (type === 'refresh') {
            updateConversationList.default();
          } else if (type === 'loadMore') {
            updateConversationList.loadMore();
          } else {
            updateConversationList.default();
          }
        })
        .catch(() => {});
    },
    [
      filterConversation,
      pageSelected.pageIds,
      pageSelected.pageId,
      mutations.getListConversation,
      cursor,
      handleReceiveConversation,
    ],
  );

  const renderItem = useCallback(
    (item: IConversation) => {
      const avatarUrl = AvatarManager.getAvatarUser(item.pageId, {
        avatar: item.from?.avatar,
        scopedUserId: item.scopedUserId,
      });

      return (
        <ReanimatedSwipeable
          enableTrackpadTwoFingerGesture
          friction={2}
          ref={swipeableReference}
          renderRightActions={(progress, translation) =>
            RightAction(translation, item, (action: EKeyAction) => {
              swipeableReference.current?.close();
              void handleAction(action, item);
            })
          }
          rightThreshold={40}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (item?.feedId) {
                navigation.navigate(Paths.ChatComment);
              } else {
                navigation.navigate(Paths.Chat);
              }
              void handleSelectedConversation(item);
            }}
          >
            <View
              style={{
                borderBottomColor:
                  variant === 'dark'
                    ? config.colors.gray800
                    : config.borders.colors.gray200,
                borderBottomWidth: 1,
                flexDirection: 'row',
                minHeight: 86,
                paddingBottom: 4,
                paddingHorizontal: 10,
                paddingTop: 8,
                position: 'relative',
              }}
            >
              <View style={[components.avatar, { marginRight: 10 }]}>
                {avatarUrl ? (
                  <Image
                    source={{
                      uri: avatarUrl,
                    }}
                    style={components.avatar}
                  />
                ) : (
                  <Text style={{ color: config.colors.gray100 }}>
                    {item.from?.name.charAt(0).toUpperCase()}
                  </Text>
                )}
                {(item.unreadCount ?? 0) > 0 && (
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
                      right: -4,
                      top: -4,
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
                      {item.unreadCount > 99 ? '99+' : item.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 4,
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    ellipsis
                    style={{ flex: 1, fontSize: 16, fontWeight: '500' }}
                  >
                    {item.from?.name}
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    {moment(item.updatedAt).locale('vi').fromNow()}
                  </Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
                  {item.lastSentByPage ? (
                    <ArrowBendUpLeft
                      color={config.colors.gray400}
                      size={16}
                      style={{ marginTop: 2 }}
                    />
                  ) : null}
                  <Text ellipsis style={{ flex: 1, fontSize: 14 }}>
                    {handleSnippet(item.snippet)}
                  </Text>

                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 4,
                      marginLeft: 'auto',
                    }}
                  >
                    {item.isPinned ? (
                      <PushPin color={config.colors.gray400} size={20} />
                    ) : null}
                    {item.extraInfo?.notificationMute ? (
                      <BellSlash color={config.colors.gray400} size={20} />
                    ) : null}
                  </View>
                </View>
                {item.tags?.length > 0 && (
                  <View
                    style={{
                      alignItems: 'center',
                      flexDirection: 'row',
                      gap: 4,
                    }}
                  >
                    {item.tags.slice(0, 3).map((item) => {
                      const tag = tags.find((tag) => tag._id === item);
                      return (
                        <Text
                          ellipsis
                          key={item}
                          style={{
                            backgroundColor: tag?.color,
                            borderRadius: 8,
                            color: 'white',
                            fontSize: 12,
                            maxWidth: 100,
                            minWidth: 40,
                            paddingHorizontal: 6,
                            textAlign: 'center',
                          }}
                        >
                          {tag?.name}
                        </Text>
                      );
                    })}
                    {item.tags.length > 3 ? (
                      <Text
                        style={{
                          color: config.colors.gray400,
                          fontSize: 12,
                        }}
                      >
                        +{item.tags.length - 3}
                      </Text>
                    ) : null}
                  </View>
                )}
                <View
                  style={{
                    alignItems: 'center',
                    bottom: 0,
                    flex: 1,
                    flexDirection: 'row',
                    gap: 4,
                    position: 'absolute',
                    right: 0,
                  }}
                >
                  {item.hasPhone ? (
                    <Phone color={config.colors.success} size={22} />
                  ) : null}

                  {item.type === TypeConversation.INBOX ? (
                    <ChatCircleText
                      color={
                        item.unread
                          ? config.colors.primary
                          : config.colors.gray400
                      }
                      size={22}
                    />
                  ) : (
                    <ChatsCircle
                      color={
                        item.unread
                          ? config.colors.primary
                          : config.colors.gray400
                      }
                      size={22}
                    />
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </ReanimatedSwipeable>
      );
    },
    [components.avatar, handleSelectedConversation, navigation, variant, tags],
  );

  const handleAction = async (action: EKeyAction, item: IConversation) => {
    switch (action) {
      case EKeyAction.MARK_READ:
      case EKeyAction.MARK_UNREAD: {
        await mutations.bulkUpdateConversation.mutateAsync({
          conversationIds: [item._id],
          unread: action === EKeyAction.MARK_UNREAD,
        });
        break;
      }
      case EKeyAction.PINNED: {
        await mutations.bulkUpdateConversation.mutateAsync({
          conversationIds: [item._id],
          isPinned: !item?.isPinned,
        });
        break;
      }
    }
  };

  const handleActionConversations = () => {
    if (actionConversations.length > 0) {
      const newConversations = conversations.map((item) => {
        const existAction = actionConversations.find(
          (action) =>
            action.id === item._id ||
            (action.pageId === item.pageId &&
              action.scopedUserId === item.scopedUserId),
        );

        if (existAction) {
          return {
            ...item,
            assignGroupId: isNil(existAction?.assignGroupId)
              ? item.assignGroupId
              : existAction.assignGroupId,
            assignTo: isNil(existAction?.assignTo)
              ? item.assignTo
              : existAction.assignTo,
            isBlocked: isNil(existAction?.isBlocked)
              ? item.isBlocked
              : existAction.isBlocked,
            isPinned: isNil(existAction?.isPinned)
              ? item.isPinned
              : existAction.isPinned,
            unread: isNil(existAction?.unread)
              ? item.unread
              : existAction.unread,
            unreadCount: existAction?.unread ? item.unreadCount : 0,
          };
        }

        return item;
      });

      const conversationsSorted = sortConversations(newConversations);

      setConversations(conversationsSorted);
      listConversationReference.current = conversationsSorted;
    }
  };

  const handleSearch = useCallback(
    debounce((search: string) => {
      dispatch(setFilterConversation({ ...filterConversation, name: search }));
    }, 400),
    [],
  );

  const avatarPageUrl = useMemo(
    () => AvatarManager.getAvatarPage(pageSelected),
    [pageSelected],
  );

  useEffect(() => {
    handleActionConversations();
  }, [actionConversations]);

  useEffect(() => {
    handleGetListConversation();
  }, [filterConversation]);

  useEffect(() => {
    filterConversationReference.current = filterConversation;
  }, [filterConversation]);

  useEffect(() => {
    pageSelectedReference.current = pageSelected;
  }, [pageSelected]);

  useEffect(() => {
    SocketManager.onUpdateSocket(
      ISocketEvent.conversation,
      handleReceiveConversation,
    );
    SocketManager.onUpdateSocket(
      ISocketEvent.updateConversation,
      handleUpdateConversation,
    );
  }, []);

  useEffect(() => {
    if (
      pageSelected.pageId &&
      !(
        pageSelected.platform === CommonPlatform.personal_zalo &&
        !pageSelected.connected
      )
    ) {
      void SocketManager.startConnect(
        pageSelected.pageIds?.length
          ? pageSelected.pageIds
          : pageSelected.pageId,
      );
      // SocketManager.onUpdateSocket(ISocketEvent.page, handleUpdatePage);
    }
    if (
      [CommonPlatform.personal_zalo, CommonPlatform.zalo_oa].includes(
        pageSelected.platform,
      ) &&
      !pageSelected.connected
    ) {
      Alert.alert('Thất bại', 'Vui lòng kết nối lại Zalo', [
        {
          text: 'Đóng',
        },
        {
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: Paths.DashBoard }, { name: Paths.ConnectZalo }],
            });
          },
          text: 'Kết nối lại',
        },
      ]);
    }
  }, [pageSelected]);

  return (
    <SafeScreen
      isError={mutations.getListConversation.isError}
      onResetError={() => {
        handleGetListConversation('refresh');
      }}
    >
      <View style={{ flex: 1, paddingHorizontal: 8 }}>
        {/* Header */}
        <View
          style={{
            alignItems: 'center',
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
              {avatarPageUrl ? (
                <Image
                  source={{ uri: avatarPageUrl }}
                  style={components.avatar}
                />
              ) : (
                <Text style={{ color: config.colors.gray100 }}>
                  {pageSelected.name.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
          </View>
          <View>
            <Text
              ellipsis
              style={{ flexShrink: 1, fontSize: 18, fontWeight: '500' }}
            >
              {pageSelected.name}
            </Text>
            <Text
              onPress={async () =>
                await Clipboard.setStringAsync(pageSelected.pageId)
              }
            >
              {pageSelected.pageId}
            </Text>
          </View>
        </View>

        <View
          style={[
            {
              backgroundColor:
                variant === 'dark'
                  ? config.colors.gray800
                  : config.colors.gray100,
              borderRadius: 8,
              flexDirection: 'row',
              marginBottom: 8,
              paddingHorizontal: 8,
            },
          ]}
        >
          <TextInput
            onChangeText={handleSearch}
            placeholder="Tìm kiếm"
            style={{
              flex: 1,
              height: 40,
              paddingHorizontal: 16,
            }}
          />
        </View>

        {/* Conversations List */}
        <FlashList
          data={conversations}
          estimatedItemSize={90}
          keyExtractor={(item) => item._id}
          onEndReached={() => {
            handleGetListConversation('loadMore');
          }}
          onEndReachedThreshold={0.7}
          onRefresh={() => {
            handleGetListConversation('refresh');
          }}
          refreshing={mutations.getListConversation.isPending}
          renderItem={({ item }) => renderItem(item)}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeScreen>
  );
}

function RightAction(
  drag: SharedValue<number>,
  { isPinned, unread }: IConversation,
  handleAction: (key: EKeyAction) => void,
) {
  const { variant } = useTheme();

  const styleAnimation = useAnimatedStyle(() => {
    return {
      // eslint-disable-next-line react/destructuring-assignment
      transform: [{ translateX: drag.value + 140 }],
    };
  });

  return (
    <Reanimated.View
      style={[
        styleAnimation,
        {
          backgroundColor:
            variant === 'dark' ? config.colors.gray800 : config.colors.gray100,
          flexDirection: 'row',
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          handleAction(EKeyAction.PINNED);
        }}
        style={{
          alignItems: 'center',
          height: '100%',
          justifyContent: 'center',
          width: 70,
        }}
      >
        {isPinned ? (
          <PushPinSlash color={config.colors.gray400} />
        ) : (
          <PushPin color={config.colors.gray400} />
        )}
        <Text>{isPinned ? 'Bỏ ghim' : 'Ghim'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          handleAction(unread ? EKeyAction.MARK_READ : EKeyAction.MARK_UNREAD);
        }}
        style={{
          alignItems: 'center',
          height: '100%',
          justifyContent: 'center',
          width: 70,
        }}
      >
        <EnvelopeOpen color={config.colors.gray400} />
        <Text>{unread ? 'Đã đọc' : 'Chưa đọc'}</Text>
      </TouchableOpacity>
    </Reanimated.View>
  );
}
export default memo(withMainLayout(ConversationsScreen));
