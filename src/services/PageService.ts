/* eslint-disable unicorn/no-array-reduce */
/* eslint-disable react-hooks/rules-of-hooks */
import { QueryKeyPage } from '@/constants/QueryKey/QueryKeyPage';
import {
  CommonFilter,
  CommonStatus,
  IFilterPageAttachment,
  IFilterUser,
  IFlowsFilter,
  IPaging,
  IResponse,
  PrefixPlatformEnum,
} from '@/models/common';
import { IConversation, ResponseInfinityQuery } from '@/models/ModelChat';
import {
  AddFriendDto,
  ConnectDatasetDto,
  ConversationReferral,
  CreateFlowDto,
  CreateGroupDto,
  CreateKeywordDto,
  CreatePageGroupDto,
  CreateQuickReplyDto,
  CreateSequenceDto,
  CreateTagDto,
  IFindUserZalo,
  IFlow,
  IGroupZalo,
  IKeywordItem,
  IPage,
  IPageGroup,
  IPageSettings,
  IQuickReply,
  IRecommUser,
  IScopedUser,
  ISequence,
  ISocialAccount,
  ITag,
  IUpdatePageDto,
  IUpdateScopedUserDto,
  MemberProfile,
  PageAttachments,
  SendEventFacebookDto,
  StatisticsUserSequences,
  StatisticsUserTags,
  UpdateFlowDto,
  UpdateKeywordDto,
  UpdatePageGroupDto,
  UpdateQuickReplyDto,
  UpdateSequenceDto,
  UpdateSequenceStepDto,
  UpdateStatusPageDto,
  UpdateTagDto,
} from '@/models/ModelPage';
import { useAppSelector } from '@/redux/hooks';
import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { isArray, isNil } from 'lodash';

import { ApiClient } from './instance';

class PageService {
  async createKeyword(data: CreateKeywordDto) {
    const response = await ApiClient.POST('keyword', data);
    return response;
  }

  updateFlow = async (id: string, data: UpdateFlowDto) => {
    const response = await ApiClient.PUT(`flows/${id}`, data);
    return response;
  };

  useAcceptFriend(): UseMutationResult<
    IConversation,
    unknown,
    { friendId: string; pageId: string }
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: { friendId: string; pageId: string }) => {
        const response = await ApiClient.POST(
          `zalo/${data.pageId}/accept-friend/${data.friendId}`,
        );

        return response?.data;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getRecommendFriends(variables.pageId)],
          (oldData?: IRecommUser[]) => {
            if (!oldData) return oldData;
            return oldData.filter((item) => item.userId !== variables.friendId);
          },
        );

        return data;
      },
    });
  }

  useAddFriendZalo(): UseMutationResult<
    any,
    unknown,
    { data: AddFriendDto; pageId: string }
  > {
    return useMutation({
      mutationFn: async (data: { data: AddFriendDto; pageId: string }) => {
        const response = await ApiClient.POST(
          `zalo/${data.pageId}/add-friend`,
          data.data,
        );

        return response?.data;
      },
    });
  }

  useAddMemberGroup(): UseMutationResult<
    IGroupZalo,
    unknown,
    { groupId: string; memberIds: string[] }
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: { groupId: string; memberIds: string[] }) => {
        const response = await ApiClient.POST(
          `group-zalo/${data.groupId}/add-user`,
          data,
        );

        return response?.data;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getDetailGroupZalo(variables.groupId)],
          () => {
            return data;
          },
        );

        const queryCache = client.getQueryCache().find({
          exact: false,
          queryKey: [QueryKeyPage.getMemberGroup(variables.groupId)],
        });
        if (queryCache) {
          client.setQueryData(
            queryCache.queryKey,
            (oldData?: MemberProfile[]) => {
              if (!oldData) return oldData;

              return [...oldData, ...data.members];
            },
          );
        }

        return data;
      },
    });
  }

  useAddSequenceStep(): UseMutationResult<ISequence, unknown, string> {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (sequenceId: string) => {
        const response = await ApiClient.POST(
          `sequence/${sequenceId}/add-step`,
        );

        return response?.data;
      },
      onSuccess(data, variables) {
        client.setQueryData([QueryKeyPage.getDetailSequenece(variables)], data);
        return data;
      },
    });
  }

  useBulkDeleteFlow(): UseMutationResult<any, unknown, string[]> {
    const client = useQueryClient();
    const { pageSelected } = useAppSelector((state) => state.page);

    return useMutation({
      mutationFn: async (ids: string[]) => {
        const response = await ApiClient.POST(`flows/bulk-delete`, { ids });

        return response;
      },
      onSuccess: (data, ids) => {
        const queryCache = client.getQueryCache().find({
          exact: false,
          queryKey: [QueryKeyPage.getFlows(pageSelected.pageId)],
        });
        if (queryCache) {
          client.setQueryData(queryCache.queryKey, (oldData?: any) => {
            if (!oldData) return oldData;

            const newData = {
              ...oldData,
              pages: oldData.pages?.map((page: any) => {
                const newPage = {
                  ...page,
                  data: page.data.filter(
                    (item: IFlow) => !ids.includes(item._id),
                  ),
                };
                return newPage;
              }),
            };

            return newData;
          });
        }

        return data;
      },
    });
  }

  useBulkDeletePage(): UseMutationResult<IPage[], unknown, string[]> {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (pageIds: string[]) => {
        const response = await ApiClient.POST(`fanpage/bulk-delete`, {
          pageIds: pageIds,
        });

        return response?.data;
      },
      onSuccess: (data, variables) => {
        client.setQueryData(
          [QueryKeyPage.getFanpages()],
          (oldData?: IPage[]) => {
            if (!oldData) return oldData;
            return oldData.filter((item) => !variables.includes(item.pageId));
          },
        );

        return data;
      },
    });
  }

  useBulkDeleteQuickReply(): UseMutationResult<any, unknown, string[]> {
    const client = useQueryClient();
    const { pageSelected } = useAppSelector((state) => state.page);
    return useMutation({
      mutationFn: async (ids: string[]) => {
        const response = await ApiClient.POST(
          `quick-reply/${pageSelected.pageId}/bulk-delete`,
          { ids },
        );
        return response;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getQuickReply(pageSelected.pageId)],
          (oldData?: IQuickReply[]) => {
            if (!oldData) return oldData;
            return oldData.filter((item) => !variables.includes(item._id));
          },
        );
        return data;
      },
    });
  }

  useBulkDeleteTags(): UseMutationResult<any, unknown, string[]> {
    const client = useQueryClient();
    const { pageSelected } = useAppSelector((state) => state.page);
    return useMutation({
      mutationFn: async (ids: string[]) => {
        const response = await ApiClient.POST(
          `tags/${pageSelected.pageId}/bulk-delete`,
          { ids: ids },
        );
        return response;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getTags(pageSelected.pageId)],
          (oldData?: ITag[]) => {
            if (!oldData) return oldData;
            return oldData.filter((item) => !variables.includes(item._id));
          },
        );
        return data;
      },
    });
  }

  useBulkUpdateStatusPage(): UseMutationResult<
    IPage[],
    unknown,
    { pageIds: string[]; status: CommonStatus }
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: { pageIds: string[]; status: CommonStatus }) => {
        const response = await ApiClient.PUT(`fanpage/update-status`, {
          pageIds: data.pageIds,
          status: data.status,
        });

        return response?.data;
      },
      onSuccess: (data, variables) => {
        client.setQueryData(
          [QueryKeyPage.getFanpages()],
          (oldData?: IPage[]) => {
            if (!oldData) return oldData;
            return oldData.map((item) => {
              if (variables.pageIds.includes(item.pageId)) {
                return {
                  ...item,
                  status: variables.status,
                };
              }

              return item;
            });
          },
        );

        return data;
      },
    });
  }

  useConnectDataset(): UseMutationResult<
    IPageSettings,
    unknown,
    ConnectDatasetDto
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: ConnectDatasetDto) => {
        const response = await ApiClient.POST(`fanpage/connect-dataset`, data);

        return response?.data;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getPageSettings(variables.pageId)],
          () => {
            return data;
          },
        );

        return data;
      },
    });
  }

  useConversationMemberZalo(): UseMutationResult<
    IConversation,
    unknown,
    { memberId: string; pageId: string }
  > {
    return useMutation({
      mutationFn: async (data: { memberId: string; pageId: string }) => {
        const response = await ApiClient.GET(
          `zalo/${data.pageId}/conversation-member/${data.memberId}`,
        );

        return response?.data;
      },
    });
  }

  useConversationZalo(): UseMutationResult<
    IConversation,
    unknown,
    { data: IFindUserZalo; pageId: string }
  > {
    return useMutation({
      mutationFn: async (data: { data: IFindUserZalo; pageId: string }) => {
        const response = await ApiClient.POST(
          `zalo/${data.pageId}/conversation`,
          data.data,
        );

        return response?.data;
      },
    });
  }

  useCreateFlow(): UseMutationResult<IFlow, unknown, CreateFlowDto> {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: CreateFlowDto) => {
        const response = await ApiClient.POST(`flows`, data);

        return response?.data;
      },
      onSuccess(data, variables) {
        const queryCache = client.getQueryCache().find({
          exact: false,
          queryKey: [QueryKeyPage.getFlows(variables.pageId)],
        });
        if (queryCache) {
          void client.invalidateQueries({ queryKey: queryCache.queryKey });
        }

        return data;
      },
    });
  }

  useCreateGroupZalo(): UseMutationResult<
    IConversation,
    unknown,
    CreateGroupDto
  > {
    return useMutation({
      mutationFn: async (data: CreateGroupDto) => {
        const response = await ApiClient.POST(`group-zalo/create`, data);

        return response?.data;
      },
    });
  }

  useCreatePageGroup(): UseMutationResult<
    IPageGroup,
    unknown,
    CreatePageGroupDto
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: CreatePageGroupDto) => {
        const response = await ApiClient.POST('page-groups', data);

        return response?.data;
      },
      onSuccess: (data) => {
        client.setQueryData(
          [QueryKeyPage.getPageGroups()],
          (oldData?: IPageGroup[]) => {
            if (!oldData) return oldData;
            return [data, ...oldData];
          },
        );

        return data;
      },
    });
  }

  useCreateQuickReply(): UseMutationResult<
    IQuickReply,
    unknown,
    CreateQuickReplyDto
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: CreateQuickReplyDto) => {
        const response = await ApiClient.POST(`quick-reply`, data);
        return response?.data;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getQuickReply(variables.pageId)],
          (oldData?: IQuickReply[]) => {
            if (!oldData) return oldData;
            return [data, ...oldData];
          },
        );
        return data;
      },
    });
  }

  useCreateSequence(): UseMutationResult<
    ISequence,
    unknown,
    CreateSequenceDto
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: CreateSequenceDto) => {
        const response = await ApiClient.POST('sequence', data);

        return response?.data;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getSequences(variables.pageId)],
          (oldData?: ISequence[]) => {
            if (!oldData) return oldData;

            return [data, ...oldData];
          },
        );
        return data;
      },
    });
  }

  useCreateTag(): UseMutationResult<ITag, unknown, CreateTagDto> {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: CreateTagDto) => {
        const response = await ApiClient.POST(`tags`, data);

        return response?.data;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getTags(variables.pageId)],
          (oldData?: ITag[]) => {
            if (!oldData) return oldData;
            return [data, ...oldData];
          },
        );
        return data;
      },
    });
  }

  useDeleteFlow(): UseMutationResult<any, unknown, string> {
    const client = useQueryClient();
    const { pageSelected } = useAppSelector((state) => state.page);

    return useMutation({
      mutationFn: async (id: string) => {
        const response = await ApiClient.DELETE(`flows/${id}`);

        return response;
      },
      onSuccess: (data, id) => {
        const queryCache = client.getQueryCache().find({
          exact: false,
          queryKey: [QueryKeyPage.getFlows(pageSelected.pageId)],
        });
        if (queryCache) {
          client.setQueryData(queryCache.queryKey, (oldData?: any) => {
            if (!oldData) return oldData;

            const newData = {
              ...oldData,
              pages: oldData.pages?.map((page: any) => {
                const newPage = {
                  ...page,
                  data: page.data.filter((item: IFlow) => item._id !== id),
                };
                return newPage;
              }),
            };

            return newData;
          });
        }

        return data;
      },
    });
  }

  useDeleteKeyword(): UseMutationResult<any, unknown, string> {
    return useMutation({
      mutationFn: async (id: string) => {
        const response = await ApiClient.DELETE(`keyword/${id}`);

        return response;
      },
      onSuccess(data) {
        return data;
      },
    });
  }

  useDeletePageGroup(): UseMutationResult<IPageGroup, unknown, string> {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (groupId: string) => {
        const response = await ApiClient.DELETE(`page-groups/${groupId}`);

        return response?.data;
      },
      onSuccess: (data, variables) => {
        client.setQueryData(
          [QueryKeyPage.getPageGroups()],
          (oldData?: IPageGroup[]) => {
            if (!oldData) return oldData;
            return oldData.filter((item) => item._id !== variables);
          },
        );

        return data;
      },
    });
  }

  useDeleteQuickReply(): UseMutationResult<any, unknown, string> {
    const client = useQueryClient();
    const { pageSelected } = useAppSelector((state) => state.page);
    return useMutation({
      mutationFn: async (id: string) => {
        const response = await ApiClient.DELETE(`quick-reply/${id}`);
        return response;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getQuickReply(pageSelected.pageId)],
          (oldData?: IQuickReply[]) => {
            if (!oldData) return oldData;
            return oldData.filter((item) => item._id !== variables);
          },
        );
        return data;
      },
    });
  }

  useDeleteSequence(): UseMutationResult<any, unknown, string> {
    const client = useQueryClient();
    const { pageSelected } = useAppSelector((state) => state.page);

    return useMutation({
      mutationFn: async (id: string) => {
        const response = await ApiClient.DELETE(`sequence/${id}`);

        return response;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getSequences(pageSelected.pageId)],
          (oldData: ISequence[]) => {
            return oldData.filter((item) => item._id !== variables);
          },
        );
        return data;
      },
    });
  }

  useDeleteTag(): UseMutationResult<any, unknown, string> {
    const client = useQueryClient();
    const { pageSelected } = useAppSelector((state) => state.page);
    return useMutation({
      mutationFn: async (id: string) => {
        const response = await ApiClient.DELETE(`tags/${id}`);
        return response;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getTags(pageSelected.pageId)],
          (oldData?: ITag[]) => {
            if (!oldData) return oldData;
            return oldData.filter((item) => item._id !== variables);
          },
        );
        return data;
      },
    });
  }

  useDisperseGroup(): UseMutationResult<
    IGroupZalo,
    unknown,
    { groupId: string; pageId: string }
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: { groupId: string; pageId: string }) => {
        const response = await ApiClient.POST(
          `group-zalo/${data.groupId}/disperse`,
        );

        return response?.data;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getDetailGroupZalo(variables.groupId)],
          () => {
            return data;
          },
        );

        const queryCache = client.getQueryCache().find({
          exact: false,
          queryKey: [QueryKeyPage.getMemberGroup(variables.groupId)],
        });
        if (queryCache) {
          client.setQueryData(
            queryCache.queryKey,
            (oldData?: MemberProfile[]) => {
              if (!oldData) return oldData;

              return oldData.filter(
                (item) =>
                  item.id !==
                  variables.pageId.replace(
                    `${PrefixPlatformEnum.personal_zalo}_`,
                    '',
                  ),
              );
            },
          );
        }

        return data;
      },
    });
  }

  useDuplicateSequence(): UseMutationResult<ISequence, unknown, string> {
    const client = useQueryClient();
    const { pageSelected } = useAppSelector((state) => state.page);

    return useMutation({
      mutationFn: async (id: string) => {
        const response = await ApiClient.POST(`sequence/duplicate/${id}`);

        return response?.data;
      },
      onSuccess(data) {
        client.setQueryData(
          [QueryKeyPage.getSequences(pageSelected.pageId)],
          (oldData?: ISequence[]) => {
            if (!oldData) return oldData;
            return [data, ...oldData];
          },
        );

        return data;
      },
    });
  }

  useFindUserZalo(): UseMutationResult<
    IFindUserZalo,
    unknown,
    { pageId: string; search: string }
  > {
    return useMutation({
      mutationFn: async (data: { pageId: string; search: string }) => {
        const response = await ApiClient.GET(`zalo/${data.pageId}/find-user`, {
          search: data.search,
        });

        return response?.data;
      },
    });
  }

  useGetDetailFanpage(): UseMutationResult<IPage, unknown, string> {
    return useMutation({
      mutationFn: async (pageId: string) => {
        const response = await ApiClient.GET(`fanpage/${pageId}/detail`);

        return response?.data;
      },
    });
  }

  useGetDetailFlow(flowId: string): UseQueryResult<IFlow> {
    return useQuery({
      enabled: !!flowId,
      queryFn: async () => {
        const resonse = await ApiClient.GET(`flows/detail/${flowId}`);

        return resonse.data;
      },
      queryKey: [QueryKeyPage.getDetailFlow(flowId)],
    });
  }

  useGetDetailGroupZalo(groupId: string): UseQueryResult<IGroupZalo> {
    return useQuery({
      queryFn: async () => {
        const response = await ApiClient.GET(`group-zalo/${groupId}`);

        return response?.data;
      },
      queryKey: [QueryKeyPage.getDetailGroupZalo(groupId)],
    });
  }

  useGetDetailSequence(sequenceId: string): UseQueryResult<ISequence> {
    return useQuery({
      enabled: !isNil(sequenceId),
      queryFn: async () => {
        const response = await ApiClient.GET(`sequence/detail/${sequenceId}`);

        return response?.data;
      },
      queryKey: [QueryKeyPage.getDetailSequenece(sequenceId)],
    });
  }

  useGetDetaiScopedUser(
    pageId: string,
    scopedUserId: string,
  ): UseQueryResult<IScopedUser> {
    return useQuery({
      queryFn: async () => {
        const response = await ApiClient.GET(
          `scoped-user/${scopedUserId}/page/${pageId}`,
        );

        return response?.data;
      },
      queryKey: [QueryKeyPage.getDetailScopedUser(pageId, scopedUserId)],
    });
  }

  useGetFanpages(): UseQueryResult<IPage[]> {
    return useQuery({
      initialData: [],
      queryFn: async () => {
        const response = await ApiClient.GET('fanpage');

        return response?.data;
      },
      queryKey: [QueryKeyPage.getFanpages()],
    });
  }

  useGetFlows(
    pageId: string,
    filter: IFlowsFilter,
  ): UseInfiniteQueryResult<IFlow[]> {
    return useInfiniteQuery({
      getNextPageParam: (lastPage: any) =>
        lastPage?.cursor?.afterCursor ?? undefined,
      getPreviousPageParam: (firstPage) =>
        firstPage?.cursor?.beforeCursor ?? undefined,
      initialPageParam: '',
      meta: {
        shouldPersist: false,
      },
      queryFn: async ({ pageParam }) => {
        const response = await ApiClient.GET(`flows/${pageId}`, {
          ...filter,
          afterCursor: pageParam,
        });

        return response;
      },
      queryKey: [QueryKeyPage.getFlows(pageId), filter],
      select(data) {
        return data.pages.reduce((accumulator, page) => {
          if (page?.data) {
            accumulator = [...accumulator, ...page.data];
          }

          return accumulator;
        }, []);
      },
    });
  }

  useGetListKeyword(pageId: string): UseInfiniteQueryResult<IKeywordItem[]> {
    return useInfiniteQuery({
      getNextPageParam: (lastPage: any) =>
        lastPage?.cursor?.afterCursor ?? undefined,
      getPreviousPageParam: (firstPage) =>
        firstPage?.cursor?.beforeCursor ?? undefined,
      initialPageParam: '',
      meta: {
        shouldPersist: false,
      },
      queryFn: async ({ pageParam }) => {
        const response = await ApiClient.GET(`keyword/${pageId}`, {
          afterCursor: pageParam,
        });

        return response;
      },
      queryKey: [QueryKeyPage.getListKeyword(pageId)],
      select(data) {
        return data.pages.reduce((accumulator, page) => {
          if (page?.data) {
            accumulator = [...accumulator, ...page.data];
          }

          return accumulator;
        }, []);
      },
    });
  }

  useGetMemberGroup(
    groupId: string,
    paging: IPaging,
  ): UseQueryResult<MemberProfile[]> {
    return useQuery({
      queryFn: async () => {
        const response = await ApiClient.GET(`group-zalo/${groupId}/members`, {
          ...paging,
        });

        return response?.data;
      },
      queryKey: [QueryKeyPage.getMemberGroup(groupId), paging],
    });
  }

  useGetPageAttachments(
    pageId: string,
    scopedUserId: string,
    filter?: IFilterPageAttachment,
  ): UseInfiniteQueryResult<ResponseInfinityQuery<PageAttachments>> {
    return useInfiniteQuery({
      getNextPageParam: (lastPage: any) => lastPage?.pagination?.nextPage,
      getPreviousPageParam: (firstPage: any) => firstPage?.pagination?.prevPage,
      initialPageParam: 1,
      meta: {
        shouldPersist: false,
      },
      queryFn: async ({ pageParam }) => {
        const parameters: any = { ...filter, limit: 50, page: pageParam };

        const response = await ApiClient.GET(
          `fanpage/${pageId}/attachments/${scopedUserId}`,
          parameters,
        );

        return response;
      },
      queryKey: [QueryKeyPage.getPageAttachments(pageId, scopedUserId), filter],
    });
  }

  useGetPageGroups(): UseQueryResult<IPageGroup[]> {
    return useQuery({
      initialData: [],
      queryFn: async () => {
        const response = await ApiClient.GET('page-groups');

        return response?.data;
      },
      queryKey: [QueryKeyPage.getPageGroups()],
    });
  }

  useGetQuickReply(pageId: string | string[]): UseQueryResult<IQuickReply[]> {
    return useQuery({
      enabled: !!pageId,
      queryFn: async () => {
        const parameters: any = {};

        if (isArray(pageId)) {
          parameters.pageIds = pageId;
        } else {
          parameters.pageId = pageId;
        }

        const response = await ApiClient.GET(`quick-reply`, parameters);

        return response?.data;
      },
      queryKey: [QueryKeyPage.getQuickReply(pageId)],
    });
  }

  useGetRecommendFriends(pageId: string): UseQueryResult<IRecommUser[]> {
    return useQuery({
      queryFn: async () => {
        const response = await ApiClient.GET(
          `zalo/${pageId}/recommend-friends`,
        );

        return response?.data;
      },
      queryKey: [QueryKeyPage.getRecommendFriends(pageId)],
    });
  }

  useGetReferralAdsPage(
    pageId: string | string[],
    filter?: CommonFilter,
  ): UseInfiniteQueryResult<ConversationReferral[]> {
    return useInfiniteQuery({
      getNextPageParam: (lastPage: any) => lastPage?.pagination?.nextPage,
      getPreviousPageParam: (firstPage: any) => firstPage?.pagination?.prevPage,
      initialPageParam: 1,
      meta: {
        shouldPersist: false,
      },
      queryFn: async ({ pageParam }) => {
        const parameters: any = { ...filter, limit: 200, page: pageParam };

        if (isArray(pageId)) {
          parameters.pageIds = pageId;
        } else {
          parameters.pageId = pageId;
        }

        const response = await ApiClient.GET(
          `fanpage/referral-ads`,
          parameters,
        );

        return response;
      },
      queryKey: [QueryKeyPage.getReferralPage(pageId), filter],
      select(data) {
        return data.pages.reduce((accumulator, page) => {
          if (page?.data) {
            accumulator = [...accumulator, ...page.data];
          }

          return accumulator;
        }, []);
      },
    });
  }

  useGetReferralAdsScopedUser(
    pageId: string,
    scopedUserId: string,
  ): UseQueryResult<ConversationReferral[]> {
    return useQuery({
      queryFn: async () => {
        const response = await ApiClient.GET(
          `scoped-user/${scopedUserId}/referral-ads/${pageId}`,
        );

        return response?.data;
      },
      queryKey: [QueryKeyPage.getReferralScopedUser(pageId, scopedUserId)],
    });
  }

  useGetScopedUsers(
    pageId: string,
    paging: IPaging,
    filter: IFilterUser | undefined,
  ): UseQueryResult<IResponse<IScopedUser[]>> {
    return useQuery({
      queryFn: async () => {
        const response = await ApiClient.GET(`fanpage/${pageId}/scoped-user`, {
          ...paging,
          ...filter,
        });

        return response;
      },
      queryKey: [QueryKeyPage.getScopedUsers(pageId), paging, filter],
    });
  }

  useGetSequence(pageId: string | string[]): UseQueryResult<ISequence[]> {
    return useQuery({
      enabled: !!pageId,
      queryFn: async () => {
        const parameters: any = {};

        if (isArray(pageId)) {
          parameters.pageIds = pageId;
        } else {
          parameters.pageId = pageId;
        }

        const response = await ApiClient.GET(`sequence`, parameters);

        return response?.data;
      },
      queryKey: [QueryKeyPage.getSequences(pageId)],
    });
  }

  useGetSocialAccount(userId: string): UseQueryResult<ISocialAccount> {
    return useQuery({
      queryFn: async () => {
        const response = await ApiClient.GET(`social-account/${userId}`);

        return response?.data;
      },
      queryKey: [QueryKeyPage.getSocialAccount(userId)],
    });
  }

  useGetStatisticsUserTags(
    pageId: string,
  ): UseQueryResult<StatisticsUserTags[]> {
    return useQuery({
      enabled: !!pageId && !pageId.includes(PrefixPlatformEnum.page_group),
      initialData: [],
      queryFn: async () => {
        const response = await ApiClient.GET(
          `fanpage/${pageId}/statistics-user-tags`,
        );

        return response?.data;
      },
      queryKey: [QueryKeyPage.getStatisticsUserTags(pageId)],
    });
  }

  useGetStatisticUserSequences(
    pageId: string,
  ): UseQueryResult<StatisticsUserSequences[]> {
    return useQuery({
      queryFn: async () => {
        const response = await ApiClient.GET(
          `fanpage/${pageId}/statistics-user-sequences`,
        );

        return response?.data;
      },
      queryKey: [QueryKeyPage.getStatisticUserSequences(pageId)],
    });
  }

  useGetTags(pageId: string | string[]): UseQueryResult<ITag[]> {
    return useQuery({
      enabled: !!pageId,
      queryFn: async () => {
        const parameters: any = {};

        if (isArray(pageId)) {
          parameters.pageIds = pageId;
        } else {
          parameters.pageId = pageId;
        }

        const response = await ApiClient.GET(`tags`, parameters);

        return response?.data;
      },
      queryKey: [QueryKeyPage.getTags(pageId)],
    });
  }

  useInfiniteScopedUsers(
    pageId: string,
    filter?: IFilterUser,
  ): UseInfiniteQueryResult<IScopedUser[]> {
    return useInfiniteQuery({
      getNextPageParam: (lastPage: any) => lastPage?.pagination?.nextPage,
      getPreviousPageParam: (firstPage) => firstPage?.pagination?.prevPage,
      initialPageParam: 1,
      meta: {
        shouldPersist: false,
      },
      queryFn: async ({ pageParam }) => {
        const response = await ApiClient.GET(`fanpage/${pageId}/scoped-user`, {
          ...filter,
          limit: 30,
          page: pageParam,
        });

        return response;
      },
      queryKey: [QueryKeyPage.getScopedUsers(pageId), filter],
      select(data) {
        return data.pages.reduce((accumulator, page) => {
          if (page?.data) {
            accumulator = [...accumulator, ...page.data];
          }

          return accumulator;
        }, []);
      },
    });
  }

  useLeaveGroup(): UseMutationResult<
    IGroupZalo,
    unknown,
    { groupId: string; pageId: string }
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: { groupId: string; pageId: string }) => {
        const response = await ApiClient.POST(
          `group-zalo/${data.groupId}/leave`,
        );

        return response?.data;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getDetailGroupZalo(variables.groupId)],
          () => {
            return data;
          },
        );

        const queryCache = client.getQueryCache().find({
          exact: false,
          queryKey: [QueryKeyPage.getMemberGroup(variables.groupId)],
        });
        if (queryCache) {
          client.setQueryData(
            queryCache.queryKey,
            (oldData?: MemberProfile[]) => {
              if (!oldData) return oldData;

              return oldData.filter(
                (item) =>
                  item.id !==
                  variables.pageId.replace(
                    `${PrefixPlatformEnum.personal_zalo}_`,
                    '',
                  ),
              );
            },
          );
        }

        return data;
      },
    });
  }

  useMuteConversation(): UseMutationResult<
    IGroupZalo,
    unknown,
    { pageId: string; scopedUserId: string }
  > {
    return useMutation({
      mutationFn: async (data: { pageId: string; scopedUserId: string }) => {
        const response = await ApiClient.POST(
          `zalo/${data.pageId}/mute-conversation`,
          { scopedUserId: data.scopedUserId },
        );

        return response?.data;
      },
    });
  }

  useRejectFriend(): UseMutationResult<
    { success: boolean },
    unknown,
    { friendId: string; pageId: string }
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: { friendId: string; pageId: string }) => {
        const response = await ApiClient.POST(
          `zalo/${data.pageId}/reject-friend/${data.friendId}`,
        );

        return response?.data;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getRecommendFriends(variables.pageId)],
          (oldData?: IRecommUser[]) => {
            if (!oldData) return oldData;
            return oldData.filter((item) => item.userId !== variables.friendId);
          },
        );

        return data;
      },
    });
  }

  useRemoveMemberGroup(): UseMutationResult<
    IGroupZalo,
    unknown,
    { groupId: string; memberIds: string[] }
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: { groupId: string; memberIds: string[] }) => {
        const response = await ApiClient.POST(
          `group-zalo/${data.groupId}/remove-user`,
          data,
        );

        return response?.data;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getDetailGroupZalo(variables.groupId)],
          () => {
            return data;
          },
        );

        const queryCache = client.getQueryCache().find({
          exact: false,
          queryKey: [QueryKeyPage.getMemberGroup(variables.groupId)],
        });
        if (queryCache) {
          client.setQueryData(
            queryCache.queryKey,
            (oldData?: MemberProfile[]) => {
              if (!oldData) return oldData;

              return oldData.filter(
                (item) => !variables.memberIds.includes(item.id),
              );
            },
          );
        }

        return data;
      },
    });
  }

  useSendEventFacebook(): UseMutationResult<
    any,
    unknown,
    SendEventFacebookDto
  > {
    return useMutation({
      mutationFn: async (data: SendEventFacebookDto) => {
        const response = await ApiClient.POST('fanpage/event-facebook', data);

        return response?.data;
      },
    });
  }

  useUpdateFlow(): UseMutationResult<
    any,
    unknown,
    { data: UpdateFlowDto; id: string }
  > {
    const client = useQueryClient();
    const { pageSelected } = useAppSelector((state) => state.page);

    return useMutation({
      mutationFn: async ({ data, id }: { data: UpdateFlowDto; id: string }) => {
        const response = await ApiClient.PUT(`flows/${id}`, data);
        return response?.data;
      },
      onSuccess: (data) => {
        const queryCache = client.getQueryCache().find({
          exact: false,
          queryKey: [QueryKeyPage.getFlows(pageSelected.pageId)],
        });
        if (queryCache) {
          client.setQueryData(queryCache.queryKey, (oldData?: any) => {
            if (!oldData) return oldData;

            const newData = {
              ...oldData,
              pages: oldData.pages?.map((page: any) => {
                const newPage = {
                  ...page,
                  data: page.data.map((item: IFlow) => {
                    return item._id === data._id ? data : item;
                  }),
                };
                return newPage;
              }),
            };

            return newData;
          });
        }

        return data;
      },
    });
  }

  useUpdateGroupZalo(): UseMutationResult<IGroupZalo, unknown, IGroupZalo> {
    return useMutation({
      mutationFn: async (groupZalo: IGroupZalo) => {
        const response = await ApiClient.PUT(
          `group-zalo/${groupZalo._id}`,
          groupZalo,
        );

        return response?.data;
      },
    });
  }

  useUpdateKeyword(): UseMutationResult<
    IKeywordItem,
    unknown,
    UpdateKeywordDto
  > {
    return useMutation({
      mutationFn: async (data: UpdateKeywordDto) => {
        const response = await ApiClient.PUT(`keyword/${data._id}`, data);

        return response?.data;
      },
      onSuccess(data) {
        return data;
      },
    });
  }

  useUpdatePage(): UseMutationResult<IPage, unknown, IUpdatePageDto> {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: IUpdatePageDto) => {
        const response = await ApiClient.PUT(`fanpage/${data.pageId}`, data);

        return response?.data;
      },
      onSuccess: (data, variables) => {
        client.setQueryData(
          [QueryKeyPage.getFanpages()],
          (oldData?: IPage[]) => {
            if (!oldData) return oldData;
            return oldData.map((item) => {
              return item.pageId === variables.pageId ? data : item;
            });
          },
        );
      },
    });
  }

  useUpdatePageGroup(): UseMutationResult<
    IPageGroup,
    unknown,
    UpdatePageGroupDto
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: UpdatePageGroupDto) => {
        const response = await ApiClient.PUT(
          `page-groups/${data.groupId}`,
          data,
        );

        return response?.data;
      },
      onSuccess: (data) => {
        client.setQueryData(
          [QueryKeyPage.getPageGroups()],
          (oldData?: IPageGroup[]) => {
            if (!oldData) return oldData;
            return oldData.map((item) => (item._id === data._id ? data : item));
          },
        );

        return data;
      },
    });
  }

  useUpdateQuickReply(): UseMutationResult<
    IQuickReply,
    unknown,
    UpdateQuickReplyDto
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: UpdateQuickReplyDto) => {
        const response = await ApiClient.PUT(`quick-reply/${data._id}`, data);
        return response?.data;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getQuickReply(variables.pageId)],
          (oldData?: IQuickReply[]) => {
            if (!oldData) return oldData;
            return oldData.map((item) => (item._id === data._id ? data : item));
          },
        );
        return data;
      },
    });
  }

  useUpdateScopedUser(): UseMutationResult<
    IScopedUser,
    unknown,
    IUpdateScopedUserDto
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (scopedUser: IUpdateScopedUserDto) => {
        const response = await ApiClient.PUT(
          `scoped-user`,
          scopedUser,
          scopedUser.file && {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        return response?.data;
      },
      onSuccess(data, variables) {
        const queryCache = client.getQueryCache().find({
          exact: false,
          queryKey: [
            QueryKeyPage.getDetailScopedUser(
              variables.pageId,
              variables.scopedUserId as unknown as string,
            ),
          ],
        });
        if (queryCache) {
          void client.invalidateQueries({ queryKey: queryCache.queryKey });
        }
        return data;
      },
    });
  }

  useUpdateSequence(): UseMutationResult<
    ISequence,
    unknown,
    UpdateSequenceDto
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: UpdateSequenceDto) => {
        const response = await ApiClient.PUT(`sequence/${data._id}`, data);

        return response?.data;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getSequences(variables.pageId)],
          (oldData?: ISequence[]) => {
            if (!oldData) return oldData;
            return oldData.map((sequence) =>
              sequence._id === data._id ? data : sequence,
            );
          },
        );
        return data;
      },
    });
  }

  useUpdateSequenceStep(): UseMutationResult<
    ISequence,
    unknown,
    UpdateSequenceStepDto
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: UpdateSequenceStepDto) => {
        const response = await ApiClient.PUT(
          `sequence/update/${data.sequenceId}/step/${data.stepId}`,
          data,
        );

        return response?.data;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getDetailSequenece(variables.sequenceId)],
          data,
        );
        return data;
      },
    });
  }

  useUpdateStatusPage(): UseMutationResult<
    IPage[] | undefined,
    unknown,
    UpdateStatusPageDto
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: UpdateStatusPageDto) => {
        const response = await ApiClient.PUT(`fanpage/${data.pageId}/status`, {
          status: data.status,
        });

        return response?.data;
      },
      onSuccess: (data, variables) => {
        client.setQueryData(
          [QueryKeyPage.getFanpages()],
          (oldData?: IPage[]) => {
            if (!oldData) return oldData;
            return oldData.map((item) => {
              return {
                ...item,
                status:
                  item.pageId === variables.pageId
                    ? variables.status
                    : item.status,
              };
            });
          },
        );

        return data;
      },
    });
  }

  useUpdateTag(): UseMutationResult<ITag, unknown, UpdateTagDto> {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: UpdateTagDto) => {
        const response = await ApiClient.PUT(`tags/${data._id}`, data);
        return response?.data;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyPage.getTags(variables.pageId)],
          (oldData?: ITag[]) => {
            if (!oldData) return oldData;
            return oldData.map((item) => (item._id === data._id ? data : item));
          },
        );
        return data;
      },
    });
  }

  useUploadAttachmentPage(): UseMutationResult<
    any,
    unknown,
    { form: any; pageId: string }
  > {
    return useMutation({
      mutationFn: async ({ form, pageId }: { form: any; pageId: string }) => {
        const response = ApiClient.UPLOAD(
          `attachment/upload-attachment-page/${pageId}`,
          form,
        );

        return response;
      },
      onSuccess(data) {
        return data;
      },
    });
  }
}

export default new PageService();
