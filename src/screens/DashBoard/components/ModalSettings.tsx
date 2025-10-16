import type { RootStackParamList } from '@/navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

import UserService from '@/services/UserService';
import { clearAuth, loadAuth } from '@/utils/auth';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import { ArrowClockwise, SignOut } from 'phosphor-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  Linking,
  Pressable,
  Switch,
  View,
} from 'react-native';

import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type ModalSettingsProps = {
  readonly bottomSheetReference: React.RefObject<BottomSheetModal | null>;
};

const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    pressBehavior="close"
  />
);

export default function ModalSettings({
  bottomSheetReference,
}: ModalSettingsProps) {
  const [notifyPermissionGranted, setNotifyPermissionGranted] = useState(false);
  const [isFetchingUpdate, setIsFetchingUpdate] = useState(false);

  const { currentUser } = loadAuth();
  const { colors } = useTheme();
  const { currentlyRunning, isUpdatePending } = Updates.useUpdates();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { mutateAsync: removeFcmToken } = UserService.useRemoveFcmToken();

  const handleLogout = useCallback(() => {
    Alert.alert('Đăng xuất ?', 'Bạn có muốn đăng xuất ?', [
      {
        text: 'Huỷ',
      },
      {
        onPress: async () => {
          const messagingInstance = getMessaging(getApp());
          const token = await getToken(messagingInstance);
          if (token) {
            void removeFcmToken({ token, userId: currentUser?._id });
          }
          void clearAuth();
          navigation.reset({
            index: 0,
            routes: [{ name: Paths.SignIn }],
          });
        },
        text: 'Xác nhận',
      },
    ]);
  }, [navigation, currentUser?._id, removeFcmToken]);

  const checkNotificationPermission = useCallback(async () => {
    const settings = await Notifications.getPermissionsAsync();
    setNotifyPermissionGranted(
      settings.granted ||
        settings.ios?.status ===
          Notifications.IosAuthorizationStatus.PROVISIONAL,
    );
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    const settings = await Notifications.requestPermissionsAsync();
    if (!settings.canAskAgain) {
      void Linking.openSettings();
    }
    const granted =
      settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    setNotifyPermissionGranted(granted);
  }, []);

  const toggleNotificationPermission = useCallback(async () => {
    if (notifyPermissionGranted) {
      void Linking.openSettings();
    } else {
      await requestNotificationPermission();
    }
  }, [notifyPermissionGranted, requestNotificationPermission]);

  const handleFetchUpdate = useCallback(async () => {
    setIsFetchingUpdate(true);
    try {
      const result = await Updates.fetchUpdateAsync();
      if (result.isNew) {
        Alert.alert('Cập nhật thành công', 'Ứng dụng sẽ được tải lại.', [
          { onPress: () => void Updates.reloadAsync(), text: 'OK' },
        ]);
      } else {
        Alert.alert('Không có bản cập nhật mới');
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể tải bản cập nhật.');
    } finally {
      setIsFetchingUpdate(false);
    }
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        void checkNotificationPermission();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkNotificationPermission]);

  useEffect(() => {
    if (isUpdatePending) {
      void Updates.reloadAsync();
    }
  }, [isUpdatePending]);

  return (
    <BottomSheetModal
      backdropComponent={renderBackdrop}
      index={0}
      ref={bottomSheetReference}
    >
      <BottomSheetView style={{ gap: 16, height: 400, padding: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
          Cài đặt ứng dụng
        </Text>

        {/* Toggle items */}
        <View style={{ gap: 8 }}>
          <SettingItem
            label="Cho phép thông báo"
            rightComponent={
              <Switch
                onValueChange={toggleNotificationPermission}
                value={notifyPermissionGranted}
              />
            }
          />
        </View>

        {/* Footer */}
        <View style={{ gap: 12, marginBottom: 30, marginTop: 'auto' }}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: 4,
              justifyContent: 'center',
            }}
          >
            <Button
              icon={<ArrowClockwise />}
              onPress={handleFetchUpdate}
              type="link"
            >
              {isFetchingUpdate ? 'Đang tải...' : 'Cập nhật'}
            </Button>

            <Text style={{ color: colors.gray400, textAlign: 'center' }}>
              {`Version ${currentlyRunning.runtimeVersion}`}
            </Text>
          </View>
          <Button icon={<SignOut />} onPress={handleLogout}>
            Đăng xuất
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// Sub-component: setting item row
function SettingItem({
  label,
  onPress,
  rightComponent,
  rightText,
}: {
  readonly label: string;
  readonly onPress?: () => void;
  readonly rightComponent?: React.ReactNode;
  readonly rightText?: string;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
      }}
    >
      <Text style={{ fontSize: 16 }}>{label}</Text>
      {rightComponent ??
        (rightText && (
          <Text style={{ color: colors.gray400 }}>{rightText}</Text>
        ))}
    </Pressable>
  );
}
