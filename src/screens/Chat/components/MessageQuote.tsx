import { IMessage } from '@/models/ModelChat';
import { useAppDispatch } from '@/redux/hooks';
import { setReplyMessage } from '@/redux/slices/chatSlice';
import { Image } from 'expo-image';
import { File, FileAudio, FileVideo, X } from 'phosphor-react-native';
import { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from '@/components/ui/text';

export const labelTypeAttachment: { label: string; type: string }[] = [
  { label: '[Audio]', type: 'audio' },
  { label: '[Hình ảnh]', type: 'image' },
  { label: '[Video]', type: 'video' },
  { label: '[Sticker]', type: 'sticker' },
  { label: '[Gif]', type: 'gif' },
  { label: '[Tệp đính kèm]', type: 'file' },
  { label: '[Danh thiếp]', type: 'card' },
  { label: '[Link]', type: 'link' },
];

function MessageQuote({
  hiddenClose = false,
  message,
}: {
  readonly hiddenClose?: boolean;
  readonly message: IMessage;
}) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();

  const handleSnippetReplyMessage = () => {
    if (message?.attachments?.length) {
      const attachment = message.attachments[0];

      const labelAttachment = labelTypeAttachment.find(
        (item) => item.type === attachment.type,
      );

      return labelAttachment?.label;
    }

    return message?.text;
  };

  const handleAttachment = () => {
    if (message.attachments?.length) {
      const attachment = message.attachments[0];
      const { payload, type } = attachment;

      if (type === 'audio') {
        return <FileAudio color={colors.primary} size={30} />;
      } else if (
        ['gif', 'image', 'sticker'].includes(type) ||
        payload?.thumbnailUrl
      ) {
        return (
          <Image
            source={{ uri: payload?.thumbnailUrl ?? payload?.url }}
            style={{ borderRadius: 6, height: 40, width: 40 }}
          />
        );
      } else if (type === 'video') {
        return <FileVideo color={colors.primary} size={30} />;
      } else if (type === 'file') {
        return <File color={colors.primary} size={30} />;
      }
    }

    return null;
  };
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: colors.gray200,
        borderColor: colors.gray200,
        borderRadius: 6,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
      }}
    >
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 8,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            borderLeftColor: colors.primary,
            borderLeftWidth: 2,
            height: 40,
            margin: 0,
          }}
        />
        {handleAttachment()}
        <View
          style={{
            overflow: 'hidden',
          }}
        >
          <Text
            ellipsis
            style={{
              fontWeight: '500',
            }}
          >
            {message.from?.name}
          </Text>
          <Text ellipsis>{handleSnippetReplyMessage()}</Text>
        </View>
      </View>

      {!hiddenClose && (
        <TouchableOpacity
          onPress={() => dispatch(setReplyMessage(undefined))}
          style={{
            padding: 4,
          }}
        >
          <X size={20} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default memo(MessageQuote);
