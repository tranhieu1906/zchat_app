export const QueryKeyPage = {
  getDetailFlow: (flowId: string) => `flow-detail-${flowId}`,
  getDetailGroupZalo: (groupId: string) => `group-zalo-${groupId}`,
  getDetailScopedUser: (pageId: string, scopedUserId: string) =>
    `scoped-user-detail-${pageId}-${scopedUserId}`,
  getDetailSequenece: (sequenceId: string) => `sequence-detail-${sequenceId}`,
  getFanpages: () => 'fanpages',
  getFlows: (pageId: string) => `flows-${pageId}`,
  getListKeyword: (pageId: string) => `list-keyword-${pageId}`,
  getMemberGroup: (groupId: string) => `member-group-${groupId}`,
  getPageAttachments: (pageId: string, scopedUserId: string) =>
    `page-attachments-${pageId}-${scopedUserId}`,
  getPageGroups: () => 'page-groups',
  getPageSettings: (pageId: string) => `page-settings-${pageId}`,
  getQuickReply: (pageId: string | string[]) => {
    if (Array.isArray(pageId)) {
      return `quick-reply-${pageId.join('-')}`;
    }

    return `quick-reply-${pageId}`;
  },
  getRecommendFriends: (pageId: string) => `recommend-friends-${pageId}`,
  getReferralPage: (pageId: string | string[]) => {
    if (Array.isArray(pageId)) {
      return `referral-page-${pageId.join('-')}`;
    }

    return `referral-page-${pageId}`;
  },
  getReferralScopedUser: (pageId: string, scopedUserId: string) =>
    `referral-scoped-user-${pageId}-${scopedUserId}`,
  getScopedUsers: (pageId: string) => `scoped-user-${pageId}`,
  getSequences: (pageId: string | string[]) => {
    if (Array.isArray(pageId)) {
      return `sequence-${pageId.join('-')}`;
    }

    return `sequence-${pageId}`;
  },
  getSocialAccount: (userId: string) => `social-account-${userId}`,
  getStatisticsUserTags: (pageId: string) => `statistics-user-tags-${pageId}`,
  getStatisticUserSequences: (pageId: string) =>
    `statistics-user-sequences-${pageId}`,
  getTags: (pageId: string | string[]) => {
    if (Array.isArray(pageId)) {
      return `tags-${pageId.join('-')}`;
    }

    return `tags-${pageId}`;
  },
};
