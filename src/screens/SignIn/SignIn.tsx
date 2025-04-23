import { QrCode } from 'phosphor-react-native';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { AssetByVariant, IconByVariant } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';
import { Button } from '@/components/ui/button';

function SignIn() {
  const { layout } = useTheme();

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
            <Button icon={<IconByVariant path="facebook" />} onPress={() => {}}>
              Đăng nhập với Facebook
            </Button>
            <Button
              icon={<QrCode size={20} />}
              onPress={() => {}}
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
