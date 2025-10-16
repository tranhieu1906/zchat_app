/* eslint-disable react-hooks/rules-of-hooks */
import { QueryKeyPage } from '@/constants/QueryKey/QueryKeyPage';
import {
  ChatCompletionChatGPTDto,
  ConfigChatGPTDto,
  CopyPageSettingDto,
  IPage,
  IPageSettings,
  UpdatePageSettingsDto,
  UpdateSettingLiveChatDto,
} from '@/models/ModelPage';
import { LoginOdooDto } from '@/models/ModelSettings';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { isArray } from 'lodash';

import { ApiClient } from './instance';

class PageSettingService {
  useChatCompletionChatGPT(): UseMutationResult<
    string,
    unknown,
    ChatCompletionChatGPTDto
  > {
    return useMutation({
      mutationFn: async (data: ChatCompletionChatGPTDto) => {
        const response = await ApiClient.POST(
          `integrations/${data.pageId}/chatgpt/chat-completion`,
          data,
        );

        return response?.data;
      },
    });
  }

  useConfigChatGPT(): UseMutationResult<
    IPageSettings,
    unknown,
    ConfigChatGPTDto
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: any) => {
        const response = await ApiClient.POST(
          `integrations/${data.pageId}/chatgpt/config`,
          data,
        );

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

  useCopySettingPage(): UseMutationResult<IPage, unknown, CopyPageSettingDto> {
    return useMutation({
      mutationFn: async (data: CopyPageSettingDto) => {
        const resonse = await ApiClient.POST(`page-settings/copy`, data);

        return resonse?.data;
      },
    });
  }

  useGetPageSettings(
    pageId: string | string[],
  ): UseQueryResult<IPageSettings | IPageSettings[]> {
    return useQuery({
      queryFn: async () => {
        const parameters: any = {};

        if (isArray(pageId)) {
          parameters.pageIds = pageId;
        } else {
          parameters.pageId = pageId;
        }

        const response = await ApiClient.GET(`page-settings`, parameters);

        return response?.data;
      },
      queryKey: [QueryKeyPage.getPageSettings(pageId as string)],
    });
  }

  useIntegrationChatGPT(): UseMutationResult<
    IPageSettings,
    unknown,
    { apiKey: string; pageId: string }
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: { apiKey: string; pageId: string }) => {
        const response = await ApiClient.POST(
          `integrations/${data.pageId}/chatgpt?apiKey=${data.apiKey}`,
        );

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

  useIntegrationOdoo(): UseMutationResult<
    IPageSettings,
    unknown,
    LoginOdooDto
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: LoginOdooDto) => {
        const response = await ApiClient.POST(
          `integrations/${data.pageId}/odoo`,
          data,
        );
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

  useUpdatePageSettings(): UseMutationResult<
    IPageSettings,
    unknown,
    UpdatePageSettingsDto
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: UpdatePageSettingsDto) => {
        const response = await ApiClient.PUT(`page-settings/${data._id}`, data);
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

  useUpdateSettingLiveChat(): UseMutationResult<
    IPageSettings,
    unknown,
    UpdateSettingLiveChatDto
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: UpdateSettingLiveChatDto) => {
        const response = await ApiClient.PUT(
          `page-settings/${data.pageId}/livechat`,
          data,
        );
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
}

export default new PageSettingService();
