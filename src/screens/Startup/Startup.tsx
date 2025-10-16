import type { RootScreenProps } from '@/navigation/types';

import SocketManager from '@/managers/SocketManager';
import { loadAuth } from '@/utils/auth';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';
import { AssetByVariant } from '@/components/atoms';

function Startup({ navigation }: RootScreenProps<Paths.Startup>) {
  const { fonts, gutters, layout } = useTheme();
  const { t } = useTranslation();
  const { token } = loadAuth();

  const { isError, isFetching, isSuccess } = useQuery({
    queryFn: () => {
      return Promise.resolve(true);
    },
    queryKey: ['startup'],
  });

  useEffect(() => {
    if (!isSuccess) return;
    if (token) {
      SocketManager.handleConnection();
    }

    navigation.reset({
      index: 0,
      routes: [{ name: token ? Paths.DashBoard : Paths.SignIn }],
    });
  }, [isSuccess, navigation, token]);

  return (
    <SafeScreen>
      <View
        style={[
          layout.flex_1,
          layout.col,
          layout.itemsCenter,
          layout.justifyCenter,
        ]}
      >
        <AssetByVariant
          path="SolChat"
          resizeMode="contain"
          style={{ height: 300, width: 300 }}
        />
        {isFetching ? (
          <ActivityIndicator size="large" style={[gutters.marginVertical_24]} />
        ) : undefined}
        {isError ? (
          <Text style={[fonts.size_16, fonts.error]}>{t('common_error')}</Text>
        ) : undefined}
      </View>
    </SafeScreen>
  );
}

export default Startup;
