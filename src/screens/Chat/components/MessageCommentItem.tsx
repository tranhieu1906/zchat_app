/* eslint-disable react-hooks/rules-of-hooks */
import AvatarManager from '@/managers/AvatarManager';
import { IComment } from '@/models/ModelChat';
import { useAppSelector } from '@/redux/hooks';
import ChatService from '@/services/ChatService';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
  EyeSlash,
  FacebookLogo,
  ThumbsUp,
  TrashSimple,
} from 'phosphor-react-native';
import {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/theme';
import { config, Variant } from '@/theme/_config';

import ConfirmBottomSheet, {
  ConfirmBottomSheetReference,
} from '@/components/ui/modal/ConfirmModal/ConfirmModal';
import { Text } from '@/components/ui/text';

type Props = {
  readonly comment: IComment;
  readonly isShowAvatar: boolean;
  readonly setComments: Dispatch<SetStateAction<IComment[]>>;
};
function MessageCommentItem({ comment, isShowAvatar, setComments }: Props) {
  const confirmReference = useRef<ConfirmBottomSheetReference>(null);
  const { colors, variant } = useTheme();
  const { conversationActive } = useAppSelector((state) => state.chat);
  const isSentByPage = useMemo(
    () => comment.senderId === conversationActive?.pageId,
    [conversationActive, comment],
  );
  if (!conversationActive) return;

  const mutations = {
    useDeleteComment: ChatService.useDeleteComment(),
    useHiddenComment: ChatService.useHiddenComment(),
    useLikeComment: ChatService.useLikeComment(),
  };

  const videoPlayer = useVideoPlayer({ uri: comment.attachment?.url });

  const handleAttachmentComment = (comment: IComment) => {
    if (comment?.attachment) {
      const type = comment?.attachment?.type;
      if (type === 'photo' || type === 'sticker') {
        return (
          <Image
            alt="Attachment"
            source={comment.attachment.url}
            style={{
              borderRadius: 8,
              height: 200,
              objectFit: 'cover',
              width: 200,
            }}
          />
        );
      } else if (type.includes('video')) {
        return (
          <View
            style={{
              borderRadius: 8,
              height: 200,
              overflow: 'hidden',
              width: 200,
            }}
          >
            {videoPlayer ? <VideoView player={videoPlayer} /> : null}
          </View>
        );
      } else {
        return (
          <Image
            alt="Attachment"
            source={comment.attachment.url}
            style={{ borderRadius: 8, objectFit: 'cover' }}
          />
        );
      }
    }

    return null;
  };

  const handleActionComment = useCallback(
    async (comment: IComment, key: 'delete' | 'hidden' | 'like') => {
      if (key === 'like') {
        const result = await mutations.useLikeComment.mutateAsync({
          commentId: comment._id,
          isLiked: !comment.isLiked,
          pageId: conversationActive.pageId,
        });
        if (result) {
          setComments((previous) => {
            return previous.map((item) =>
              item._id === comment._id
                ? { ...item, isLiked: !comment.isLiked }
                : item,
            );
          });
        }
      } else if (key == 'hidden') {
        const result = await mutations.useHiddenComment.mutateAsync({
          commentId: comment._id,
          isHidden: !comment.isHidden,
          pageId: conversationActive.pageId,
        });
        if (result) {
          setComments((previous) => {
            return previous.map((item) =>
              item._id === comment._id
                ? { ...item, isHidden: !comment.isHidden }
                : item,
            );
          });
        }
      } else if (key === 'delete') {
        confirmReference.current?.show({
          cancelText: 'Huỷ',
          confirmText: 'Có',
          description: '',
          onConfirm: async () => {
            const result = await mutations.useDeleteComment.mutateAsync({
              commentId: comment._id,
              pageId: conversationActive.pageId,
            });
            if (result) {
              setComments((previous) => {
                return previous?.map((item) =>
                  item._id === comment._id
                    ? { ...item, deletedAt: new Date() }
                    : item,
                );
              });
            }
          },
          title: `Bạn có muốn xoá bình luận này?`,
        });
      }
    },
    [
      conversationActive.pageId,
      mutations.useDeleteComment,
      mutations.useHiddenComment,
      mutations.useLikeComment,
      setComments,
    ],
  );

  const renderCommentContent = useCallback(() => {
    return (
      <View style={{ gap: 6 }}>
        <Text
          style={{
            color: isSentByPage
              ? variant === Variant.DARK
                ? colors.gray800
                : colors.gray50
              : colors.gray800,
          }}
        >
          {handleAttachmentComment(comment)}
          {comment.message}
        </Text>
        {comment.deletedAt ? (
          <Text type="danger">Bình luận đã được xoá</Text>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              gap: 4,
              justifyContent: isSentByPage ? 'flex-end' : 'flex-start',
            }}
          >
            {mutations.useLikeComment.isPending &&
            mutations.useLikeComment.variables.commentId === comment._id ? (
              <ActivityIndicator />
            ) : (
              <TouchableOpacity
                onPress={() => handleActionComment(comment, 'like')}
              >
                <ThumbsUp
                  color={
                    isSentByPage
                      ? variant === Variant.DARK
                        ? colors.gray800
                        : colors.gray50
                      : colors.gray800
                  }
                  size={20}
                  weight={comment.isLiked ? 'fill' : undefined}
                />
              </TouchableOpacity>
            )}
            {isSentByPage ? null : mutations.useHiddenComment.isPending &&
              mutations.useHiddenComment.variables.commentId === comment._id ? (
              <ActivityIndicator />
            ) : (
              <TouchableOpacity
                onPress={() => handleActionComment(comment, 'hidden')}
              >
                <EyeSlash
                  color={
                    isSentByPage
                      ? variant === Variant.DARK
                        ? colors.gray800
                        : colors.gray50
                      : colors.gray800
                  }
                  size={20}
                  weight={comment.isHidden ? 'fill' : undefined}
                />
              </TouchableOpacity>
            )}
            {!isSentByPage && (
              <TouchableOpacity
                onPress={() => Linking.openURL(`https://fb.com/${comment._id}`)}
              >
                <FacebookLogo
                  color={
                    isSentByPage
                      ? variant === Variant.DARK
                        ? colors.gray800
                        : colors.gray50
                      : colors.gray800
                  }
                  size={20}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => handleActionComment(comment, 'delete')}
            >
              <TrashSimple
                color={
                  isSentByPage
                    ? variant === Variant.DARK
                      ? colors.gray800
                      : colors.gray50
                    : colors.gray800
                }
                size={20}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }, [
    isSentByPage,
    handleAttachmentComment,
    comment,
    mutations.useLikeComment,
    mutations.useHiddenComment,
    handleActionComment,
  ]);

  const avatar = useMemo(() => {
    return AvatarManager.getAvatarUser(conversationActive?.pageId ?? '', {
      avatar: comment.from?.avatar,
      scopedUserId: comment.senderId,
    });
  }, [comment.from?.avatar, comment.senderId, conversationActive?.pageId]);

  return (
    <>
      <View
        style={{
          alignItems: 'flex-end',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            alignItems: 'center',
            backgroundColor:
              comment.from?.avatar || !isShowAvatar
                ? 'transparent'
                : colors.primary,
            borderRadius: 10,
            flexDirection: 'row',
            height: 20,
            justifyContent: 'center',
            marginRight: 4,
            width: 20,
          }}
        >
          {isShowAvatar ? (
            avatar ? (
              <Image
                source={{
                  uri: avatar,
                }}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 10,
                  height: 20,
                  width: 20,
                }}
              />
            ) : (
              <Text style={{ color: config.colors.gray100 }}>
                {comment.from?.name?.charAt(0).toUpperCase() ?? ''}
              </Text>
            )
          ) : null}
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: isSentByPage ? 'flex-end' : 'flex-start',
          }}
        >
          <View
            style={{
              alignSelf: isSentByPage ? 'flex-end' : 'flex-start',
              backgroundColor: isSentByPage ? colors.primary : colors.gray200,
              borderRadius: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              marginVertical: 2,
              maxWidth: '70%',
              padding: 8,
              position: 'relative',
            }}
          >
            {renderCommentContent()}
          </View>
        </View>
      </View>
      <ConfirmBottomSheet ref={confirmReference} />
    </>
  );
}
export default memo(MessageCommentItem);
