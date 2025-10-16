export const QueryKeyChat = {
  getConversations: (pageId: string | string[]) => {
    if (Array.isArray(pageId)) {
      return `conversations-${pageId.join('-')}`;
    }
    return `conversations-${pageId}`;
  },
  getCustomers: (pageId: string, scopedUserId: string) =>
    `customers-${pageId}-${scopedUserId}`,
  getDetailConversation: () => `detail-conversation`,
  getDetailPost: (postId: string) => `detail-post-${postId}`,
  getListComment: (postId: string, scopedUserId: string) =>
    `list-comment-${postId}-${scopedUserId}`,
  getListFolder: () => 'list-folder',
  getListImage: () => 'list-image',
  getListMessage: (pageId: string, scopedUserId: string) =>
    `list-message-${pageId}-${scopedUserId}`,
};
