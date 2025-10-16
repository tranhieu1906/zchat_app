import UserService from '@/services/UserService';
import { saveAuth } from '@/utils/auth';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Paths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import MyScanner from './components/Scanner';
import {
  RECT_MASK_TOP_SPACE,
  RECT_SIZE,
  ScannerMask,
} from './components/ScannerMask';

const FLASH_SPACE = RECT_MASK_TOP_SPACE + RECT_SIZE + 24;

function CodeScannerScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const mutations = {
    validateLoginQr: UserService.useValidateLoginQr(),
  };

  const [hasPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);

  const toggleFlash = () => {
    setFlash((preState) => !preState);
  };

  const onCodeRead = async (data: string) => {
    const result = await mutations.validateLoginQr.mutateAsync(
      JSON.parse(data),
    );

    if (result?.user) {
      await saveAuth(result.accessToken, result.user);
      navigation.reset({
        index: 0,
        routes: [{ name: Paths.DashBoard }],
      });
    }
  };

  return (
    <View style={styles.container}>
      <MyScanner
        cameraProps={{ torch: flash ? 'on' : 'off' }}
        onCodeRead={onCodeRead}
      >
        {hasPermission ? <ScannerMask /> : null}
      </MyScanner>
      {hasPermission ? (
        <View style={styles.container}>
          <View style={styles.rect} />
          <Pressable
            onPress={toggleFlash}
            style={[
              styles.flash,
              flash && {
                borderColor: 'white',
              },
            ]}
          >
            {/* <Image
            source={images.common.flash}
            style={
              flash && {
                tintColor: 'white',
              }
            }
          /> */}
            <Text
              style={[
                styles.text,
                flash && {
                  color: 'white',
                },
              ]}
            >
              Đèn flash
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default CodeScannerScreen;

const styles = StyleSheet.create({
  bottomLeftRadius: {
    bottom: -4,
    left: -4,
    position: 'absolute',
  },
  bottomRightRadius: {
    bottom: -4,
    position: 'absolute',
    right: -4,
  },
  cameraView: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  container: {
    flex: 1,
  },
  flash: {
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: 'absolute',
    top: FLASH_SPACE,
  },
  rect: {
    alignSelf: 'center',
    borderColor: 'white',
    borderRadius: 10,
    borderWidth: 3,
    height: RECT_SIZE,
    marginTop: RECT_MASK_TOP_SPACE,
    width: RECT_SIZE,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  topLefttRadius: {
    left: -4,
    position: 'absolute',
    top: -4,
  },
  topRightRadius: {
    position: 'absolute',
    right: -4,
    top: -4,
  },
});
