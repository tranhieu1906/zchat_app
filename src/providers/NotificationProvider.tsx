import UserService from '@/services/UserService';
import { loadAuth } from '@/utils/auth';
import { getApp } from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  requestPermission,
  setAutoInitEnabled,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { PropsWithChildren, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

function NotificationProvider({ children }: PropsWithChildren) {
  const { currentUser } = loadAuth();
  const unsubscribeReference = useRef<() => void>(null);

  const { mutateAsync: saveFcmToken } = UserService.useSaveFcmToken();

  useEffect(() => {
    const requestUserPermission = async () => {
      const messagingInstance = getMessaging(getApp());
      const authStatus = await requestPermission(messagingInstance);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const token = await getToken(messagingInstance);
        if (token && currentUser?._id) {
          await saveFcmToken({
            platform: Platform.OS,
            token,
            userId: currentUser._id,
          });
        }
      }
    };

    const setupMessaging = async () => {
      const messagingInstance = getMessaging(getApp());
      if (Platform.OS === 'ios') {
        await setAutoInitEnabled(messagingInstance, true);
      }

      await requestUserPermission();

      // Handle foreground messages
      unsubscribeReference.current = onMessage(
        messagingInstance,
        (remoteMessage) => {
          console.warn('Received foreground message:', remoteMessage);
        },
      );

      // Handle background/quit state messages
      setBackgroundMessageHandler(messagingInstance, async (remoteMessage) => {
        console.warn('Received background message:', remoteMessage);
      });
    };

    void setupMessaging();

    return () => {
      unsubscribeReference.current?.();
    };
  }, [currentUser?._id, saveFcmToken]);

  return children;
}

export default NotificationProvider;
