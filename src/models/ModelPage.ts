import { IButtonChildren, TypeCard } from '@/redux/slices/flowSlice';
import { ReactNode } from 'react';

import {
  CommonPlatform,
  CommonStatus,
  CommonStatusBot,
  GenderEnum,
  IAttachment,
  PageRole,
  RoleInPageEnum,
  SourceScopedUser,
  TypeAttachment,
} from './common';
import {
  EDistributionMode,
  FbAdsContextData,
  FbReferralSource,
  IAttachmentMessage,
  IRecentPhoneNumber,
} from './ModelChat';
import { TeamAssignment, UserAssignment } from './ModelSettings';

export enum EPageTask {
  ADVERTISE = 'ADVERTISE',
  ANALYZE = 'ANALYZE',
  CASHIER_ROLE = 'CASHIER_ROLE',
  CREATE_CONTENT = 'CREATE_CONTENT',
  MANAGE = 'MANAGE',
  MANAGE_JOBS = 'MANAGE_JOBS',
  MANAGE_LEADS = 'MANAGE_LEADS',
  MESSAGING = 'MESSAGING',
  MODERATE = 'MODERATE',
  MODERATE_COMMUNITY = 'MODERATE_COMMUNITY',
  PAGES_MESSAGING = 'PAGES_MESSAGING',
  PAGES_MESSAGING_SUBSCRIPTIONS = 'PAGES_MESSAGING_SUBSCRIPTIONS',
  PROFILE_PLUS_ADVERTISE = 'PROFILE_PLUS_ADVERTISE',
  PROFILE_PLUS_ANALYZE = 'PROFILE_PLUS_ANALYZE',
  PROFILE_PLUS_CREATE_CONTENT = 'PROFILE_PLUS_CREATE_CONTENT',
  PROFILE_PLUS_FACEBOOK_ACCESS = 'PROFILE_PLUS_FACEBOOK_ACCESS',
  PROFILE_PLUS_FULL_CONTROL = 'PROFILE_PLUS_FULL_CONTROL',
  PROFILE_PLUS_MANAGE = 'PROFILE_PLUS_MANAGE',
  PROFILE_PLUS_MANAGE_LEADS = 'PROFILE_PLUS_MANAGE_LEADS',
  PROFILE_PLUS_MESSAGING = 'PROFILE_PLUS_MESSAGING',
  PROFILE_PLUS_MODERATE = 'PROFILE_PLUS_MODERATE',
  PROFILE_PLUS_MODERATE_DELEGATE_COMMUNITY = 'PROFILE_PLUS_MODERATE_DELEGATE_COMMUNITY',
  PROFILE_PLUS_REVENUE = 'PROFILE_PLUS_REVENUE',
  READ_PAGE_MAILBOXES = 'READ_PAGE_MAILBOXES',
  VIEW_MONETIZATION_INSIGHTS = 'VIEW_MONETIZATION_INSIGHTS',
}

export enum StatusUserPage {
  available = 'available',
  away = 'away',
  lock = 'lock',
}

export type AddFriendDto = {
  message: string;
  phoneNumber: string;
} & IFindUserZalo;

export type ChatCompletionChatGPTDto = {
  frequency_penalty?: number;
  instructions?: string;
  listMessage: IMessageChatGPT[];
  max_tokens?: number;
  model: string;
  pageId: string;
  presence_penalty?: number;
  temperature?: number;
  top_p?: number;
};

export type ChildrenTabsPopover = {
  children?: Omit<ChildrenTabsPopover, 'children' | 'type'>[];
  icon?: ReactNode;
  key: string;
  label: ReactNode;
  type?: 'group';
};

export type ConditionType =
  | 'begins_with'
  | 'contains_all'
  | 'contains'
  | 'is'
  | 'like'
  | 'not_contains';

export type ConfigChatGPTDto = {
  frequency_penalty?: number;
  hasSpeechToText?: boolean;
  instructions?: string;
  max_tokens?: number;
  model: string;
  pageId: string;
  presence_penalty?: number;
  sendTyping?: boolean;
  speechLang?: string;
  temperature?: number;
  top_p?: number;
  useAIReply?: boolean;
};

export type ConnectDatasetDto = {
  code: string;
  datasetId?: string;
  pageId: string;
};

export type ConversationReferral = {
  _id: string;
  adCtx: FbAdsContextData;
  adId: string;
  isGuestUser: boolean;
  pageId: string;
  postId: string;
  ref: string;
  refererUri: string;
  scopedUserId: string;
  source: FbReferralSource;
};

export type CopyPageSettingDto = {
  listOptionCopy: string[];
  pageId: string;
  pageIdsCopy: string[];
};

export type CreateFlowDto = {
  pageId: string;
  path?: string[];
};

export type CreateGroupDto = {
  memberIds: string[];
  name: string;
  pageId: string;
};

export type CreateKeywordDto = {
  actions: any[];
  conditions: any[];
  pageId: string;
  requirements: IKeywordRequirements[];
  status?: CommonStatus;
};

export type CreatePageGroupDto = {
  name: string;
  pageIds: string[];
};

export type CreateQuickReplyDto = {
  listContent: IContentQuickReply[];
  pageId: string;
  shortcut: string;
};

export type CreateSequenceDto = {
  name: string;
  pageId: string;
};

export type CreateTagDto = {
  color: string;
  name: string;
  pageId: string;
  sequences: string[];
};

export type GroupSetting = {
  addMemberOnly: number;
  banDuration: number;
  bannFeature: number;
  blockName: number;
  dirtyMedia: number;
  enableMsgHistory: number;
  joinAppr: number;
  lockCreatePoll: number;
  lockCreatePost: number;
  lockSendMsg: number;
  lockViewMember: number;
  setTopicOnly: number;
  signAdminMsg: number;
};

export type ICondition = {
  key: string;
  typeCondition: string;
  value: any;
};

export type IConfigOdoo = {
  apiCreateCustomer: string;
  autoCreateContact: boolean;
  blockPhones: string[];
  sourceId: number;
};

export type IContentQuickReply = {
  attachments: IAttachment[];
  message: string;
};

export type ICrmLead = {
  crm_group_id: {
    id: number;
    name: string;
  };
  crmf99_system_id: {
    id: number;
    name: string;
  };
  id: number;
  link_erp: string;
  name: string;
  nhanvienchamsoczalo_id: any;
  partner_id: {
    id: number;
    name: string;
  };
  social_user_zalo_zchat: any;
  tag_ids: {
    id: number;
    name: string;
  }[];
  team_id: {
    id: number;
    name: string;
  };
  user_id: {
    id: number;
    name: string;
  };
  user_zalo_zchat_id_instring: any;
};

export type IExtraInfoSocialAccount = {
  dob?: number;
  globalId?: string;
  phoneNumber?: string;
};

export type IFindUserZalo = {
  avatar: string;
  bizPkg: {
    pkgId: number;
  };
  cover: string;
  display_name: string;
  dob: number;
  gender: number;
  globalId: string;
  phoneNumber?: string;
  sdob: string;
  status: string;
  uid: string;
  zalo_name: string;
};

export type IFlow = {
  _id: string;
  contents: TypeCard[];
  createdAt: Date;
  drafts: TypeCard[];
  isPublished: boolean;
  name: string;
  pageId: string;
  path: string[];
  pinned: boolean;
  updatedAt: Date;
};

export type IGroupZalo = {
  _id: string;
  adminIds: string[];
  admins: any[];
  avt: string;
  createdTime: Date;
  creatorId: string;
  currentMems: any[];
  desc: string;
  fullAvt: string;
  globalId: string;
  hasMoreMember: number;
  maxMember: number;
  memberIds: string[];
  members: MemberProfile[];
  memVerList: string[];
  name: string;
  pageId: string;
  setting: GroupSetting;
  tags?: string[];
  totalMember: number;
  type: number;
  updateMems: any[];
};

export type IKeywordItem = {
  _id: string;
  actions: any[];
  conditions: any[];
  createdAt: Date;
  flow?: IFlow;
  pageId: string;
  requirements: IKeywordRequirements[];
  status: CommonStatus;
  type: string;
  updatedAt: Date;
};

export type IKeywordRequirements = {
  condition: ConditionType;
  keywords: string[];
};

export type IMessageChatGPT = {
  content: string;
  role: 'assistant' | 'user';
};

export type IPage = {
  _id: string;
  assistantId: string;
  avatarUrl: string;
  connected: boolean;
  isPageGroup?: boolean;
  isPinned: boolean;
  isSubscribed: boolean;
  isSyncConversation: boolean;
  listPageCopying: string[];
  name: string;
  pageId: string;
  pageIds?: string[];
  pages?: IPage[];
  platform: CommonPlatform;
  platformExtraInfo?: Record<string, any>;
  roleInPage: RoleInPageEnum;
  status: CommonStatus;
  users: IUserPage[];
};

export type IPageGroup = {
  _id: string;
  name: string;
  pages: IPage[];
  users: string[];
};

export type IPageSettings = {
  _id: string;
  pageId: string;
  settingFacebook: ISettingFacebook;
  settingIntegrations: ISettingIntegrations;
  settingLiveChat: ISettingLiveChat;
  settingTag: ISettingTag;
};

export type IQuickReply = {
  _id: string;
  listContent: IContentQuickReply[];
  pageId: string;
  pinned: boolean;
  shortcut: string;
};

export type IRecommUser = {
  avatar: string;
  displayName: string;
  dob: number;
  gender: number;
  isSeenFriendReq: boolean;
  phoneNumber: string;
  recommInfo?: {
    message: string;
    source: number;
  };
  recommSrc: number;
  recommTime: number;
  recommType: number;
  status: string;
  type: number;
  userId: string;
  zaloName: string;
};

export type ISavedFilter = {
  name: string;
  value: ISettingFilterCondition;
};

export type IScopedUser = {
  _id: string;
  assistantId: string;
  avatar: string;
  email: string;
  firstInteraction: Date;
  gender: GenderEnum;
  isBotEnabled: CommonStatusBot;
  lastInteraction: Date;
  name: string;
  notes: IScopedUserNote[];
  openaiThreadId: string;
  pageId: string;
  recentPhoneNumbers: IRecentPhoneNumber[];
  scopedUserId: string;
  sequences: string[];
  shortName: string;
  source: SourceScopedUser;
  tags: string[];
};

export type IScopedUserNote = {
  _id: string;
  attachmentUrl: string;
  createdAt: Date;
  createdBy: any;
  isDeleted: boolean;
  isPinned: boolean;
  message: string;
};

export type ISequence = {
  _id: string;
  name: string;
  pageId: string;
  pinned: boolean;
  steps: IStep[];
  subscribers: number;
};

export type ISettingFacebook = {
  datasetId?: string;
  defaultReply?: IFlow;
  FAQ?: IButtonChildren[];
  greetingText: string;
  isActiveFAQ?: boolean;
  isActiveMainMenu: boolean;
  isDisabledUserTyping: boolean;
  isGetStarted: boolean;
  isSyncEventFacebook?: boolean;
  mainMenu: IButtonChildren[];
  messageTag?: string;
  welcomeMessage?: IFlow;
};

export type ISettingFilterCondition = {
  conditions: ICondition[];
  typeFilter: 'all' | 'any';
};

export type ISettingIntegrations = {
  chatgpt: {
    apiKey: string;
    frequency_penalty?: number;
    hasSpeechToText?: boolean;
    instructions?: string;
    isConnected: boolean;
    max_tokens?: number;
    model?: string;
    presence_penalty?: number;
    sendTyping?: boolean;
    speechLang?: string;
    temperature?: number;
    top_p?: number;
    useAIReply?: boolean;
  };
  configOdoo: IConfigOdoo | null;
  userErp: IUserErp | null;
};

export type ISettingLiveChat = {
  allowUnselectedStaffToViewAllChats: boolean;
  autoAssignToFirstStaffReply: boolean;
  blackListWords: string[];
  distributionMode: EDistributionMode;
  enabledNotification: boolean;
  listTeamAssignment: TeamAssignment[];
  shuffleStaff: boolean;
  staffNotInListCanViewAllChats: boolean;
  staffViewOwnAndUnassignedChats: boolean;
  staffViewOwnChatsOnly: boolean;
  translateMessage?: boolean;
  translateSentMessage?: string;
  translateToLanguage?: string;
  typeAssignment: string;
  usersAssignedToComments: UserAssignment[];
  usersAssignedToInboxs: UserAssignment[];
  viewPermissionAccount: string;
};

export type ISettingTag = {
  autoFirstTag: boolean;
  welcomeTags: string[];
};

export type ISocialAccount = {
  _id: string;
  accessToken: string;
  avatarUrl: string;
  email: string;
  extraInfo: IExtraInfoSocialAccount;
  gender: GenderEnum;
  name: string;
  pages: string[];
  platform: CommonPlatform;
  status: CommonStatus;
};

export type IStep = {
  _id: string;
  config: any;
  createdAt?: Date;
  flow?: IFlow;
  isPublished: boolean;
  name: string;
  schedule: {
    delay: null | number;
    durationType: 'day' | 'hour' | 'immediately' | 'minute' | 'second';
    since?: Date;
    timeType: 'anyTime' | 'timeRange';
    until?: Date;
  };
  totalPhoneNumber: number;
  totalSent: number;
  updatedAt?: Date;
};

export type ITabsPopover = {
  children: ChildrenTabsPopover[];
  key: string;
  label: ReactNode;
};

export type ITag = {
  _id: string;
  color: string;
  name: string;
  pageId: string;
  sequences: string[];
};

export type IUpdatePageDto = {
  isPinned?: boolean;
  pageId: string;
  users?: IUserPage[];
};

export type IUpdateScopedUserDto = {
  file?: FormData;
  note?: Partial<IScopedUserNote>;
  pageId: string;
} & Partial<IScopedUser>;

export type IUserErp = {
  baseUrl: string;
  crmPosition: string;
  email: string;
  groupId: string;
  groupName: string;
  groupNameChild: any[];
  groupType: string;
  image128Url: string;
  marketingTeamId: string;
  marketingTeamName: string;
  phone: string;
  saleTeamId: string;
  saleTeamName: string;
  saleTeamType: string;
  sessionId: string;
  systemId: string;
  systemName: string;
  systemNameChild: any[];
  systemType: string;
  userId: number;
  userName: string;
};

export type IUserPage = {
  isOnline?: boolean;
  permissionId?: string;
  role?: PageRole;
  status: StatusUserPage;
  userId: string;
};

export type MemberProfile = {
  accountStatus: number;
  avatar: string;
  displayName: string;
  globalId: string;
  id: string;
  lastUpdateTime: number;
  type: number;
  zaloName: string;
};

export type PageAttachments = {
  _id: string;
  attachment: IAttachmentMessage;
  createdAt: Date;
  pageId: string;
  scopedUserId: string;
  type: TypeAttachment;
  url: string;
};

export type PayloadSendEvent = {
  action_source: 'business_messaging';
  event_name: 'InitiateCheckout' | 'Purchase';
  event_time: number;
  messaging_channel: 'instagram' | 'messenger' | 'whatsapp';
};

export type SendEventFacebookDto = {
  currency: string;
  pageId: string;
  payload: PayloadSendEvent;
  priceProduct: number;
  scopedUserId: string;
};

export type StatisticsUserSequences = {
  _id: string;
  count: number;
};

export type StatisticsUserTags = {
  _id: string;
  count: number;
};

export type UpdateFlowDto = {
  contents?: TypeCard[];
  drafts?: TypeCard[];
  name?: string;
  pinned?: boolean;
};

export type UpdateKeywordDto = {
  _id: string;
  actions?: any[];
  conditions?: any[];
  flow?: IFlow | null;
  pageId?: string;
  requirements?: IKeywordRequirements[];
  status?: CommonStatus;
};

export type UpdatePageGroupDto = {
  groupId: string;
  name?: string;
  pageIds?: string[];
};

export type UpdatePageSettingsDto = {
  _id: string;
  apiCreateCustomer?: string;
  autoCreateContact?: boolean;
  autoFirstTag?: boolean;
  blackListWords?: string[];
  blockPhones?: string[];
  chatgpt?: ISettingIntegrations['chatgpt'] | null;
  defaultReply?: IFlow;
  enabledNotification?: boolean;
  FAQ?: IButtonChildren[];
  greetingText?: string;
  isActiveFAQ?: boolean;
  isActiveMainMenu?: boolean;
  isDisabledUserTyping?: boolean;
  isGetStarted?: boolean;
  isSyncEventFacebook?: boolean;
  mainMenu?: IButtonChildren[];
  messageTag?: string;
  pageId: string;
  sourceId?: number;
  translateMessage?: boolean;
  translateSentMessage?: string;
  translateToLanguage?: string;
  userErp?: IUserErp | null;
  welcomeMessage?: IFlow;
  welcomeTags?: string[];
};

export type UpdateQuickReplyDto = {
  _id: string;
  listContent?: IContentQuickReply[];
  pageId: string;
  pinned?: boolean;
  shortcut?: string;
};

export type UpdateSequenceDto = {
  _id: string;
  name?: string;
  pageId: string;
  pinned?: boolean;
  steps?: any[];
};

export type UpdateSequenceStepDto = {
  flow?: IFlow;
  isPublished?: boolean;
  name?: string;
  sequenceId: string;
  stepId: string;
};

export type UpdateSettingLiveChatDto = {
  _id: string;
  allowUnselectedStaffToViewAllChats: boolean;
  autoAssignToFirstStaffReply?: boolean;
  distributionMode: EDistributionMode;
  listTeamAssignment?: TeamAssignment[];
  pageId: string;
  resetAssignmentAccountIndex?: boolean;
  resetAssignmentGroupIndex?: boolean;
  shuffleStaff: boolean;
  staffNotInListCanViewAllChats?: boolean;
  staffViewOwnAndUnassignedChats?: boolean;
  staffViewOwnChatsOnly?: boolean;
  typeAssignment?: string;
  usersAssignedToComments?: UserAssignment[];
  usersAssignedToInboxs?: UserAssignment[];
  viewPermissionAccount: string;
};

export type UpdateStatusPageDto = {
  pageId: string;
  status: CommonStatus;
};

export type UpdateTagDto = {
  _id: string;
  color?: string;
  name?: string;
  pageId: string;
  sequences?: string[];
};
