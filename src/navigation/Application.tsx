import type { RootStackParamList } from '@/navigation/types';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';

import { Button } from '@/components/ui/button';
import { DashBoard, SignIn, Startup } from '@/screens';
import { ListCommentScreen, ListMessageScreen } from '@/screens/Chat';
import ChatImage from '@/screens/Chat/components/ChatImage';
import CodeScannerScreen from '@/screens/code-scanner/CodeScannerScreen';
import { Conversations } from '@/screens/Conversations';
import {
  AccountDrawer,
  ConnectFacebookScreen,
  ConnectZaloScreen,
  WaitingActiveScreen,
} from '@/screens/DashBoard';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

function AccountDrawerComponent() {
  return <AccountDrawer />;
}

const headerOptions = (
  props: {
    navigation: NativeStackNavigationProp<RootStackParamList, Paths>;
    route: RouteProp<RootStackParamList, Paths>;
    theme: ReactNavigation.Theme;
  } & NativeStackNavigationOptions,
): NativeStackNavigationOptions => ({
  headerLeft: () => (
    <Button
      onPress={() => {
        props.navigation.goBack();
      }}
      type="link"
    >
      Đóng
    </Button>
  ),
  headerShown: true,
  ...props,
});

function ApplicationNavigator() {
  const { navigationTheme, variant } = useTheme();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator key={variant} screenOptions={{ headerShown: false }}>
          <Stack.Screen component={Startup} name={Paths.Startup} />
          <Stack.Screen component={SignIn} name={Paths.SignIn} />
          <Stack.Screen
            component={CodeScannerScreen}
            name={Paths.CodeScanner}
          />
          <Stack.Screen component={DashboardDrawer} name={Paths.DashBoard} />
          <Stack.Screen component={Conversations} name={Paths.Conversations} />
          <Stack.Screen component={ListMessageScreen} name={Paths.Chat} />
          <Stack.Screen
            component={ListCommentScreen}
            name={Paths.ChatComment}
          />
          {/* Modal Connected */}
          <Stack.Screen
            component={WaitingActiveScreen}
            name={Paths.WaitingActive}
            options={(props) =>
              headerOptions({ ...props, title: 'Chờ kích hoạt' })
            }
          />
          <Stack.Screen
            component={ConnectFacebookScreen}
            name={Paths.ConnectFacebook}
            options={(props) =>
              headerOptions({ ...props, title: 'Kết nối Facebook' })
            }
          />
          <Stack.Screen
            component={ConnectZaloScreen}
            name={Paths.ConnectZalo}
            options={(props) =>
              headerOptions({ ...props, title: 'Kết nối Zalo' })
            }
          />
          <Stack.Screen component={ChatImage} name={Paths.ChatImage} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function DashboardDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={AccountDrawerComponent}
      screenOptions={{
        drawerType: 'front',
        headerShown: false,
      }}
    >
      <Drawer.Screen component={DashBoard} name={Paths.DashBoardHome} />
    </Drawer.Navigator>
  );
}

export default ApplicationNavigator;
