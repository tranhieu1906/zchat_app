import { PrefixPlatformEnum, TypeConversation } from '@/models/common';
import {
  EDistributionMode,
  IConversation,
  IFilterConversation,
} from '@/models/ModelChat';
import { EPageTask, IPageSettings, ISettingLiveChat } from '@/models/ModelPage';
import { ETypeAssignment } from '@/models/ModelSettings';
import { IUser } from '@/models/ModelUser';
import { isArray } from 'lodash';
import moment from 'moment';

import { hasPermission, PermissionsGroup } from '.';

export type ConversationMatchedProps = {
  conversation: IConversation;
  filterConversation: IFilterConversation;
  settingLiveChat?: ISettingLiveChat;
  user?: IUser;
};

export function checkRoleInBot(
  roleInBot: EPageTask[],
  checkRole: 'admin' | 'editor' | 'liveChat',
) {
  const allowedRoles = {
    admin: [EPageTask.MANAGE],
    editor: [EPageTask.MANAGE, EPageTask.CREATE_CONTENT],
    liveChat: [EPageTask.MANAGE, EPageTask.CREATE_CONTENT, EPageTask.MODERATE],
  };

  const requiredRoles = allowedRoles[checkRole];

  return requiredRoles.some((role) => roleInBot.includes(role));
}

export function getMaxSizeAttachment(pageId = '') {
  const isZaloPlatform = [
    PrefixPlatformEnum.personal_zalo,
    PrefixPlatformEnum.zalo_oa,
  ].some((platform) => pageId.includes(platform));

  const imageSizeMB = isZaloPlatform ? 10 : 5;
  const videoSizeMB = isZaloPlatform ? 25 : 15;

  return {
    imageSizeMB,
    maxImageSize: imageSizeMB * 1024 * 1024,
    maxVideoSize: videoSizeMB * 1024 * 1024,
    videoSizeMB,
  };
}

export function handleSnippet(snippet: string) {
  switch (snippet) {
    case '[card]': {
      return '[Danh thiếp]';
    }

    case '[file]': {
      return '[Tệp đính kèm]';
    }

    case '[gif]': {
      return '[Gif]';
    }

    case '[image]': {
      return '[Ảnh]';
    }

    case '[link]': {
      return '[Link website]';
    }

    case '[phone]': {
      return '[Cuộc gọi thoại]';
    }

    case '[sticker]': {
      return '[Sticker]';
    }

    case '[template]': {
      return '[Template]';
    }

    case '[video]': {
      return '[Video]';
    }

    default: {
      return snippet;
    }
  }
}

export function isConversationMatched(props: ConversationMatchedProps) {
  const { conversation, filterConversation, settingLiveChat, user } = props;
  const {
    filterTagsMode,
    filterTagsType,
    listPageIds,
    name,
    tags,
    timeRange,
    type,
    typeTimePeriod,
  } = filterConversation;
  const {
    allowUnselectedStaffToViewAllChats,
    listTeamAssignment = [],
    staffNotInListCanViewAllChats,
    staffViewOwnAndUnassignedChats,
    staffViewOwnChatsOnly,
    typeAssignment,
    usersAssignedToComments = [],
    usersAssignedToInboxs = [],
  } = settingLiveChat ?? {};
  const isAdmin = hasPermission(
    user?.permissions,
    PermissionsGroup.autoAssignmentSetting,
    ['read', 'update'],
  );

  if (type) {
    if (type.includes('unread') && !conversation.unread) {
      return false;
    }

    if (
      type.includes('inbox') &&
      conversation.type === TypeConversation.COMMENT
    ) {
      return false;
    }

    if (
      type.includes('comment') &&
      conversation.type === TypeConversation.INBOX
    ) {
      return false;
    }

    if (
      type.includes('phone') &&
      conversation.recentPhoneNumbers.length === 0
    ) {
      return false;
    }

    if (
      type.includes('no-phone') &&
      conversation.recentPhoneNumbers.length > 0
    ) {
      return false;
    }

    if (type.includes('un-replied') && conversation.lastSentByPage) {
      return false;
    }

    if (type.includes('tags')) {
      const condition =
        filterTagsType === 'AND'
          ? tags?.every((tag) => conversation.tags.includes(tag))
          : tags?.some((tag) => conversation.tags.includes(tag));

      const isValid = filterTagsMode === 'contains' ? condition : !condition;

      if (!isValid) {
        return false;
      }
    }

    if (
      type.includes('time-period') &&
      typeTimePeriod &&
      timeRange?.since &&
      timeRange.until
    ) {
      if (
        typeTimePeriod === 'created_time' &&
        !moment(conversation.createdAt).isBetween(
          moment(timeRange.since),
          moment(timeRange.until),
        )
      ) {
        return false;
      }

      if (
        typeTimePeriod === 'updated_time' &&
        !moment(conversation.updatedAt).isBetween(
          moment(timeRange.since),
          moment(timeRange.until),
        )
      ) {
        return false;
      }
    }

    if (type.includes('pages') && !listPageIds?.includes(conversation.pageId)) {
      return false;
    }
  }

  if (!isAdmin) {
    if (user) {
      if (
        typeAssignment === ETypeAssignment.autoAssignOff &&
        staffViewOwnChatsOnly &&
        !conversation.assignTo.includes(user._id)
      ) {
        return false;
      }

      if (
        typeAssignment === ETypeAssignment.selfAssignment &&
        staffViewOwnAndUnassignedChats &&
        conversation.assignTo.length > 0 &&
        !conversation.assignTo.includes(user._id)
      ) {
        return false;
      }

      if (typeAssignment === ETypeAssignment.teamAssignment) {
        const grantedGroupIds = listTeamAssignment
          .filter((item) => item.userIds.includes(user._id))
          .map((item) => item.id);

        if (
          grantedGroupIds.length > 0 &&
          !grantedGroupIds.includes(conversation.assignGroupId || '') &&
          !staffNotInListCanViewAllChats
        ) {
          return false;
        }
      }

      if (typeAssignment === ETypeAssignment.accountAssignment) {
        const listUserAssignedInboxIds = usersAssignedToInboxs.map(
          (item) => item.id,
        );
        const listUserAssignedCommentIds = usersAssignedToComments.map(
          (item) => item.id,
        );
        // Check điều kiện: Tài khoản (nhân viên) không được chọn trong danh sách tài khoản trên sẽ xem được tất cả các cuộc hội thoại của trang.
        const isAccountValid =
          allowUnselectedStaffToViewAllChats &&
          ![
            ...listUserAssignedCommentIds,
            ...listUserAssignedInboxIds,
          ].includes(user._id);

        if (!isAccountValid) {
          if (
            listUserAssignedInboxIds.length === 0 &&
            conversation.type === TypeConversation.INBOX
          ) {
            return false;
          }

          if (
            listUserAssignedInboxIds.length > 0 &&
            conversation.type === TypeConversation.INBOX &&
            (!listUserAssignedInboxIds.includes(user._id) ||
              !conversation.assignTo.includes(user._id))
          ) {
            return false;
          }

          if (
            listUserAssignedCommentIds.length === 0 &&
            conversation.type === TypeConversation.COMMENT
          ) {
            return false;
          }

          if (
            listUserAssignedCommentIds.length > 0 &&
            conversation.type === TypeConversation.COMMENT &&
            (!listUserAssignedCommentIds.includes(user._id) ||
              !conversation.assignTo.includes(user._id))
          ) {
            return false;
          }
        }
      }
    } else {
      return false;
    }
  }

  if (name) {
    const normalizedName = name.replaceAll(/\s+/g, '');

    if (/^\d+$/.test(normalizedName)) {
      const phoneItem = conversation.recentPhoneNumbers.find((item) => {
        return !item.phoneNumber.includes(normalizedName);
      });

      if (phoneItem) {
        return false;
      }
    } else if (
      conversation.from.name &&
      !conversation.from.name.toLowerCase().includes(name.toLowerCase())
    ) {
      return false;
    }
  }

  return true;
}

export const defaultPageSetting: IPageSettings = {
  _id: '',
  pageId: '',
  settingFacebook: {
    greetingText: '',
    isActiveMainMenu: false,
    isDisabledUserTyping: false,
    isGetStarted: false,
    mainMenu: [],
  },
  settingIntegrations: {
    chatgpt: {
      apiKey: '',
      frequency_penalty: undefined,
      hasSpeechToText: undefined,
      instructions: undefined,
      isConnected: false,
      max_tokens: undefined,
      model: undefined,
      presence_penalty: undefined,
      sendTyping: undefined,
      speechLang: undefined,
      temperature: undefined,
      top_p: undefined,
      useAIReply: undefined,
    },
    configOdoo: null,
    userErp: null,
  },
  settingLiveChat: {
    allowUnselectedStaffToViewAllChats: false,
    autoAssignToFirstStaffReply: false,
    blackListWords: [],
    distributionMode: EDistributionMode.EQUAL,
    enabledNotification: false,
    listTeamAssignment: [],
    shuffleStaff: false,
    staffNotInListCanViewAllChats: false,
    staffViewOwnAndUnassignedChats: false,
    staffViewOwnChatsOnly: false,
    typeAssignment: '',
    usersAssignedToComments: [],
    usersAssignedToInboxs: [],
    viewPermissionAccount: '',
  },
  settingTag: {
    autoFirstTag: false,
    welcomeTags: [],
  },
};

export const mappingPageSetting = (
  pageSetting?: IPageSettings | IPageSettings[],
) => {
  if (!pageSetting) return defaultPageSetting;
  if (isArray(pageSetting)) {
    const firstPageSetting = pageSetting[0];
    return {
      _id: firstPageSetting._id,
      isPageGroup: true,
      pageId: firstPageSetting.pageId,
      pageIds: pageSetting.map((item) => item.pageId),
      pageSettings: pageSetting,
      settingFacebook: firstPageSetting.settingFacebook,
      settingIntegrations: firstPageSetting.settingIntegrations,
      settingLiveChat: firstPageSetting.settingLiveChat,
      settingTag: firstPageSetting.settingTag,
    };
  }

  return pageSetting;
};
