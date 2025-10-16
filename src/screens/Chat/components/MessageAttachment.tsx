/* eslint-disable react/no-array-index-key */
import { IMessage } from '@/models/ModelChat';
import { parseTime } from '@/utils';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Download, FileText, Link, PhoneOutgoing } from 'phosphor-react-native';
import { memo, useState } from 'react';
import { Linking, TouchableOpacity, View } from 'react-native';
import { TapGestureHandler } from 'react-native-gesture-handler';
import ImageView from 'react-native-image-viewing';

import { useTheme } from '@/theme';

import { Text } from '@/components/ui/text';

const handleTitleMissCall = (parameters: any) => {
  switch (parameters.reason) {
    case 2: {
      return parameters.isCaller
        ? 'Người nhận không bắt máy'
        : 'Bạn bị nhỡ cuộc gọi';
    }

    case 3: {
      return 'Người nhận từ chối cuộc gọi';
    }

    case 4: {
      return 'Bạn đã huỷ cuộc gọi';
    }

    default: {
      return 'Bạn đã từ chối cuộc gọi';
    }
  }
};

function MessageAttachment({ message }: { readonly message: IMessage }) {
  const [imagePreview, setImagePreview] = useState<string>();

  const { colors, variant } = useTheme();

  const videoPlayer = useVideoPlayer({
    uri: message.attachments[0]?.payload?.url,
  });

  return (
    <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        {message.attachments.map((attachment, index) => {
          const type = attachment.type;
          const urlAttachment = attachment.payload.url;
          const payloadAttachment = attachment.payload;

          if (type === 'audio') {
            return (
              <View key={index} style={{ padding: 10 }}>
                {/* Sử dụng expo-av để play audio */}
                {/* <Audio.Sound source={{ uri: urlAttachment }} /> */}
                <Text>Audio File</Text>
              </View>
            );
          } else if (['gif', 'image', 'sticker'].includes(type)) {
            return (
              // eslint-disable-next-line @typescript-eslint/no-deprecated
              <TapGestureHandler
                key={index}
                onActivated={() => {
                  setImagePreview(urlAttachment);
                }}
              >
                <Image
                  contentFit="cover"
                  key={index}
                  source={{ uri: urlAttachment }}
                  style={{
                    borderRadius: 8,
                    borderWidth: 0.5,
                    height: 180,
                    width: 180,
                  }}
                />
              </TapGestureHandler>
            );
          } else
            switch (type) {
              case 'call': {
                return (
                  <View
                    key={index}
                    style={{
                      alignItems: 'center',
                      backgroundColor: colors.gray100,
                      borderRadius: 8,
                      flexDirection: 'row',
                      gap: 16,
                      padding: 10,
                    }}
                  >
                    <View>
                      <Text style={{ fontWeight: '500' }}>
                        {payloadAttachment.misscall
                          ? handleTitleMissCall(payloadAttachment.reason)
                          : 'Cuộc gọi đến'}
                      </Text>
                      <Text style={{ fontSize: 13 }}>
                        {payloadAttachment.misscall
                          ? 'Cuộc gọi thoại'
                          : parseTime(payloadAttachment.duration ?? 0)}
                      </Text>
                    </View>
                    <PhoneOutgoing
                      color={
                        payloadAttachment.misscall
                          ? colors.error
                          : colors.success
                      }
                      size={20}
                    />
                  </View>
                );
              }
              case 'card': {
                return (
                  <View
                    key={index}
                    style={{
                      backgroundColor: colors.gray100,
                      borderColor:
                        variant === 'dark' ? colors.gray400 : colors.gray200,
                      borderRadius: 16,
                      borderWidth: 1,
                      overflow: 'hidden',
                      width: 270,
                    }}
                  >
                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderColor:
                          variant === 'dark' ? colors.gray400 : colors.gray200,
                        padding: 8,
                      }}
                    >
                      <Text style={{ fontWeight: '500' }}>
                        Thông tin liên hệ
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        padding: 12,
                      }}
                    >
                      <View style={{ alignItems: 'center' }}>
                        <Image
                          source={{ uri: urlAttachment }}
                          style={{ borderRadius: 26, height: 52, width: 52 }}
                        />
                        <View>
                          <Text style={{ fontWeight: '500' }}>
                            {payloadAttachment.title}
                          </Text>
                          {payloadAttachment.description?.phone ? (
                            <TouchableOpacity>
                              <Text style={{ color: colors.primary }}>
                                {payloadAttachment.description.phone}
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <Text style={{ fontSize: 13 }}>
                              Chưa có số điện thoại
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 13 }}>Danh thiếp Zalo</Text>
                        <Image
                          source={{
                            uri: payloadAttachment.description.qrCodeUrl,
                          }}
                          style={{ borderRadius: 8, height: 100, width: 100 }}
                        />
                      </View>
                    </View>
                  </View>
                );
              }
              case 'file': {
                return (
                  <View
                    key={index}
                    style={{
                      backgroundColor: colors.gray100,
                      borderRadius: 8,
                      padding: 8,
                      width: 216,
                    }}
                  >
                    {payloadAttachment.thumbnailUrl ? (
                      <Image
                        source={{ uri: payloadAttachment.thumbnailUrl }}
                        style={{ borderRadius: 8, height: 200, width: 200 }}
                      />
                    ) : null}
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        gap: 4,
                        marginTop: 10,
                      }}
                    >
                      <FileText color={colors.primary} size={20} />
                      <View
                        style={{
                          flexShrink: 1,
                          marginLeft: 8,
                        }}
                      >
                        <Text ellipsis style={{ fontWeight: '500' }}>
                          {payloadAttachment.title}
                        </Text>
                        <Text style={{ fontSize: 12 }}>
                          File: {payloadAttachment.fileExt}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          /* Handle download */
                        }}
                        style={{ marginLeft: 'auto' }}
                      >
                        <Download size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }
              case 'link': {
                const partsTitle = (payloadAttachment.title ?? '').split(' ');

                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    key={index}
                    onPress={() => {
                      void Linking.openURL(urlAttachment);
                      /* handle open link */
                    }}
                    style={{
                      backgroundColor: colors.gray100,
                      borderRadius: 8,
                      maxWidth: 400,
                      padding: 8,
                    }}
                  >
                    <Text numberOfLines={1} style={{ fontWeight: '500' }}>
                      {partsTitle.map((part: string, index_: number) => (
                        <Text
                          key={`${message._id}-${part}-${index_}`}
                          style={{ fontWeight: '500' }}
                          type="link"
                        >
                          {part}
                        </Text>
                      ))}
                    </Text>
                    <View
                      style={{
                        alignItems: 'center',
                        flexDirection: 'row',
                        marginTop: 8,
                      }}
                    >
                      {payloadAttachment.thumbnailUrl ? (
                        <Image
                          source={{ uri: payloadAttachment.thumbnailUrl }}
                          style={{ borderRadius: 8, height: 80, width: 80 }}
                        />
                      ) : (
                        <View
                          style={{
                            alignItems: 'center',
                            backgroundColor: colors.gray200,
                            borderRadius: 8,
                            flex: 1,
                            height: 80,
                            justifyContent: 'center',
                            width: 80,
                          }}
                        >
                          <Link color={colors.gray100} size={32} />
                        </View>
                      )}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text numberOfLines={1} style={[{ fontWeight: '500' }]}>
                          {urlAttachment}
                        </Text>
                        <Text numberOfLines={2}>
                          {payloadAttachment.description}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }
              case 'template': {
                if (payloadAttachment.template_type === 'button') {
                  return (
                    <View key={index} style={{ gap: 8 }}>
                      {payloadAttachment.buttons?.map((button) => (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          key={button.payload}
                          style={{
                            alignItems: 'center',
                            backgroundColor: 'white',
                            borderRadius: 8,
                            minWidth: 150,
                            padding: 10,
                          }}
                        >
                          <Text numberOfLines={1}>{button.title}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                }

                if (payloadAttachment.template_type === 'icon-template') {
                  const element = payloadAttachment.elements?.[0];
                  return (
                    <View
                      key={index}
                      style={{
                        alignItems: 'center',
                        flexDirection: 'row',
                        gap: 16,
                        padding: 10,
                      }}
                    >
                      <View>
                        <Text style={{ color: 'black', fontWeight: '500' }}>
                          {element?.title}
                        </Text>
                        <Text style={{ fontSize: 13 }}>
                          {element?.subtitle}
                        </Text>
                      </View>
                      <PhoneOutgoing color={colors.success} size={28} />
                    </View>
                  );
                }

                break;
              }
              case 'video': {
                return (
                  <View
                    key={index}
                    style={{
                      borderRadius: 8,
                      height: 200,
                      overflow: 'hidden',
                      width: '100%',
                    }}
                  >
                    <VideoView
                      player={videoPlayer}
                      style={{ height: '100%', width: '100%' }}
                    />
                  </View>
                );
              }
            }
        })}
      </View>
      <ImageView
        imageIndex={0}
        images={imagePreview ? [{ uri: imagePreview }] : []}
        onRequestClose={() => {
          setImagePreview(undefined);
        }}
        presentationStyle="overFullScreen"
        swipeToCloseEnabled
        visible={!!imagePreview}
      />
    </>
  );
}

// function VideoScreen({ videoUrl }: { readonly videoUrl: string }) {
//   const player = useVideoPlayer({ uri: videoUrl });
//   return (
//     <View
//       style={{
//         borderRadius: 8,
//         height: 200,
//         overflow: 'hidden',
//         width: '100%',
//       }}
//     >
//       <VideoView player={player} />
//     </View>
//   );
// }

export default memo(MessageAttachment);
