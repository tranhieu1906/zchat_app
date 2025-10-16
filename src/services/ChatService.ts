/* eslint-disable react-hooks/rules-of-hooks */
import { QueryKeyChat } from '@/constants/QueryKey/QueryKeyChat';
import {
  AddOptionPollDto,
  AssignConversationDto,
  BulkUpdateConversationDto,
  CreateFolderImageDto,
  CreatePollDto,
  DeleteCommentDto,
  DeleteFolderImageDto,
  DeleteImageDto,
  FilterFolderImage,
  ForwardMessageDto,
  GetCommentDto,
  GetConversationDto,
  GetDetailConversationDto,
  GetMessageDto,
  GetSurroundingMessagesDto,
  IComment,
  IConversation,
  IFilterConversation,
  IFilterImage,
  IFolderImage,
  IImage,
  IMessage,
  IPost,
  ISender,
  PinMessageDto,
  ReactionMessageDto,
  ResponseInfinityQuery,
  ResponsePagingCursor,
  SendCardZaloDto,
  SendCommentDto,
  SendFileDto,
  SendMessageDto,
  TranslateCommentDto,
  TranslateListCommentDto,
  TranslateListMessageDto,
  TranslateMessageDto,
  UndoMessageDto,
  UpdateConversationDto,
  UpdateFolderImageDto,
  UpdateHiddenCommentDto,
  UpdateImageDto,
  UpdateLikeCommentDto,
  UploadImageDto,
  VotePollDto,
} from '@/models/ModelChat';
import { setActionConversations } from '@/redux/slices/actionSlice';
import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { isArray } from 'lodash';
import { useDispatch } from 'react-redux';

import { ApiClient } from './instance';

class ChatService {
  async sendComment(data: SendCommentDto) {
    const response = await ApiClient.POST('comments', data);

    return response?.data;
  }

  async sendFlowMessage(flowId: string, scopedUserId: string) {
    const response = await ApiClient.POST(`message-handler/send-flow`, {
      flowId: flowId,
      scopedUserId: scopedUserId,
    });

    return response;
  }

  async sendMessage(
    pageId: string,
    scopedUserId: string,
    data: SendMessageDto,
  ) {
    const response = await ApiClient.POST(
      `message?pageId=${pageId}&scopedUserId=${scopedUserId}`,
      data,
    );

    return response;
  }

  useAddOptionPoll(): UseMutationResult<any, unknown, AddOptionPollDto> {
    return useMutation({
      mutationFn: async (data: AddOptionPollDto) => {
        const response = await ApiClient.POST(
          `group-zalo/${data.pageId}/poll/add-option`,
          data,
        );
        return response;
      },
    });
  }

  useAssignConversation(): UseMutationResult<
    any,
    unknown,
    AssignConversationDto
  > {
    const dispatch = useDispatch();

    return useMutation({
      mutationFn: async (data: AssignConversationDto) => {
        const response = await ApiClient.POST(`conversation/assign`, data);

        return response?.data;
      },
      onSuccess: (data, variables) => {
        dispatch(
          setActionConversations([
            {
              assignGroupId: variables.assignGroupId,
              assignTo: variables.assignTo,
              id: variables._id,
            },
          ]),
        );

        return data;
      },
    });
  }

  useBlockConversation(): UseMutationResult<
    any,
    unknown,
    UpdateConversationDto
  > {
    const dispatch = useDispatch();

    return useMutation({
      mutationFn: async (data: UpdateConversationDto) => {
        const response = await ApiClient.POST(`conversation/block`, data);

        return response?.data;
      },
      onSuccess: (data, variables) => {
        dispatch(
          setActionConversations([
            {
              isBlocked: !!variables.block,
              pageId: variables.pageId,
              scopedUserId: variables.scopedUserId,
            },
          ]),
        );

        return data;
      },
    });
  }

  useBulkUpdateConversation(): UseMutationResult<
    any,
    unknown,
    BulkUpdateConversationDto
  > {
    const dispatch = useDispatch();

    return useMutation({
      mutationFn: async (data: BulkUpdateConversationDto) => {
        const response = await ApiClient.PUT(`conversation/bulk-update`, data);

        return response?.data;
      },
      onSuccess(data, variables) {
        dispatch(
          setActionConversations(
            variables.conversationIds.map((item) => {
              return {
                id: item,
                isPinned: variables.isPinned,
                unread: variables.unread,
              };
            }),
          ),
        );

        return data;
      },
    });
  }

  useCreateFolderImage = (): UseMutationResult<
    IFolderImage,
    unknown,
    CreateFolderImageDto
  > => {
    return useMutation({
      mutationFn: async (data: CreateFolderImageDto) => {
        const response = await ApiClient.POST('/folder-image', data);
        return response;
      },
    });
  };

  useCreatePoll(): UseMutationResult<any, unknown, CreatePollDto> {
    return useMutation({
      mutationFn: async (data: CreatePollDto) => {
        const response = await ApiClient.POST(
          `group-zalo/${data.groupId}/poll`,
          data,
        );
        return response;
      },
    });
  }

  useDeleteComment(): UseMutationResult<any, unknown, DeleteCommentDto> {
    return useMutation({
      mutationFn: async (data: DeleteCommentDto) => {
        const response = await ApiClient.POST(
          `comments/${data.commentId}/delete`,
          data,
        );

        return response?.data;
      },
    });
  }

  useDeleteFolderImage = (): UseMutationResult<
    IFolderImage,
    unknown,
    DeleteFolderImageDto
  > => {
    return useMutation({
      mutationFn: async (data: DeleteFolderImageDto) => {
        const response = await ApiClient.DELETE(`folder-image/${data._id}`);
        return response;
      },
    });
  };

  useDeleteImage = (): UseMutationResult<IImage, unknown, DeleteImageDto> => {
    return useMutation({
      mutationFn: async (data: DeleteImageDto) => {
        const response = await ApiClient.DELETE(`image`, {
          searchParams: { ids: data.ids.join(',') },
        });
        return response;
      },
    });
  };

  useForwardMessage(): UseMutationResult<any, unknown, ForwardMessageDto> {
    return useMutation({
      mutationFn: async (data: ForwardMessageDto) => {
        const response = await ApiClient.POST(`message/forward`, data);
        return response;
      },
    });
  }

  useGetCustomersConversation(
    pageId: string,
    scopedUserId: string,
  ): UseQueryResult<ISender[]> {
    return useQuery({
      enabled: scopedUserId.includes('g'),
      meta: {
        shouldPersist: false,
      },
      queryFn: async () => {
        const response = await ApiClient.GET(
          `conversation/${pageId}/customers/${scopedUserId}`,
        );

        return response?.data;
      },
      queryKey: [QueryKeyChat.getCustomers(pageId, scopedUserId)],
    });
  }

  useGetDetailConversation(): UseMutationResult<
    IConversation,
    unknown,
    GetDetailConversationDto
  > {
    return useMutation({
      mutationFn: async (data: GetDetailConversationDto) => {
        let url = `conversation/${data.pageId}/user/${data.scopedUserId}`;
        if (data.feedId) {
          url += `?feedId=${data.feedId}`;
        }
        const response = await ApiClient.GET(url);

        return response?.data;
      },
    });
  }

  useGetDetailPost(postId: string): UseQueryResult<IPost> {
    return useQuery({
      queryFn: async () => {
        const response = await ApiClient.GET(`post/${postId}`);

        return response?.data;
      },
      queryKey: [QueryKeyChat.getDetailPost(postId)],
    });
  }

  useGetInfiniteConversations(
    pageId: string | string[],
    parameters: IFilterConversation,
  ): UseInfiniteQueryResult<ResponseInfinityQuery<IConversation>> {
    return useInfiniteQuery({
      getNextPageParam: (lastPage: any) =>
        lastPage?.cursor?.afterCursor ?? undefined,
      getPreviousPageParam: (firstPage: any) =>
        firstPage?.cursor?.beforeCursor ?? undefined,
      initialPageParam: '',
      meta: {
        shouldPersist: false,
      },
      queryFn: async ({ pageParam }) => {
        const parametersRequest: any = {
          ...parameters,
          afterCursor: pageParam,
        };

        if (isArray(pageId)) {
          parametersRequest.pageIds = pageId;
        } else {
          parametersRequest.pageId = pageId;
        }

        const response = await ApiClient.GET(`conversation`, parametersRequest);

        return response;
      },
      queryKey: [QueryKeyChat.getConversations(pageId), parameters],
    });
  }

  useGetListComment(): UseMutationResult<
    ResponsePagingCursor<IComment>,
    unknown,
    GetCommentDto
  > {
    return useMutation({
      mutationFn: async (data: GetCommentDto) => {
        const { afterCursor, beforeCursor, postId, scopedUserId, signal } =
          data;
        const url = `post/${postId}/comments/${scopedUserId}`;
        const parameters: any = {};
        if (beforeCursor) {
          parameters.beforeCursor = beforeCursor;
        } else if (afterCursor) {
          parameters.afterCursor = afterCursor;
        }

        return (await ApiClient.GET(url, parameters, {
          signal: signal,
        })) as unknown as ResponsePagingCursor<IComment>;
      },
    });
  }

  useGetListConversations(): UseMutationResult<
    ResponsePagingCursor<IConversation>,
    unknown,
    GetConversationDto
  > {
    return useMutation({
      mutationFn: async (data: GetConversationDto) => {
        const { afterCursor, filter, pageId } = data;
        const parametersRequest: any = {
          ...filter,
        };
        if (afterCursor) {
          parametersRequest.afterCursor = afterCursor;
        }

        if (isArray(pageId)) {
          parametersRequest.pageIds = pageId;
        } else {
          parametersRequest.pageId = pageId;
        }

        return (await ApiClient.GET(
          `conversation`,
          parametersRequest,
        )) as unknown as ResponsePagingCursor<IConversation>;
      },
      retry: 2,
    });
  }

  useGetListFolder = (
    parameters?: FilterFolderImage,
  ): UseQueryResult<IFolderImage[]> => {
    return useQuery({
      enabled: !!parameters?.pageId,
      queryFn: async () => {
        const response = await ApiClient.GET('/folder-image', {
          ...parameters,
        });

        return response.data;
      },
      queryKey: [
        QueryKeyChat.getListFolder(),
        ...(parameters ? Object.values(parameters) : []),
      ],
    });
  };

  useGetListImage = (
    parameters?: IFilterImage,
  ): UseInfiniteQueryResult<IImage[]> => {
    const queryParameters = parameters ? Object.values(parameters) : [];
    return useInfiniteQuery({
      enabled: queryParameters.length > 0,
      getNextPageParam: (lastPage: any) =>
        lastPage?.pagination?.nextPage ?? undefined,
      getPreviousPageParam: (firstPage: any) =>
        firstPage?.pagination?.prevPage ?? undefined,
      initialPageParam: 1,
      meta: {
        shouldPersist: false,
      },
      queryFn: async ({ pageParam = 1 }) => {
        const response = await ApiClient.GET('/image', {
          page: pageParam,
          ...parameters,
        });
        return response;
      },
      queryKey: [QueryKeyChat.getListImage(), parameters],
      select(data) {
        // eslint-disable-next-line unicorn/no-array-reduce
        return data.pages.reduce((accumulator, page) => {
          if (page?.data) {
            accumulator = [...accumulator, ...page.data];
          }

          return accumulator;
        }, []);
      },
    });
  };

  useGetListMessage(): UseMutationResult<
    ResponsePagingCursor<IMessage>,
    unknown,
    GetMessageDto
  > {
    return useMutation({
      mutationFn: async (data: GetMessageDto) => {
        const {
          afterCursor,
          beforeCursor,
          filter,
          pageId,
          scopedUserId,
          signal,
        } = data;
        const parameters: any = { ...filter, pageId, scopedUserId };
        if (beforeCursor) {
          parameters.beforeCursor = beforeCursor;
        } else if (afterCursor) {
          parameters.afterCursor = afterCursor;
        }

        return (await ApiClient.GET('message', parameters, {
          signal,
        })) as unknown as ResponsePagingCursor<IMessage>;
      },
    });
  }

  useGetSurroundingMessages(): UseMutationResult<
    ResponsePagingCursor<IMessage>,
    unknown,
    GetSurroundingMessagesDto
  > {
    return useMutation({
      mutationFn: async (data: GetSurroundingMessagesDto) => {
        const response = await ApiClient.POST('/message/surround', data);
        return response;
      },
    });
  }

  useHiddenComment(): UseMutationResult<any, unknown, UpdateHiddenCommentDto> {
    return useMutation({
      mutationFn: async (data: UpdateHiddenCommentDto) => {
        const response = await ApiClient.POST(
          `comments/${data.commentId}/hidden`,
          data,
        );

        return response?.data;
      },
    });
  }

  useLikeComment(): UseMutationResult<any, unknown, UpdateLikeCommentDto> {
    return useMutation({
      mutationFn: async (data: UpdateLikeCommentDto) => {
        const response = await ApiClient.POST(
          `comments/${data.commentId}/like`,
          data,
        );

        return response?.data;
      },
    });
  }

  usePinMessage(): UseMutationResult<any, unknown, PinMessageDto> {
    return useMutation({
      mutationFn: async (data: PinMessageDto) => {
        const response = await ApiClient.POST(
          `conversation/${data.pageId}/pin-message`,
          data,
        );
        return response?.data;
      },
    });
  }

  useReactionMessage(): UseMutationResult<
    IMessage,
    unknown,
    ReactionMessageDto
  > {
    return useMutation({
      mutationFn: async (data: ReactionMessageDto) => {
        const response = await ApiClient.POST(`message/reaction`, data);

        return response?.data;
      },
    });
  }

  useSeenConversation(): UseMutationResult<
    IConversation,
    unknown,
    UpdateConversationDto
  > {
    const dispatch = useDispatch();

    return useMutation({
      mutationFn: async (data: UpdateConversationDto) => {
        const response = await ApiClient.POST(`conversation/seen`, data);

        return response?.data;
      },
      onSuccess: (data, variables) => {
        dispatch(
          setActionConversations([
            { id: data._id, unread: !!variables.unread },
          ]),
        );

        return data;
      },
    });
  }

  useSendCardZalo(): UseMutationResult<
    { msgId: string },
    unknown,
    SendCardZaloDto
  > {
    return useMutation({
      mutationFn: async (data: SendCardZaloDto) => {
        const response = await ApiClient.POST(`message/send-card-zalo`, data);

        return response?.data;
      },
    });
  }

  useSendFile(): UseMutationResult<any, unknown, SendFileDto> {
    return useMutation({
      mutationFn: async (data: SendFileDto) => {
        const response = await ApiClient.POST(
          `message/send-file/${data.pageId}/user/${data.scopedUserId}`,
          data.file,
          { timeout: Infinity },
        );

        return response?.data;
      },
    });
  }

  useTranslateComment(): UseMutationResult<
    IComment,
    unknown,
    TranslateCommentDto
  > {
    return useMutation({
      mutationFn: async (data: TranslateCommentDto) => {
        const response = await ApiClient.POST(`comments/translate`, data);

        return response?.data;
      },
    });
  }

  useTranslateListComment(): UseMutationResult<
    IComment[],
    unknown,
    TranslateListCommentDto
  > {
    return useMutation({
      mutationFn: async (data: TranslateListCommentDto) => {
        const response = await ApiClient.POST(
          '/comments/translate-list-comment',
          data,
        );

        return response?.data;
      },
    });
  }

  useTranslateListMessage(): UseMutationResult<
    IMessage[],
    unknown,
    TranslateListMessageDto
  > {
    return useMutation({
      mutationFn: async (data: TranslateListMessageDto) => {
        const response = await ApiClient.POST(
          '/message/translate-list-message',
          data,
        );

        return response?.data;
      },
    });
  }

  useTranslateMessage(): UseMutationResult<
    IMessage,
    unknown,
    TranslateMessageDto
  > {
    return useMutation({
      mutationFn: async (data: TranslateMessageDto) => {
        const response = await ApiClient.POST(`message/translate`, data);

        return response?.data;
      },
    });
  }

  useUndoMessage(): UseMutationResult<IMessage, unknown, UndoMessageDto> {
    return useMutation({
      mutationFn: async (data: UndoMessageDto) => {
        const response = await ApiClient.POST(`message/undo`, data);

        return response?.data;
      },
    });
  }

  useUpdateFolderImage = (): UseMutationResult<
    IFolderImage,
    unknown,
    UpdateFolderImageDto
  > => {
    return useMutation({
      mutationFn: async (data: UpdateFolderImageDto) => {
        const response = await ApiClient.PUT(`folder-image/${data._id}`, data);
        return response;
      },
    });
  };

  useUpdateImage = (): UseMutationResult<IImage, unknown, UpdateImageDto> => {
    return useMutation({
      mutationFn: async (data: UpdateImageDto) => {
        const response = await ApiClient.PUT(`image/${data._id}`, data);
        return response;
      },
    });
  };

  useUploadImages = (): UseMutationResult<IImage, unknown, UploadImageDto> => {
    return useMutation({
      mutationFn: async (data: UploadImageDto) => {
        const response = await ApiClient.POST(
          `image/upload/${data.pageId}`,
          data.formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            searchParams: {
              ...(data.folderName ? { folderName: data.folderName } : {}),
              ...(data.folderId ? { folderId: data.folderId } : {}),
            },
          },
        );
        return response;
      },
    });
  };

  useVotePoll(): UseMutationResult<any, unknown, VotePollDto> {
    return useMutation({
      mutationFn: async (data: VotePollDto) => {
        const response = await ApiClient.POST(
          `group-zalo/${data.pageId}/poll/vote`,
          data,
        );
        return response;
      },
    });
  }
}

export default new ChatService();
