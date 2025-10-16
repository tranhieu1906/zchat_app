import { IPage } from '@/models/ModelPage';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  setListPermissions,
  setListUsers,
  setPageSetting,
  setQuickReplies,
  setSequences,
  setStatisticsUserTags,
  setTags,
} from '@/redux/slices/pageSlice';
import PageService from '@/services/PageService';
import PageSettingService from '@/services/PageSettingService';
import UserService from '@/services/UserService';
import { encodeJWT } from '@/utils';
import { loadAuth, saveAuth } from '@/utils/auth';
import { mappingPageSetting } from '@/utils/PageUtilities';
import React, { useEffect, useRef, useState } from 'react';

export default function withMainLayout<P extends object>(
  Component: React.ComponentType<P & React.PropsWithChildren>,
) {
  return function WrappedComponent(props: P) {
    const [isLoading, setIsLoading] = useState(true);

    const { currentUser } = loadAuth();
    const dispatch = useAppDispatch();
    const { listPermissions, pageSelected } = useAppSelector(
      (state) => state.page,
    );

    const pageSelectedReference = useRef<IPage>(pageSelected);

    const mutations = {
      getListUsers: UserService.useGetListUsers(
        pageSelected.users.map((item) => item.userId),
      ),
      getPageSettings: PageSettingService.useGetPageSettings(
        pageSelected.pageIds?.length
          ? pageSelected.pageIds
          : pageSelected.pageId,
      ),
      getPermissions: UserService.useGetPermissions(),
      getQuickReply: PageService.useGetQuickReply(
        pageSelected.pageIds?.length
          ? pageSelected.pageIds
          : pageSelected.pageId,
      ),
      getSequence: PageService.useGetSequence(
        pageSelected.pageIds?.length
          ? pageSelected.pageIds
          : pageSelected.pageId,
      ),
      getStatisticsUserTags: PageService.useGetStatisticsUserTags(
        pageSelected.pageId,
      ),
      getTags: PageService.useGetTags(
        pageSelected.pageIds?.length
          ? pageSelected.pageIds
          : pageSelected.pageId,
      ),
    };

    useEffect(() => {
      dispatch(setSequences(mutations.getSequence.data ?? []));
      dispatch(setTags(mutations.getTags.data ?? []));
      dispatch(setQuickReplies(mutations.getQuickReply.data ?? []));
      dispatch(
        setPageSetting(mappingPageSetting(mutations.getPageSettings.data)),
      );
      dispatch(
        setStatisticsUserTags(mutations.getStatisticsUserTags.data ?? []),
      );
      dispatch(setListUsers(mutations.getListUsers.data ?? []));
      dispatch(setListPermissions(mutations.getPermissions.data ?? []));
    }, [
      dispatch,
      mutations.getPageSettings.data,
      mutations.getSequence.data,
      mutations.getTags.data,
      mutations.getQuickReply.data,
      mutations.getStatisticsUserTags.data,
      mutations.getListUsers.data,
      mutations.getPermissions.data,
    ]);

    useEffect(() => {
      void handlePermissions();
    }, [listPermissions]);

    const handlePermissions = async () => {
      const userPage = pageSelectedReference.current.users?.find(
        (item) => item.userId === currentUser?._id,
      );

      const permission = listPermissions.find(
        (item) => item._id === userPage?.permissionId,
      );
      if (permission?.permissions) {
        await updatePermissionUser(permission?.permissions);
      } else if (listPermissions.length > 0 && userPage) {
        await updatePermissionUser(undefined);
      }
    };

    const updatePermissionUser = async (permissions?: Record<string, any>) => {
      setIsLoading(true);
      const newUser = { ...currentUser, permissions: permissions };
      const newAccessToken = encodeJWT({ user: newUser });

      await saveAuth(newAccessToken, newUser);
      setIsLoading(false);
    };

    return isLoading ? null : <Component {...props} />;
  };
}
