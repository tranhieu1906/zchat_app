import { CommonStatus } from '@/models/common';
import { useAppSelector } from '@/redux/hooks';
import PageService from '@/services/PageService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FlashList } from '@shopify/flash-list';
import { Check } from 'phosphor-react-native';
import { useState } from 'react';
import { Image, TextInput, View } from 'react-native';

import { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { config } from '@/theme/_config';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

function WaitingActiveScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { components, variant } = useTheme();
  const { listPageInactived } = useAppSelector((state) => state.page);

  const mutations = {
    useBulkUpdateStatusPage: PageService.useBulkUpdateStatusPage(),
  };

  const filteredPages = listPageInactived.filter((page) =>
    page.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleActivate = async () => {
    if (selectedPageIds?.length) {
      const response = await mutations.useBulkUpdateStatusPage.mutateAsync({
        pageIds: selectedPageIds,
        status: CommonStatus.activated,
      });
      if (response) {
        navigation.goBack();
        setSelectedPageIds([]);
      }
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor:
            variant === 'dark' ? config.colors.gray800 : config.colors.gray100,
          borderRadius: 8,
          flexDirection: 'row',
          height: 40,
          marginBottom: 12,
        }}
      >
        <TextInput
          onChangeText={setSearchText}
          placeholder="Tìm kiếm"
          style={{ flex: 1, marginLeft: 8 }}
          value={searchText}
        />
      </View>
      <View style={{ flex: 1 }}>
        <FlashList
          data={filteredPages}
          estimatedItemSize={90}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View
              style={{
                borderBottomColor:
                  variant === 'dark'
                    ? config.colors.gray800
                    : config.borders.colors.gray200,
                borderBottomWidth: 1,
                marginBottom: 8,
              }}
            >
              <Button
                onPress={() => {
                  if (selectedPageIds.includes(item.pageId)) {
                    setSelectedPageIds(
                      selectedPageIds.filter((id) => id !== item.pageId),
                    );
                  } else {
                    setSelectedPageIds([...selectedPageIds, item.pageId]);
                  }
                }}
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  marginBottom: 8,
                  paddingHorizontal: 0,
                }}
                type="text"
              >
                <View style={[components.avatar, { marginRight: 12 }]}>
                  {item.avatarUrl ? (
                    <Image
                      source={{ uri: item.avatarUrl }}
                      style={[components.avatar]}
                    />
                  ) : (
                    <Text style={{ color: config.colors.gray100 }}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '500' }}>{item.name}</Text>
                  <Text>{item.pageId}</Text>
                </View>
                {selectedPageIds.includes(item.pageId) && (
                  <Check color={config.colors.primary} />
                )}
              </Button>
            </View>
          )}
        />
      </View>
      <Button
        disabled={selectedPageIds.length === 0}
        onPress={handleActivate}
        style={{ marginVertical: 16 }}
      >
        Kích hoạt
      </Button>
    </View>
  );
}

export default WaitingActiveScreen;
