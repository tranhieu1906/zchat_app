import { IScopedUser, ITag } from '@/models/ModelPage';
import { useAppSelector } from '@/redux/hooks';
import PageService from '@/services/PageService';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { Check } from 'phosphor-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/theme';
import { config } from '@/theme/_config';

import { Text } from '@/components/ui/text';

type ModalTagProps = {
  readonly bottomSheetReference: React.RefObject<BottomSheetModal | null>;
  readonly scopedUser?: IScopedUser;
};

const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    pressBehavior="close"
  />
);

export default function ModalTag({
  bottomSheetReference,
  scopedUser,
}: ModalTagProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    scopedUser?.tags ?? [],
  );

  const { tags } = useAppSelector((state) => state.page);
  const { colors, variant } = useTheme();
  const mutations = {
    useUpdateScopedUser: PageService.useUpdateScopedUser(),
  };

  useEffect(() => {
    setSelectedTags(scopedUser?.tags ?? []);
  }, [scopedUser]);

  const filteredTags = useMemo(() => {
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [searchText, tags]);

  const toggleTag = useCallback(
    (id: string) => {
      const newTags = selectedTags?.includes(id)
        ? selectedTags.filter((tag) => tag !== id)
        : [...selectedTags, id];

      setSelectedTags(newTags);
      mutations.useUpdateScopedUser.mutate({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...scopedUser!,
        tags: newTags,
      });
    },
    [mutations.useUpdateScopedUser, scopedUser, selectedTags],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ITag>) => {
      const isSelected = selectedTags.includes(item._id);
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={mutations.useUpdateScopedUser.isPending}
          onPress={() => {
            toggleTag(item._id);
          }}
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            paddingBottom: 8,
          }}
        >
          <View
            style={{
              alignItems: 'center',
              backgroundColor: isSelected
                ? config.colors.primary
                : 'transparent',
              borderColor: isSelected
                ? config.colors.primary
                : config.colors.gray400,
              borderRadius: 10,
              borderWidth: 1.5,
              height: 15,
              justifyContent: 'center',
              marginRight: 12,
              width: 15,
            }}
          >
            {isSelected ? <Check color="white" size={12} /> : null}
          </View>
          <Text
            style={{
              borderBottomColor:
                variant === 'dark'
                  ? config.colors.gray800
                  : config.borders.colors.gray200,
              borderBottomWidth: 1,
              flex: 1,
              paddingBottom: 8,
            }}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedTags, toggleTag, variant],
  );

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
          height: 600,
          padding: 8,
        }}
      >
        <View style={{ flex: 1, padding: 8 }}>
          {mutations.useUpdateScopedUser.isPending ? (
            <ActivityIndicator />
          ) : null}
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            Gắn thẻ hội thoại
          </Text>
          <View
            style={{
              alignItems: 'center',
              backgroundColor:
                variant === 'dark'
                  ? config.colors.gray800
                  : config.colors.gray100,
              borderRadius: 8,
              flexDirection: 'row',
              height: 40,
              marginBottom: 12,
              paddingHorizontal: 8,
            }}
          >
            <TextInput
              onChangeText={setSearchText}
              placeholder="Tìm kiếm"
              style={{ flex: 1 }}
              value={searchText}
            />
          </View>

          <FlashList
            data={filteredTags}
            estimatedItemSize={50}
            extraData={selectedTags}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
