import type { RootStackParamList } from '@/navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

import { QueryKeyPage } from '@/constants/QueryKey/QueryKeyPage';
import AvatarManager from '@/managers/AvatarManager';
import { CommonStatus } from '@/models/common';
import { IPage, IPageGroup } from '@/models/ModelPage';
import { resetChatSlice } from '@/redux/slices/chatSlice';
import { selectPage } from '@/redux/slices/pageSlice';
import PageService from '@/services/PageService';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LightningSlash, PushPin, PushPinSlash } from 'phosphor-react-native';
import { useRef } from 'react';
import { TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';

import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';
import { config } from '@/theme/_config';
import layout from '@/theme/layout';

import ConfirmBottomSheet, {
  ConfirmBottomSheetReference,
} from '@/components/ui/modal/ConfirmModal/ConfirmModal';
import { Text } from '@/components/ui/text';

type PageListProps = {
  readonly data: IPage[];
  readonly onRefresh?: () => void;
  readonly refreshing?: boolean;
};

export default function PageList({
  data,
  onRefresh,
  refreshing = false,
}: PageListProps) {
  const swipeableReference = useRef<SwipeableMethods>(null);
  const confirmReference = useRef<ConfirmBottomSheetReference>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, components, variant } = useTheme();
  const dispatch = useDispatch();
  const client = useQueryClient();

  const mutations = {
    useUpdatePage: PageService.useUpdatePage(),
    useUpdateStatusPage: PageService.useUpdateStatusPage(),
  };

  const handleAction = (key: 'disconnect' | 'pinned', record: IPage) => {
    if (key === 'disconnect') {
      confirmReference.current?.show({
        cancelText: 'Quay lại',
        confirmText: 'Huỷ kích hoạt trang',
        description:
          'Trang sẽ bị bỏ khỏi gói cước và các nhân viên trên trang sẽ không thể truy cập được nữa. Bạn có thể kích hoạt lại trang trong mục Kết nối',
        onConfirm: async () => {
          const result = await mutations.useUpdateStatusPage.mutateAsync({
            pageId: record.pageId,
            status: CommonStatus.deactivated,
          });

          if (result) {
            client.setQueryData(
              [QueryKeyPage.getPageGroups()],
              (oldData?: IPageGroup[]) => {
                if (!oldData) return oldData;
                return oldData.map((item) => {
                  if (
                    item.pages.some((page) => page.pageId === record.pageId)
                  ) {
                    return {
                      ...item,
                      pages: item.pages.filter(
                        (page) => page.pageId !== record.pageId,
                      ),
                    };
                  }
                  return item;
                });
              },
            );
          }
        },
        title: `Huỷ kích hoạt ${record.name}?`,
      });
    } else {
      mutations.useUpdatePage.mutate({
        isPinned: !record.isPinned,
        pageId: record.pageId,
      });
    }
  };

  const renderItem = ({ item }: { item: IPage }) => {
    const avatarUrl = AvatarManager.getAvatarPage(item);
    return (
      <ReanimatedSwipeable
        containerStyle={{
          borderBottomColor:
            variant === 'dark'
              ? config.colors.gray800
              : config.borders.colors.gray200,
          borderBottomWidth: 1,
        }}
        enableTrackpadTwoFingerGesture
        friction={2}
        ref={swipeableReference}
        renderRightActions={(progress, translation) =>
          RightAction(translation, item, (action) => {
            swipeableReference.current?.close();
            handleAction(action, item);
          })
        }
        rightThreshold={40}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            dispatch(resetChatSlice());
            dispatch(selectPage(item));
            navigation.navigate(Paths.Conversations, { pageId: item.pageId });
          }}
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 16,
          }}
        >
          <View style={[layout.row, layout.itemsCenter, { gap: 12 }]}>
            <View style={components.avatar}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={components.avatar} />
              ) : (
                <Text style={{ color: config.colors.gray100 }}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={[layout.col, layout.flex_1]}>
              <Text ellipsis style={{ fontSize: 16, fontWeight: '500' }}>
                {item.name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                }}
              >
                {item.pageId}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: item.connected ? colors.success : colors.error,
                borderRadius: 4,
                height: 8,
                width: 8,
              }}
            />
          </View>
        </TouchableOpacity>
      </ReanimatedSwipeable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={data}
        estimatedItemSize={100}
        keyExtractor={(item) => item._id}
        onRefresh={onRefresh}
        refreshing={refreshing}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
      <ConfirmBottomSheet ref={confirmReference} />
    </View>
  );
}

function RightAction(
  drag: SharedValue<number>,
  { isPinned }: IPage,

  handleAction: (key: 'disconnect' | 'pinned') => void,
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
          handleAction('pinned');
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
          handleAction('disconnect');
        }}
        style={{
          alignItems: 'center',
          height: '100%',
          justifyContent: 'center',
          width: 70,
        }}
      >
        <LightningSlash color={config.colors.gray400} />
        <Text>Huỷ</Text>
      </TouchableOpacity>
    </Reanimated.View>
  );
}
