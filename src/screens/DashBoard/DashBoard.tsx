import { CommonPlatform, CommonStatus } from '@/models/common';
import { IPage } from '@/models/ModelPage';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  setListPageActived,
  setListPageInactived,
} from '@/redux/slices/pageSlice';
import PageService from '@/services/PageService';
import { loadAuth } from '@/utils/auth';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Plus } from 'phosphor-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { DrawerParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { config } from '@/theme/_config';
import layout from '@/theme/layout';

import { SafeScreen } from '@/components/templates';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';

import ModalConnect from './components/ModalConnect';
import PageList from './components/PageList';

const TAB_CONFIG = [
  {
    getData: (filteredPages: IPage[]) => filteredPages,
    key: 'all',
    label: 'Tất cả',
  },
  {
    getData: (filteredPages: IPage[]) =>
      filteredPages.filter((page) => page.platform === CommonPlatform.facebook),
    key: 'facebook',
    label: 'Facebook',
  },
  {
    getData: (filteredPages: IPage[]) =>
      filteredPages.filter(
        (page) => page.platform === CommonPlatform.personal_zalo,
      ),
    key: 'zalo',
    label: 'Zalo',
  },
  {
    getData: (filteredPages: IPage[]) =>
      filteredPages.filter((page) => page.platform === CommonPlatform.zalo_oa),
    key: 'zalo_oa',
    label: 'Zalo OA',
  },
] as const;

export default function DashBoard() {
  const [search, setSearch] = useState('');
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  const bottomSheetReference = useRef<BottomSheetModal>(null);
  const { currentUser } = loadAuth();
  const dispatch = useAppDispatch();
  const { components, variant } = useTheme();
  const { listPageActived } = useAppSelector((state) => state.page);
  const {
    data: pages = [],
    dataUpdatedAt,
    isError,
    isRefetching,
    refetch,
  } = PageService.useGetFanpages();

  useEffect(() => {
    const listPageActived = pages.filter(
      (item) => item.status === CommonStatus.activated,
    );
    const listPageInactived = pages.filter(
      (item) => item.status === CommonStatus.deactivated,
    );
    dispatch(setListPageActived(listPageActived));
    dispatch(setListPageInactived(listPageInactived));
  }, [dataUpdatedAt, dispatch, pages]);

  const renderTabContent = useCallback(
    (data: IPage[]) => (
      <PageList data={data} onRefresh={refetch} refreshing={isRefetching} />
    ),
    [refetch, isRefetching],
  );

  const searchListPageActived = useMemo(
    () =>
      listPageActived.filter(
        (page) =>
          page.name.toLowerCase().includes(search.toLowerCase()) ||
          page.pageId.includes(search),
      ),
    [listPageActived, search],
  );

  const tabItems = useMemo(
    () =>
      TAB_CONFIG.map(({ getData, key, label }) => {
        const data = getData(searchListPageActived);
        return {
          badge: data.length,
          children: renderTabContent(data),
          key,
          label,
        };
      }),
    [searchListPageActived, renderTabContent],
  );

  return (
    <SafeScreen isError={isError} onResetError={refetch}>
      <View style={[layout.flex_1, { gap: 16, paddingHorizontal: 16 }]}>
        <View style={[layout.row, layout.itemsCenter, { gap: 12 }]}>
          <TouchableOpacity
            onPress={() => {
              navigation.openDrawer();
            }}
            style={components.avatar}
          >
            {currentUser.avatarUrl ? (
              <Image
                source={{ uri: currentUser.avatarUrl }}
                style={[components.avatar]}
              />
            ) : (
              <Text style={{ color: config.colors.gray100 }}>
                {currentUser.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>
          <View style={[layout.flex_1]}>
            <Text ellipsis style={{ fontSize: 18, fontWeight: '500' }}>
              {currentUser?.name}
            </Text>
          </View>
          {/* <View style={[layout.row]}>
              <Button icon={<Bell />} type="text" />
              <Button icon={<CirclesThreePlus />} type="text" />
            </View> */}
        </View>
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor:
                variant === 'dark'
                  ? config.colors.gray800
                  : config.colors.gray100,
            },
          ]}
        >
          <TextInput
            onChangeText={setSearch}
            placeholder="Tìm kiếm"
            style={styles.searchInput}
            value={search}
          />
        </View>

        <Tabs items={tabItems} type="card" />

        <Button
          icon={<Plus />}
          onPress={() => {
            bottomSheetReference.current?.present();
          }}
          style={styles.floatingButton}
        />
        <ModalConnect bottomSheetReference={bottomSheetReference} />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    alignItems: 'center',
    borderRadius: 28,
    bottom: 24,
    elevation: 5,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    width: 56,
  },
  searchContainer: {
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 16,
  },
});
