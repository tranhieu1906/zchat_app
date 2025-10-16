import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setSelectedPhotos } from '@/redux/slices/chatSlice';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Camera, CaretLeft } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { config } from '@/theme/_config';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

const NUM_COLUMNS = 3;
const SPACING = 6;
const screenWidth = Dimensions.get('window').width;
const itemSize = (screenWidth - SPACING * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export default function ChatImage() {
  const [photos, setPhotos] = useState<
    ImagePicker.ImagePickerAsset[] | MediaLibrary.Asset[]
  >([]);
  const [endCursor, setEndCursor] = useState<null | string>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { selectedPhotos } = useAppSelector((state) => state.chat);
  const isFocused = useIsFocused();
  const { variant } = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();

  const loadPhotos = async (after?: string) => {
    try {
      setIsLoading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === ImagePicker.PermissionStatus.GRANTED) {
        const album = await MediaLibrary.getAssetsAsync({
          after,
          first: 100,
          mediaType: ['photo'],
          sortBy: [['creationTime', false]],
        });
        setPhotos((previous) =>
          after ? [...previous, ...album.assets] : album.assets,
        );
        setEndCursor(album.endCursor);
        setHasNextPage(album.hasNextPage);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPhotos();
  }, [isFocused]);

  const toggleSelect = (id: string) => {
    dispatch(
      setSelectedPhotos(
        selectedPhotos.includes(id)
          ? selectedPhotos.filter((u) => u !== id)
          : [...selectedPhotos, id],
      ),
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert('Permission Denied', 'Camera access is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!result.canceled && result.assets?.length) {
      const newPhoto = result.assets[0];
      setPhotos((previous) => [newPhoto, ...previous]);
      dispatch(setSelectedPhotos([newPhoto.uri, ...selectedPhotos]));
    }
  };

  const renderItem = ({ index, item }: any) => {
    // First box is camera
    if (index === 0) {
      return (
        <Pressable
          onPress={openCamera}
          style={[styles.imageContainer, { height: itemSize, width: itemSize }]}
        >
          <View style={styles.cameraBox}>
            <Camera size={24} />
          </View>
        </Pressable>
      );
    }

    const photo = item;
    const selectedIndex = selectedPhotos.indexOf(photo.id);

    return (
      <Pressable
        onPress={() => {
          toggleSelect(photo.id);
        }}
        style={[styles.imageContainer, { height: itemSize, width: itemSize }]}
      >
        <Image source={{ uri: photo.uri }} style={styles.image} />
        {selectedIndex !== -1 && (
          <View style={styles.overlay}>
            <Text style={styles.checkmark}>{selectedIndex + 1}</Text>
          </View>
        )}
        {photo.mediaType === 'video' && (
          <View style={{ bottom: 4, position: 'absolute', right: 4 }}>
            <Text style={styles.checkmark}>
              {Math.floor(photo.duration / 60)
                .toString()
                .padStart(1, '0')}
              :
              {Math.floor(photo.duration % 60)
                .toString()
                .padStart(2, '0')}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          alignItems: 'center',
          borderBottomColor:
            variant === 'dark'
              ? config.colors.gray800
              : config.borders.colors.gray200,
          borderBottomWidth: 0.5,
          flexDirection: 'row',
          gap: 8,
          padding: 10,
        }}
      >
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: 4,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
          >
            <CaretLeft color={config.colors.gray400} />
          </TouchableOpacity>
        </View>
        <Text style={styles.header}>Chọn ảnh</Text>
        <Button
          disabled={selectedPhotos.length === 0}
          onPress={() => {
            navigation.pop();
          }}
          style={{ marginLeft: 'auto' }}
          type="secondary"
        >
          Chọn
        </Button>
      </View>
      <FlashList
        contentContainerStyle={styles.list}
        data={[{ camera: true }, ...photos]}
        estimatedItemSize={itemSize}
        keyExtractor={(item, index) => index.toString()}
        numColumns={NUM_COLUMNS}
        onEndReached={() => {
          if (!isLoading && hasNextPage && endCursor) {
            void loadPhotos(endCursor);
          }
        }}
        onEndReachedThreshold={0.7}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cameraBox: {
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 26,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
  },
  container: { backgroundColor: '#fff', flex: 1 },
  header: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '500',
    padding: 12,
  },
  image: {
    borderRadius: 8,
    height: '100%',
    width: '100%',
  },
  imageContainer: {
    margin: SPACING / 2,
    position: 'relative',
  },
  list: {
    paddingHorizontal: SPACING,
  },
  overlay: {
    backgroundColor: config.backgrounds.primary,
    borderRadius: 100,
    paddingHorizontal: 8,
    position: 'absolute',
    right: 6,
    top: 6,
  },
});
