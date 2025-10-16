import { CommonPlatform, PrefixPlatformEnum } from '@/models/common';
import { IPage, IScopedUser } from '@/models/ModelPage';

class AvatarManager {
  getAvatarPage(page: IPage) {
    switch (page.platform) {
      case CommonPlatform.page_group: {
        return;
      }

      default: {
        return (
          page.avatarUrl ||
          `${process.env.EXPO_PUBLIC_API_URL}/fanpage/${page.pageId}/avatar`
        );
      }
    }
  }

  getAvatarUser(pageId: string, scopedUser: Partial<IScopedUser>) {
    if (pageId.includes(PrefixPlatformEnum.personal_zalo)) {
      return scopedUser.avatar;
    }

    return `${process.env.EXPO_PUBLIC_API_URL}/fanpage/${pageId}/user/${scopedUser.scopedUserId}/avatar`;
  }
}

export default new AvatarManager();
