import { getFacebookUserInfo, loginWithFacebook } from '@/utils/facebook';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { View } from 'react-native';

import { Paths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

function ConnectFacebookScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleConnectFacebook = async () => {
    const accessToken = await loginWithFacebook();
    if (accessToken) {
      const result = await getFacebookUserInfo(accessToken, true);
      if (result) {
        navigation.navigate(Paths.DashBoard);
      }
    }
  };

  return (
    <View
      style={{
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: '50%',
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: '500',
          marginBottom: 12,
          textAlign: 'center',
        }}
      >
        Kết nối SolChat với trang Facebook
      </Text>

      <Text style={{ marginBottom: 24, textAlign: 'center' }}>
        Sử dụng SolChat để mở khoá mục tiêu mua hàng qua tin nhắn với chiến dịch
        quảng cáo tin nhắn, tự động tối ưu quảng cáo Facebook với CAPI
      </Text>

      <Button
        activeOpacity={0.6}
        onPress={handleConnectFacebook}
        size="large"
        style={{ width: '80%' }}
        type="secondary"
      >
        Kết nối với trang Facebook
      </Button>
    </View>
  );
}

export default ConnectFacebookScreen;
