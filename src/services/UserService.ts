/* eslint-disable react-hooks/rules-of-hooks */
import { QueryKeyUser } from '@/constants/QueryKey/QueryKeyUser';
import {
  CreatePermissionDto,
  IPermission,
  TypePermission,
  UpdatePermissionDto,
} from '@/models/ModelSettings';
import {
  CreateMemberDto,
  ILoginQr,
  IResponseLoginUser,
  IUser,
  LoginDto,
  LoginSystemDto,
  UpdateMemberDto,
} from '@/models/ModelUser';
import { saveAuth } from '@/utils/auth';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';

import { ApiClient } from './instance';
class UserService {
  async login(data: LoginDto) {
    try {
      const response = await ApiClient.POST('user/login', data);
      if (response.data?.accessToken && response.data?.user) {
        await saveAuth(response.data.accessToken, response.data.user);
      }
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async loginFacebook(data: LoginDto) {
    try {
      const response = await ApiClient.POST('user/login-facebook', data);

      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async loginSystem(data: LoginSystemDto) {
    const response = await ApiClient.POST('user/login-system', data);

    return response;
  }

  async reconnect(userId: string) {
    const response = await ApiClient.POST(`user/${userId}/reconnect`);

    return response;
  }

  useCreateMember(): UseMutationResult<IUser, unknown, CreateMemberDto> {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: CreateMemberDto) => {
        const response = await ApiClient.POST('user/create-member', data);

        return response?.data;
      },
      onSuccess: (data, variables) => {
        client.setQueryData(
          [QueryKeyUser.getTeamMembers(variables.rootUserId)],
          (oldData?: IUser[]) => {
            if (!oldData || !data._id) return oldData;
            return [...oldData, data];
          },
        );

        return data;
      },
    });
  }

  useCreatePermission(): UseMutationResult<
    IPermission,
    unknown,
    CreatePermissionDto
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: CreatePermissionDto) => {
        const response = await ApiClient.POST('permissions', data);

        return response?.data;
      },
      onSuccess(data) {
        client.setQueryData(
          [QueryKeyUser.getPermissions()],
          (oldData?: IPermission[]) => {
            if (!oldData) return oldData;
            return [data, ...oldData].sort(
              (a, b) =>
                (a.type === TypePermission.system ? -1 : 1) -
                (b.type === TypePermission.system ? -1 : 1),
            );
          },
        );

        return data;
      },
    });
  }

  useDeleteMember(): UseMutationResult<
    IUser,
    unknown,
    { id: string; rootUserId: string }
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: { id: string; rootUserId: string }) => {
        const response = await ApiClient.DELETE(
          `user/delete-member/${data.id}`,
        );

        return response?.data;
      },
      onSuccess: (data, variables) => {
        client.setQueryData(
          [QueryKeyUser.getTeamMembers(variables.rootUserId)],
          (oldData?: IUser[]) => {
            if (!oldData) return oldData;
            return oldData.filter((item) => item._id !== variables.id);
          },
        );

        return data;
      },
    });
  }

  useDeletePermission(): UseMutationResult<IPermission, unknown, string> {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => {
        const response = await ApiClient.DELETE(`permissions/${id}`);

        return response?.data;
      },
      onSuccess(data, variables) {
        client.setQueryData(
          [QueryKeyUser.getPermissions()],
          (oldData?: IPermission[]) => {
            if (!oldData) return oldData;
            return oldData.filter((item) => item._id !== variables);
          },
        );

        return data;
      },
    });
  }

  useGenLoginQR(): UseMutationResult<ILoginQr, unknown, void> {
    return useMutation({
      mutationFn: async () => {
        const response = await ApiClient.GET('user/gen-login-qr');

        return response?.data;
      },
    });
  }

  useGetListUsers(ids: string[]): UseQueryResult<IUser[]> {
    return useQuery({
      enabled: ids.length > 0,
      queryFn: async () => {
        const parameters = new URLSearchParams(ids.map((id) => ['ids[]', id]));

        const response = await ApiClient.GET(`user/list-users`, parameters);

        return response?.data;
      },
      queryKey: [QueryKeyUser.getListUsers(), ids],
    });
  }

  useGetPermissions(): UseQueryResult<IPermission[]> {
    return useQuery({
      initialData: [],
      queryFn: async () => {
        const response = await ApiClient.GET('permissions');

        return response?.data;
      },
      queryKey: [QueryKeyUser.getPermissions()],
    });
  }

  useGetSystemsByCorporation(
    corporation: string,
  ): UseQueryResult<{ _id: string }[]> {
    return useQuery({
      enabled: !!corporation,
      queryFn: async () => {
        const response = await ApiClient.GET(
          `user/system-by-corporation/${corporation}`,
        );

        return response?.data;
      },
      queryKey: [QueryKeyUser.getSystemsByCorporation],
    });
  }

  useGetTeamMembers(id: string, canAccess?: boolean): UseQueryResult<IUser[]> {
    return useQuery({
      enabled: !!id,
      queryFn: async () => {
        const response = await ApiClient.GET(`user/team-members`, {
          canAccess: canAccess,
        });

        return response?.data;
      },
      queryKey: [
        QueryKeyUser.getTeamMembers(id),
        ...(canAccess ? [canAccess] : []),
      ],
    });
  }

  useRemoveAccount(): UseMutationResult<boolean, undefined, void> {
    return useMutation({
      mutationFn: async () => {
        const response = await ApiClient.DELETE('user/remove-account');
        return !!response?.data;
      },
    });
  }

  useRemoveFcmToken(): UseMutationResult<
    IUser,
    unknown,
    { token: string; userId: string }
  > {
    return useMutation({
      mutationFn: async (data: { token: string; userId: string }) => {
        const response = await ApiClient.DELETE(
          `notifications/${data.userId}/tokens/${data.token}`,
        );
        return response?.data;
      },
    });
  }

  useSaveFcmToken(): UseMutationResult<
    IUser,
    unknown,
    { platform: string; token: string; userId: string }
  > {
    return useMutation({
      mutationFn: async (data: {
        platform: string;
        token: string;
        userId: string;
      }) => {
        const response = await ApiClient.POST(
          `notifications/${data.userId}/tokens`,
          data,
        );
        return response?.data;
      },
    });
  }

  useUpdateMember(): UseMutationResult<IUser, unknown, UpdateMemberDto> {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: UpdateMemberDto) => {
        const response = await ApiClient.PUT(
          `user/update-member/${data._id}`,
          data,
        );

        return response?.data;
      },
      onSuccess: (data, variables) => {
        client.setQueryData(
          [QueryKeyUser.getTeamMembers(variables.rootUserId)],
          (oldData?: IUser[]) => {
            if (!oldData || !data._id) return oldData;
            return oldData.map((item) => {
              if (item._id === data._id) return data;
              return item;
            });
          },
        );

        return data;
      },
    });
  }

  useUpdatePermission(): UseMutationResult<
    IPermission,
    unknown,
    UpdatePermissionDto
  > {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (data: UpdatePermissionDto) => {
        const response = await ApiClient.PUT(`permissions/${data._id}`, data);

        return response?.data;
      },
      onSuccess: (data) => {
        client.setQueryData(
          [QueryKeyUser.getPermissions()],
          (oldData?: IPermission[]) => {
            if (!oldData) return oldData;
            return oldData.map((item) => (item._id === data._id ? data : item));
          },
        );

        return data;
      },
    });
  }

  useUploadAvatar(): UseMutationResult<IUser, unknown, FormData> {
    return useMutation({
      mutationFn: async (data: FormData) => {
        const response = await ApiClient.PUT('user/change-avatar', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        return response?.data;
      },
    });
  }

  useValidateLoginQr(): UseMutationResult<
    IResponseLoginUser,
    unknown,
    ILoginQr
  > {
    return useMutation({
      mutationFn: async (data: ILoginQr) => {
        const response = await ApiClient.POST('user/validate-login-qr', data);

        return response?.data;
      },
    });
  }
}

export default new UserService();
