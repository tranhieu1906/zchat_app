export enum EDistributionMode {
  EQUAL = 'equal', // Chia đều
  ONLINE_ONLY = 'online_only', // Chỉ trực tuyến
  PREFER_ONLINE = 'prefer_online', // Ưu tiên trực tuyến
}
import {
  CommonFilter,
  IAttachment,
  RepeatType,
  TypeConversation,
} from './common';
import { IQuickReply } from './ModelPage';

export enum FbReferralSource {
  ADS = 'ADS',
  CUSTOMER_CHAT_PLUGIN = 'CUSTOMER_CHAT_PLUGIN',
  SHORTLINK = 'SHORTLINK',
}

export enum TypeReaction {
  ANGRY = 'ANGRY',
  HAHA = 'HAHA',
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  NONE = 'NONE',
  SAD = 'SAD',
  WOW = 'WOW',
}

export type AddOptionPollDto = {
  new_options: { content: string; voted: boolean }[];
  pageId: string;
  pollId: string;
  voted_option_ids?: number[];
};

export type AssignConversationDto = {
  _id: string;
  assignGroupId?: string;
  assignTo?: string[];
};

export type BulkUpdateConversationDto = {
  conversationIds: string[];
  isPinned?: boolean;
  unread?: boolean;
};

export type CreateFolderImageDto = {
  name: string;
  pageId: string;
};

export type CreatePollDto = {
  allowAddNewOption?: boolean;
  allowMultiChoices?: boolean;
  expiredTime?: number;
  groupId: string;
  hideVotePreview?: boolean;
  isAnonymous?: boolean;
  options: string[];
  pinAct?: boolean;
  question: string;
};

export type CreateReminderDto = {
  content: string;
  pageId: string;
  repeatType: RepeatType;
  scopedUserId: string;
  time: Date;
};

export type CursorData = {
  afterCursor?: string;
  beforeCursor?: string;
};

export type DeleteCommentDto = {
  commentId: string;
  pageId: string;
};

export type DeleteFolderImageDto = {
  _id: string;
};

export type DeleteImageDto = {
  ids: string[];
  pageId: string;
};

export type DeleteReminderDto = {
  pageId: string;
  reminderId: string;
  scopedUserId: string;
};

export type FilterFolderImage = {
  pageId: string;
};

export type FilterMessage = {
  message?: IMessage;
};

export type ForwardMessageDto = {
  editMessage?: string;
  messageId: string;
  pageId: string;
  scopedUserIds: string[];
};

export type GetCommentDto = {
  afterCursor?: string;
  beforeCursor?: string;
  postId: string;
  scopedUserId: string;
  signal?: AbortSignal;
};

export type GetConversationDto = {
  afterCursor?: string;
  beforeCursor?: string;
  filter: IFilterConversation;
  pageId: string | string[];
};

export type GetDetailConversationDto = {
  feedId?: string;
  pageId: string;
  scopedUserId: string;
};

export type GetMessageDto = {
  afterCursor?: string;
  beforeCursor?: string;
  filter?: FilterMessage;
  pageId: string;
  scopedUserId: string;
  signal?: AbortSignal;
};

export type GetSurroundingMessagesDto = {
  message: IMessage;
  pageId: string;
  scopedUserId: string;
};

export type IAction = {
  data: {
    implementer: {
      id: string;
      name: string;
    };
    type: IDataActionType;
    updateMembers?: {
      avatar_25: string;
      dName: string;
      id: string;
      type: string;
    }[];
  };
  type: IActionType;
};

export type IActionType = 'zalo_system_message';

export type IAdminCreator = {
  id: string;
  name: string;
};

export type IAttachmentMessage = {
  payload: {
    [key: string]: any;
    buttons?: { payload: string; title: string; type: string }[];
    sticker_id?: string;
    template_type?: string;
    thumbnailUrl?: string;
    url: string;
  };
  type: string;
};

export type IComment = {
  _id: string;
  attachment?: IFeedAttachment;
  canReplyPrivately: boolean;
  createdAt: Date;
  deletedAt?: Date;
  feedId: string;
  from: ISender;
  isHidden: boolean;
  isLiked: boolean;
  loading?: boolean;
  mentions: IMention[];
  message: string;
  pageReaction: TypeReaction;
  parentId?: string;
  parentIds?: string[];
  phoneInfo: IRecentPhoneNumber[];
  senderId: string;
  translateValue?: string;
  translations?: TypeTranslation[];
  updatedAt: Date;
};

export type IConversation = {
  _id: string;
  assignGroupId: string;
  assignTo: string[];
  createdAt: Date;
  customers: ISender[];
  extraInfo: any;
  feedId: string;
  from: ISender;
  globalGroupId?: string;
  hasPhone: boolean;
  isBlocked: boolean;
  isPinned: boolean;
  lastDefaultMessageSent: Date;
  lastSentBy: ISender;
  lastSentByPage: boolean;
  pageId: string;
  recentPhoneNumbers: IRecentPhoneNumber[];
  scopedUserId: string;
  snippet: string;
  tags: string[];
  threadId: string;
  threadKey: string;
  type: TypeConversation;
  unread: boolean;
  unreadCount: number;
  updatedAt: Date;
  userGlobalId: string;
  userReadAt: Date;
};

export type IDataActionType =
  | 'member_join_group'
  | 'member_leave_group'
  | 'remove_member_group';

export type IDraftMessage = Record<
  string,
  {
    attachments: IAttachment[];
    mentions: any[];
    quickReply?: IQuickReply;
    selectedImages: IImage[];
    text: string;
  }
>;

export type IFeedAttachment = {
  id: string;
  type: string;
  url: string;
};

export type IFilterConversation = {
  adIds?: string[];
  assignTo?: string[];
  filterAdsType?: 'AND' | 'OR';
  filterTagsMode?: 'contains' | 'notContains';
  filterTagsType?: 'AND' | 'OR';
  listPageIds?: string[];
  sortByUnread?: boolean;
  staffViewOwnAndUnassignedChats?: boolean;
  staffViewOwnChatsOnly?: boolean;
  tags?: string[];
  timeRange?: {
    since: Date;
    until?: Date;
  };
  type?: KeyTypeFilterConversation[];
  typeAssignment?: string;
  typeTimePeriod?: 'created_time' | 'updated_time';
} & CommonFilter;

export type IFilterImage = {
  folderId?: string;
  isFavorite?: boolean;
  limit?: number;
  pageId: string;
  sortBy?: string;
};

export type IFolderImage = {
  _id: string;
  createdAt: Date;
  name: string;
  updatedAt: Date;
};

export type IImage = {
  _id: string;
  attachmentId: string;
  createdAt: Date;
  filename: string;
  filetype: string;
  folderId: string;
  isFavorite: boolean;
  owner: string;
  pageId: string;
  size: number;
  thumbnailUrl: string;
  updatedAt: Date;
  url: string;
};

export type IMention = {
  commentId: string;
  globalId: string;
  length: number;
  name: string;
  offset: number;
  scopedUserId: string;
  type: 'group' | 'page' | 'user';
};

export type IMessage = {
  _id: string;
  action?: IAction;
  attachments: IAttachmentMessage[];
  deletedAt?: Date;
  from?: ISender;
  globalGroupId?: string;
  highlighted?: boolean;
  loading?: boolean;
  pageId: string;
  phoneInfo: IRecentPhoneNumber[];
  poll?: IPoll;
  quote?: IMessage;
  rawMessage?: any;
  reaction: IReaction[];
  recipientId: string;
  referral?: IReferralAds;
  scopedUserId: string;
  senderId: string;
  text: string;
  timestamp: Date | string;
  translateValue?: string;
  translations: TypeTranslation[];
};

export type IPoll = {
  allow_add_new_option: boolean;
  allow_multi_choices: boolean;
  created_time: number;
  expired_time: number;
  is_anonymous: boolean;
  is_hide_vote_preview: boolean;
  mid: string;
  num_vote: number;
  options: PollOption[];
  question: string;
  updated_time: number;
};

export type IPost = {
  _id: string;
  adminCreator: IAdminCreator;
  attachments?: IFeedAttachment[];
  createdAt: Date;
  message: string;
  parentId?: string;
  updatedAt: Date;
};

export type IReaction = {
  action: 'react' | 'unreact';
  emoji: string;
  mid: string;
  reaction:
    | 'angry'
    | 'dislike'
    | 'like'
    | 'love'
    | 'other'
    | 'sad'
    | 'smile'
    | 'wow';
};

export type IRecentPhoneNumber = {
  length: number;
  messageContent: string;
  messageId: string;
  offset: number;
  phoneNumber: string;
  type: TypeConversation;
};

export type IReferralAds = {
  adCtx: FbAdsContextData;
  adId: string;
  isGuestUser: string;
  postId: string;
  ref?: string;
  refererUri?: string;
  source: FbReferralSource;
};

export type IReminder = {
  color: number;
  createTime: string;
  creatorId: string;
  creatorUid: string;
  duration: number;
  editorId: string;
  editTime: number;
  emoji: string;
  endTime: number;
  eventType: number;
  groupId: string;
  id: string;
  params: {
    setTitle: boolean;
    title: string;
  };
  reminderId: string;
  repeat: RepeatType;
  startTime: number;
  toUid: string;
  type: number;
};

export type ISender = {
  avatar?: string;
  globalId?: string;
  id: string;
  name: string;
};

export type KeyTypeFilterConversation =
  | 'all'
  | 'assign-to'
  | 'comment'
  | 'inbox'
  | 'no-phone'
  | 'pages'
  | 'phone'
  | 'source'
  | 'tags'
  | 'time-period'
  | 'un-replied'
  | 'unread';

export type PinMessageDto = {
  conversationId: string;
  messageId: string;
  pageId: string;
};

export type PollOption = {
  content: string;
  option_id: number;
  voted: boolean;
  voters: string[];
  votes: number;
};

export type ReactionMessageDto = {
  messageId: string;
  pageId: string;
  reaction: string;
  scopedUserId: string;
};

export type ResponseInfinityQuery<T> = {
  pageParams: any[];
  pages: { cursor: any; data: T[]; pagination: any }[];
};

export type ResponsePagingCursor<T> = {
  cursor: CursorData;
  data: T[];
};

export type SendCardZaloDto = {
  pageId: string;
  phoneNumber: string;
  scopedUserId: string;
  threadId: string;
};

export type SendCommentDto = {
  attachments?: IAttachment[];
  message?: string;
  objectId: string;
  pageId: string;
  translateSentMessage?: string;
};

export type SendFileDto = {
  file: any;
  pageId: string;
  scopedUserId: string;
};

export type SendMessageDto = {
  attachments?: IAttachment[];
  mentions?: ISender[];
  replyMessage?: IMessage;
  text?: string;
  translateSentMessage?: string;
};

export type TranslateCommentDto = {
  comment: IComment;
  translateToLanguage: string;
};

export type TranslateListCommentDto = {
  listComment: IComment[];
  translateToLanguage: string;
};

export type TranslateListMessageDto = {
  listMessage: IMessage[];
  translateToLanguage: string;
};

export type TranslateMessageDto = {
  message: IMessage;
  pageId: string;
  translateToLanguage: string;
};

export type TypeTranslation = {
  language: string;
  value: string;
};

export type UndoMessageDto = {
  messageId: string;
  pageId: string;
  scopedUserId: string;
};

export type UpdateConversationDto = {
  block?: boolean;
  feedId?: string;
  pageId: string;
  scopedUserId: string;
  unread?: boolean;
};

export type UpdateFolderImageDto = {
  _id: string;
  name: string;
};

export type UpdateHiddenCommentDto = {
  commentId: string;
  isHidden: boolean;
  pageId: string;
};

export type UpdateImageDto = {
  _id: string;
  isFavorite: boolean;
};

export type UpdateLikeCommentDto = {
  commentId: string;
  isLiked: boolean;
  pageId: string;
};

export type UpdateReminderDto = {
  reminderId: string;
} & CreateReminderDto;

export type UploadImageDto = {
  folderId?: string;
  folderName?: string;
  formData: FormData;
  pageId: string;
};

export type VotePollDto = {
  optionIds: number[];
  pageId: string;
  pollId: string;
};

export class FbAdsContextData {
  ad_title?: string;
  photo_url?: string;
  post_id?: string;
  product_id?: string;
  thumbnail_url?: string;
  video_url?: string;
}
