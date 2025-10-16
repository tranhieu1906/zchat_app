import type { Paths } from '@/navigation/paths';
import type { DrawerScreenProps as RNDrawerScreenProps } from '@react-navigation/drawer';
import type { StackScreenProps } from '@react-navigation/stack';

export type AppDrawerScreenProps<
  S extends keyof DrawerParamList = keyof DrawerParamList,
> = RNDrawerScreenProps<DrawerParamList, S>;

export type DrawerParamList = {
  [Paths.DashBoard]: undefined;
};

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;

export type RootStackParamList = {
  [Paths.AccountDrawer]: undefined;
  [Paths.Chat]: undefined;
  [Paths.ChatComment]: undefined;
  [Paths.ChatImage]: undefined;
  [Paths.CodeScanner]: undefined;
  [Paths.ConnectFacebook]: undefined;
  [Paths.ConnectZalo]: undefined;
  [Paths.Conversations]: { pageId: string };
  [Paths.DashBoard]: undefined;
  [Paths.DashBoardHome]: undefined;
  [Paths.SignIn]: undefined;
  [Paths.Startup]: undefined;
  [Paths.WaitingActive]: undefined;
};
