import ZaloService from '@/services/ZaloService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowCounterClockwise } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Paths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type ConnectZaloScreenProps = {
  readonly pageId?: string;
};
export default function ConnectZaloScreen({ pageId }: ConnectZaloScreenProps) {
  const [statusQR, setStatusQR] = useState<'active' | 'expired'>('active');
  const [dataQR, setDataQR] = useState<any>();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    void initQRCode();
  }, []);

  const initQRCode = async () => {
    setStatusQR('active');
    const response = await ZaloService.generateQR();
    if (response?.data) {
      setDataQR(response.data);

      // Sau khi tạo mã xong thì sẽ đợi quét QR code
      handleWatingScan(response.data.code);
    }
  };

  const handleWatingScan = (code: string) => {
    ZaloService.waitingScan(code)
      .then(async (result) => {
        if (result?.data) {
          if (result.data?.display_name) {
            const response = await ZaloService.waitingConfirm(code, pageId);
            if (response?.data) {
              navigation.navigate(Paths.DashBoard);
            } else {
              setStatusQR('expired');
            }
          } else if (result.data?.code) {
            setDataQR(result.data);
            handleWatingScan(result.data.code);
            return;
          } else {
            setStatusQR('expired');
          }
        } else {
          setStatusQR('expired');
        }
      })
      .catch(() => {
        setStatusQR('expired');
      });
  };
  return (
    <SafeAreaView style={{ backgroundColor: '#fff', flex: 1 }}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 20 }}>
        <View
          style={{
            borderRadius: 8,
            overflow: 'hidden',
            padding: 2,
            position: 'relative',
          }}
        >
          <Image
            source={{ uri: dataQR?.image }}
            style={{
              height: 300,
              marginBottom: 20,
              resizeMode: 'contain',
              width: 300,
            }}
          />
          {statusQR === 'expired' ? (
            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#1d293973',
                borderRadius: 8,
                bottom: 0,
                justifyContent: 'center',
                left: 0,
                position: 'absolute',
                right: 0,
                top: 0,
                zIndex: 1,
              }}
            >
              <Button
                icon={<ArrowCounterClockwise size={16} />}
                onPress={() => initQRCode()}
                type="primary"
              >
                Nhấn để tạo lại mã QR
              </Button>
            </View>
          ) : null}
        </View>
        <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: 10 }}>
          Quét QR để kết nối Zalo với SolChat
        </Text>
        <View style={{ alignSelf: 'flex-start' }}>
          <Text style={styles.step}>1. Mở ứng dụng Zalo trên di động</Text>
          <Text style={styles.step}>2. Ở mục Cài đặt, nhấn nút quét QR</Text>
          <Text style={styles.step}>
            3. Nhấn album ảnh, chọn ảnh mã QR để đăng nhập
          </Text>
        </View>
        <Text style={styles.note}>
          Sau khi đăng nhập Zalo trên SolChat, bạn vui lòng KHÔNG quét đăng nhập
          lại trên Zalo phiên bản website (https://chat.zalo.me/) để tránh làm
          gián đoạn luồng tin đồng bộ về SolChat.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  note: {
    color: 'gray',
    fontSize: 14,
    marginTop: 20,
  },
  step: {
    fontSize: 16,
    marginBottom: 5,
  },
});
