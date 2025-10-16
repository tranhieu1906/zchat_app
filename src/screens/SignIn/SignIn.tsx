import { CommonPlatform } from '@/models/common';
import UserService from '@/services/UserService';
import { getFacebookUserInfo, loginWithFacebook } from '@/utils/facebook';
import * as appleAuth from 'expo-apple-authentication';
import { QrCode } from 'phosphor-react-native';
import { Platform, View } from 'react-native';

import { Paths } from '@/navigation/paths';
import { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { AssetByVariant, IconByVariant } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

function SignIn({ navigation }: RootScreenProps<Paths.SignIn>) {
  const { layout } = useTheme();

  const handleFacebookLogin = async (): Promise<void> => {
    const accessToken = await loginWithFacebook();
    if (accessToken) {
      const userInfo = await getFacebookUserInfo(accessToken);

      const result = await UserService.login({
        accessToken: accessToken,
        email: userInfo.email,
        id: userInfo.id,
        image: userInfo.picture.data.url,
        name: userInfo.name,
        platform: CommonPlatform.facebook,
      });
      if (result) {
        navigation.reset({
          index: 0,
          routes: [{ name: Paths.DashBoard }],
        });
      }
    }
  };

  const handleAppleLogin = async () => {
    const appleAuthRequestResponse = await appleAuth.signInAsync({
      requestedScopes: [
        appleAuth.AppleAuthenticationScope.FULL_NAME,
        appleAuth.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (appleAuthRequestResponse.authorizationCode) {
      const result = await UserService.login({
        accessToken: appleAuthRequestResponse?.identityToken ?? '',
        email: appleAuthRequestResponse?.email ?? '',
        id: appleAuthRequestResponse?.user,
        image: '',
        name:
          appleAuthRequestResponse.fullName?.familyName &&
          appleAuthRequestResponse.fullName?.givenName
            ? `${appleAuthRequestResponse?.fullName?.familyName} ${appleAuthRequestResponse?.fullName?.givenName}`
            : undefined,
        platform: CommonPlatform.apple,
      });
      if (result) {
        navigation.reset({
          index: 0,
          routes: [{ name: Paths.DashBoard }],
        });
      }
    }
  };

  return (
    <SafeScreen>
      <View style={[layout.col, layout.fullHeight, { paddingTop: 80 }]}>
        <View
          style={[
            layout.col,
            layout.itemsCenter,
            { gap: 200, height: '100%', marginTop: 20 },
          ]}
        >
          <AssetByVariant
            path="SolChat"
            resizeMode="contain"
            style={{ height: 200, width: 200 }}
          />

          <View style={[layout.col, { gap: 16, width: '75%' }]}>
            <Button
              icon={<IconByVariant path="facebook" />}
              onPress={handleFacebookLogin}
            >
              Đăng nhập với Facebook
            </Button>
            {Platform.OS === 'ios' && (
              <Button
                icon={<IconByVariant path="apple-logo" />}
                onPress={handleAppleLogin}
                style={{ backgroundColor: '#000' }}
                type="secondary"
              >
                <Text style={{ color: '#fff' }}>Đăng nhập với Apple</Text>
              </Button>
            )}
            <Button
              icon={<QrCode size={20} />}
              onPress={() => {
                navigation.navigate(Paths.CodeScanner);
              }}
              type="secondary"
            >
              Đăng nhập với mã QR
            </Button>
          </View>
        </View>
      </View>
    </SafeScreen>
  );
}

export default SignIn;
