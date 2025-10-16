import type { RootStackParamList } from '@/navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';

import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';
import layout from '@/theme/layout';

import { AssetByVariant } from '@/components/atoms';
import { Button } from '@/components/ui/button';

type ModalConnectProps = {
  readonly bottomSheetReference: React.RefObject<BottomSheetModal | null>;
};

const channels = [
  {
    iconPath: 'wait-activate',
    label: 'Chờ kích hoạt',
    path: Paths.WaitingActive,
  },
  {
    iconPath: 'facebook',
    label: 'Facebook',
    path: Paths.ConnectFacebook,
  },
  {
    iconPath: 'zalo',
    label: 'Zalo',
    path: Paths.ConnectZalo,
  },
];

const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    pressBehavior="close"
  />
);

export default function ModalConnect({
  bottomSheetReference,
}: ModalConnectProps) {
  const { colors } = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <BottomSheetModal
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.gray50,
      }}
      ref={bottomSheetReference}
    >
      <BottomSheetView
        style={{
          height: 300,
          padding: 16,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'space-between',
          }}
        >
          {channels.map((item) => (
            <Button
              icon={
                <AssetByVariant
                  path={item.iconPath}
                  resizeMode="contain"
                  style={{ borderRadius: 6, height: 24, width: 24 }}
                />
              }
              key={item.label}
              onPress={() => {
                bottomSheetReference.current?.dismiss();
                navigation.navigate(item.path as never);
              }}
              size="large"
              style={[
                layout.justifyStart,
                {
                  width: '48%',
                },
              ]}
              type="secondary"
            >
              {item.label}
            </Button>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
