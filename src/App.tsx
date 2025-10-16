import 'fast-text-encoding';
import 'moment/locale/vi';
import 'react-native-gesture-handler';

import rtkStore from '@/redux/store';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import moment from 'moment';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Host } from 'react-native-portalize';
import { enableScreens } from 'react-native-screens';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';

import ApplicationNavigator from '@/navigation/Application';
import { ThemeProvider } from '@/theme';
import '@/translations';

import NotificationProvider from './providers/NotificationProvider';
import { decodeJWT } from './utils';
import { saveAuth, TOKEN_KEY } from './utils/auth';

enableScreens();
moment.locale('vi');

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  useEffect(() => {
    // Notifications.setBadgeCountAsync(99).catch(console.warn);
    if (SecureStore.getItem(TOKEN_KEY) && __DEV__) {
      // const key =
      //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY3ZjRjZmIyNGUzYTU2MzJlNzBjMmZjMyIsInBsYXRmb3JtIjoiYnVzaW5lc3MiLCJ1c2VySWQiOiI2NGM0MmU1Zi01MDA5LTRkYmYtYjlmYS1mZGE5N2EzNGM4ZTYiLCJuYW1lIjoiTmd1eeG7hW4gVGjhu4sgSMawxqFuZyIsInN0YXR1cyI6ImFjdGl2YXRlZCIsImV4dHJhSW5mbyI6e30sInN5c3RlbSI6Inpzb2x1dGlvbiIsInJvbGUiOiJVU0VSIiwiY3JlYXRlZEF0IjoiMjAyNS0wNC0wOFQwNzoyNjo0Mi4wOTBaIiwicGFyZW50IjoiNjdjZmU3ZDExYmQxYzU2NTBkNDYxYmNlIiwiYW5jZXN0b3JzIjpbIjY3YzdlZjkyYTgxZWEwMWM5MjFhNzVhYSIsIjY3Y2ZlN2QxMWJkMWM1NjUwZDQ2MWJjZSJdLCJ1c2VyTmFtZSI6Imh1b25nbnQifSwiYWNjZXNzVG9rZW4iOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKMWMyVnlJanA3SWw5cFpDSTZJalkzWmpSalptSXlOR1V6WVRVMk16SmxOekJqTW1aak15SXNJbkJzWVhSbWIzSnRJam9pWW5WemFXNWxjM01pTENKMWMyVnlTV1FpT2lJMk5HTTBNbVUxWmkwMU1EQTVMVFJrWW1ZdFlqbG1ZUzFtWkdFNU4yRXpOR000WlRZaUxDSnVZVzFsSWpvaVRtZDFlZUc3aFc0Z1ZHamh1NHNnU01hd3hxRnVaeUlzSW5OMFlYUjFjeUk2SW1GamRHbDJZWFJsWkNJc0ltVjRkSEpoU1c1bWJ5STZlMzBzSW5ONWMzUmxiU0k2SW5wemIyeDFkR2x2YmlJc0luSnZiR1VpT2lKVlUwVlNJaXdpWTNKbFlYUmxaRUYwSWpvaU1qQXlOUzB3TkMwd09GUXdOem95TmpvME1pNHdPVEJhSWl3aWNHRnlaVzUwSWpvaU5qZGpabVUzWkRFeFltUXhZelUyTlRCa05EWXhZbU5sSWl3aVlXNWpaWE4wYjNKeklqcGJJalkzWXpkbFpqa3lZVGd4WldFd01XTTVNakZoTnpWaFlTSXNJalkzWTJabE4yUXhNV0prTVdNMU5qVXdaRFEyTVdKalpTSmRMQ0oxYzJWeVRtRnRaU0k2SW1oMWIyNW5iblFpZlN3aWFXRjBJam94TnpRNE5EZzNORFkzTENKbGVIQWlPakUzTlRNME9UZzJOamQ5Lm5mcFVCZzgwdm9vM0RuaVJ4SHpOWXZJdl9LT3lRTmI1MG1xRmlIRUItdWMiLCJpYXQiOjE3NDg0ODc0NjcsImV4cCI6MTc1MzQ5ODY2N30.GX1ceERRH0Ze3a1yMiEywfH3haAvPU4DFC-qco2UqGw';
      // const data = decodeJWT(key) as any;
      // if (data?.accessToken && data?.user)
      //   void saveAuth(data?.accessToken, data?.user);
    }
  }, []);

  return (
    <>
      <GestureHandlerRootView>
        <QueryClientProvider client={queryClient}>
          <Provider store={rtkStore}>
            <ThemeProvider>
              <Host>
                <NotificationProvider>
                  <BottomSheetModalProvider>
                    <ApplicationNavigator />
                  </BottomSheetModalProvider>
                </NotificationProvider>
              </Host>
            </ThemeProvider>
          </Provider>
        </QueryClientProvider>
      </GestureHandlerRootView>
      <Toast />
    </>
  );
}

export default App;
