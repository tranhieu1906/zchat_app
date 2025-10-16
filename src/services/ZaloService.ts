/* eslint-disable react-hooks/rules-of-hooks */
import { QueryKeyZalo } from '@/constants/QueryKey/QueryKeyZalo';
import { PrefixPlatformEnum } from '@/models/common';
import {
  CreateReminderDto,
  DeleteReminderDto,
  IReminder,
  UpdateReminderDto,
} from '@/models/ModelChat';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';

import { ApiClient } from './instance';

class ZaloService {
  async connectZaloOA() {
    const response = await ApiClient.GET(`zalo-oa/auth-url`);

    return response;
  }

  async generateQR() {
    const response = await ApiClient.GET(`zalo/qr`);

    return response;
  }

  useCreateReminder(): UseMutationResult<
    IReminder,
    unknown,
    CreateReminderDto
  > {
    const client = useQueryClient();

    return useMutation({
      mutationFn: async (payload: CreateReminderDto) => {
        const response = await ApiClient.POST('/zalo/create-note', payload);

        return response?.data;
      },
      onSuccess(data, variables) {
        if (data) {
          client.setQueryData(
            [
              QueryKeyZalo.getListNote(
                variables.pageId,
                variables.scopedUserId,
              ),
            ],
            (oldData: IReminder[]) => {
              if (!oldData) return [];

              return [data, ...oldData];
            },
          );
        }

        return data;
      },
    });
  }

  useDeleteReminder(): UseMutationResult<
    IReminder,
    unknown,
    DeleteReminderDto
  > {
    const client = useQueryClient();

    return useMutation({
      mutationFn: async (data: DeleteReminderDto) => {
        const response = await ApiClient.POST(
          `zalo/delete-note/${data.reminderId}`,
          data,
        );

        return response?.data;
      },
      onSuccess(data, variables) {
        if (data) {
          client.setQueryData(
            [
              QueryKeyZalo.getListNote(
                variables.pageId,
                variables.scopedUserId,
              ),
            ],
            (oldData: IReminder[]) => {
              if (!oldData) return [];

              return oldData.filter((item) => item.id !== variables.reminderId);
            },
          );
        }

        return data;
      },
    });
  }

  useEditReminder(): UseMutationResult<IReminder, unknown, UpdateReminderDto> {
    const client = useQueryClient();

    return useMutation({
      mutationFn: async (payload: UpdateReminderDto) => {
        const response = await ApiClient.PUT(
          `zalo/edit-note/${payload.reminderId}`,
          payload,
        );

        return response?.data;
      },
      onSuccess(data, variables) {
        if (data) {
          client.setQueryData(
            [
              QueryKeyZalo.getListNote(
                variables.pageId,
                variables.scopedUserId,
              ),
            ],
            (oldData: IReminder[]) => {
              if (!oldData) return [];

              return oldData.map((item) =>
                item.id === variables.reminderId ? data : item,
              );
            },
          );
        }

        return data;
      },
    });
  }

  useGetListReminder(
    pageId: string,
    scopedUserId: string,
  ): UseQueryResult<IReminder[]> {
    return useQuery({
      enabled: pageId.includes(PrefixPlatformEnum.personal_zalo),
      initialData: [],
      queryFn: async () => {
        const response = await ApiClient.GET(
          `zalo/${pageId}/notes/${scopedUserId}`,
        );

        return response?.data;
      },
      queryKey: [QueryKeyZalo.getListNote(pageId, scopedUserId)],
    });
  }

  useSyncListTagsZalo(): UseMutationResult<
    { success: boolean },
    unknown,
    string
  > {
    return useMutation({
      mutationFn: async (pageId: string) => {
        const response = await ApiClient.GET(`zalo/${pageId}/sync-tags`);

        return response?.data;
      },
    });
  }

  async waitingConfirm(code: string, pageId?: string) {
    let url = `zalo/waiting-confirm?code=${code}`;
    if (pageId) {
      url += `&sessionId=${pageId}`;
    }
    const response = await ApiClient.GET(url);

    return response;
  }

  async waitingScan(code: string, signal?: AbortSignal) {
    const response = await ApiClient.GET(
      `zalo/waiting-scan?code=${code}`,
      undefined,
      { signal },
    );

    return response;
  }
}

export default new ZaloService();
