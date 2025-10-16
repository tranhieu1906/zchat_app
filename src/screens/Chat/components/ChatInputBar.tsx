import { IAttachment } from '@/models/common';
import { useAppSelector } from '@/redux/hooks';
import { setKeyboardHeight, setSelectedPhotos } from '@/redux/slices/chatSlice';
import PageService from '@/services/PageService';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { DotsThreeCircle, PaperPlaneTilt } from 'phosphor-react-native';
import { memo, useCallback, useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';

import { useTheme } from '@/theme';

import MessageQuote from './MessageQuote';

const FormData = globalThis.FormData;

type ChatInputBarProps = {
  readonly onSendMessage: (
    message?: string,
    attachments?: IAttachment[],
  ) => Promise<void>;
  readonly setShowOptions: (show: boolean) => void;
  readonly showOptions: boolean;
};

function ChatInputBar({
  onSendMessage,
  setShowOptions,
  showOptions,
}: ChatInputBarProps) {
  const [message, setMessage] = useState('');
  const [openKeyboard, setOpenKeyboard] = useState(false);

  const { mutateAsync } = PageService.useUploadAttachmentPage();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { conversationActive, replyMessage, selectedPhotos } = useAppSelector(
    (state) => state.chat,
  );

  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        dispatch(setKeyboardHeight(event.endCoordinates.height));
        setOpenKeyboard(true);
      },
    );

    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setOpenKeyboard(false);
      },
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [dispatch]);

  const handleSend = useCallback(async () => {
    dispatch(setSelectedPhotos([]));
    setMessage('');
    if (!message.trim() && selectedPhotos.length === 0) return;
    let attachments: IAttachment[] = [];
    if (selectedPhotos.length > 0) {
      const filesInfo = await Promise.all(
        selectedPhotos.map((photo) => MediaLibrary.getAssetInfoAsync(photo)),
      );

      const uploadedAttachments = await Promise.all(
        filesInfo.map(async (file) => {
          const fileUri = file.uri;
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          if (!fileInfo.exists) return null;

          const form = new FormData();
          form.append('file', {
            name: file.filename,
            uri: fileUri,
          } as any);

          const response = await mutateAsync({
            form,
            pageId: conversationActive?.pageId ?? '',
          });
          return response?.data ?? null;
        }),
      );

      attachments = uploadedAttachments.filter(Boolean) as IAttachment[];
    }
    console.log('🚀 ~ handleSend ~ attachments:', attachments);

    await onSendMessage(message.trim(), attachments);
  }, [
    message,
    selectedPhotos,
    onSendMessage,
    dispatch,
    mutateAsync,
    conversationActive?.pageId,
  ]);

  const toggleOptions = useCallback(() => {
    if (showOptions && openKeyboard) {
      Keyboard.dismiss();
    } else if (openKeyboard && !showOptions) {
      Keyboard.dismiss();
      setShowOptions(!showOptions);
    } else {
      setShowOptions(!showOptions);
    }
  }, [setShowOptions, showOptions, openKeyboard]);

  return (
    <View style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 8 }}>
      {replyMessage ? <MessageQuote message={replyMessage} /> : null}
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 8,
          paddingTop: 8,
          zIndex: 20,
        }}
      >
        <View
          style={{
            alignItems: 'center',
            borderColor: colors.gray400,
            borderRadius: 20,
            borderWidth: 0.5,
            flex: 1,
            flexDirection: 'row',
            paddingHorizontal: 12,
          }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              multiline
              onChangeText={setMessage}
              placeholder="Aa..."
              placeholderTextColor={colors.gray400}
              style={{
                color: colors.gray400,
                flex: 1,
                fontSize: 16,
                maxHeight: 70,
                minHeight: 40,
                paddingHorizontal: 4,
                paddingVertical: 8,
              }}
              underlineColorAndroid="transparent"
              value={message}
            />
          </ScrollView>

          {message.trim() !== '' || selectedPhotos.length > 0 ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSend}
              style={{
                alignItems: 'center',
                backgroundColor: colors.primary,
                borderRadius: 16,
                height: 32,
                justifyContent: 'center',
                marginLeft: 8,
                width: 32,
              }}
            >
              <PaperPlaneTilt color="#FFFFFF" size={20} weight="fill" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={toggleOptions}
          style={{
            alignItems: 'center',
            height: 40,
            justifyContent: 'center',
            marginRight: 8,
          }}
        >
          <DotsThreeCircle color={colors.gray400} size={32} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default memo(ChatInputBar);
