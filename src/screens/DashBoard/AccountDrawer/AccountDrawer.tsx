import UserService from '@/services/UserService';
import { clearAuth, loadAuth } from '@/utils/auth';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Image } from 'expo-image';
import {
  EnvelopeSimple,
  FacebookLogo,
  Gear,
  SquaresFour,
} from 'phosphor-react-native';
import { useMemo, useRef } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Paths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { config } from '@/theme/_config';

import { SafeScreen } from '@/components/templates';
import { Text } from '@/components/ui/text';

import ModalSettings from '../components/ModalSettings';

export default function AccountDrawer() {
  const bottomSheetReference = useRef<BottomSheetModal>(null);
  const { currentUser } = loadAuth();
  const { colors, components } = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const mutations = {
    useRemoveAccount: UserService.useRemoveAccount(),
  };

  const handleRemoveAccount = () => {
    Alert.alert(
      'Xoá tài khoản ?',
      'Bạn có chắc muốn xoá tài khoản khi xác nhận thì tất cả dữ liệu sẽ bị xoá và không thể khôi phục bạn có chắc chắn ?',
      [
        {
          text: 'Huỷ',
        },
        {
          onPress: async () => {
            const response = await mutations.useRemoveAccount.mutateAsync();
            if (response) {
              navigation.reset({
                index: 0,
                routes: [{ name: Paths.SignIn }],
              });
              void clearAuth();
            }
          },
          text: 'Xác nhận',
        },
      ],
    );
  };

  const menuItems = useMemo(
    () => [
      {
        active: true,
        icon: <SquaresFour color={colors.gray800} size={20} />,
        label: 'Danh sách trang đã kết nối',
        title: 'Trang cá nhân',
      },
      {
        handlePress: () => {
          bottomSheetReference.current?.present();
        },
        icon: <Gear color={colors.gray800} size={20} />,
        label: 'Cài đặt âm thanh, thông báo,...',
        title: 'Cài đặt ứng dụng',
      },
    ],
    [],
  );

  return (
    <SafeScreen
      style={{
        flex: 1,
        marginTop: 48,
        padding: 8,
      }}
    >
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: colors.gray200,
          gap: 8,
          marginTop: 32,
          paddingBottom: 16,
        }}
      >
        <View
          style={[
            components.avatar,
            { borderRadius: 40, height: 80, width: 80 },
          ]}
        >
          {currentUser?.avatarUrl ? (
            <Image
              source={{ uri: currentUser.avatarUrl }}
              style={[
                components.avatar,
                { borderRadius: 40, height: 80, width: 80 },
              ]}
            />
          ) : (
            <Text style={{ color: config.colors.gray100 }}>
              {currentUser?.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <Text ellipsis strong style={{ fontSize: 20 }}>
          {currentUser?.name}
        </Text>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 4 }}>
          <EnvelopeSimple color={colors.gray400} size={20} />
          <Text type="link">{currentUser?.email}</Text>
        </View>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 4 }}>
          <FacebookLogo color={colors.gray400} size={20} />
          <Text type="link">{currentUser?.userId}</Text>
        </View>
      </View>

      <View style={{ gap: 12, marginTop: 24 }}>
        {menuItems.map((item, index) => (
          <Pressable
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            onPress={item.handlePress}
            style={{
              alignItems: 'center',
              backgroundColor: item.active ? colors.gray100 : undefined,
              borderRadius: 8,
              flexDirection: 'row',
              gap: 12,
              paddingHorizontal: 8,
              paddingVertical: 12,
            }}
          >
            {item.icon}
            <View>
              <Text strong>{item.title}</Text>
              <Text style={{ color: colors.gray400 }}>{item.label}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={{ gap: 8, marginTop: 'auto' }}>
        {/* <Button
          icon={<TrashSimple />}
          onPress={handleRemoveAccount}
          type="danger"
        >
          Xoá tài khoản
        </Button> */}
      </View>
      <ModalSettings bottomSheetReference={bottomSheetReference} />
    </SafeScreen>
  );
}
