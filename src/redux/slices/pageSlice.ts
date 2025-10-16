/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { CommonPlatform, CommonStatus, RoleInPageEnum } from '@/models/common';
import { IDraftMessage } from '@/models/ModelChat';
import {
  IPage,
  IPageGroup,
  IPageSettings,
  IQuickReply,
  ISavedFilter,
  ISequence,
  ITag,
  StatisticsUserTags,
} from '@/models/ModelPage';
import { IPermission } from '@/models/ModelSettings';
import { IUser } from '@/models/ModelUser';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createTransform } from 'redux-persist';

export type PageState = {
  collapsedFlow: boolean;
  collapsedSidebar: boolean;
  collapsedTeamMember: boolean;

  draftMessage: IDraftMessage | undefined;
  listPageActived: IPage[];
  listPageGroup: IPageGroup[];
  listPageInactived: IPage[];
  listPermissions: IPermission[];
  listUsers: IUser[];
  pageSelected: IPage;
  pageSetting: IPageSettings | null;
  quickReplies: IQuickReply[];
  savedFilter: ISavedFilter[];
  sequences: ISequence[];
  statisticsUserTags: StatisticsUserTags[];
  tags: ITag[];
};

export const defaultPageSelected: IPage = {
  _id: '',
  assistantId: '',
  avatarUrl: '',
  connected: true,
  isPinned: false,
  isSubscribed: false,
  isSyncConversation: false,
  listPageCopying: [],
  name: '',
  pageId: '',
  platform: CommonPlatform.facebook,
  platformExtraInfo: undefined,
  roleInPage: RoleInPageEnum.ADMINISTER,
  status: CommonStatus.activated,
  users: [],
};

const initialState: PageState = {
  collapsedFlow: false,
  collapsedSidebar: false,
  collapsedTeamMember: false,
  draftMessage: undefined,
  listPageActived: [],
  listPageGroup: [],
  listPageInactived: [],
  listPermissions: [],
  listUsers: [],
  pageSelected: defaultPageSelected,
  pageSetting: null,
  quickReplies: [],
  savedFilter: [],
  sequences: [],
  statisticsUserTags: [],
  tags: [],
};

export const pageSlice = createSlice({
  initialState,
  name: 'page',
  reducers: {
    selectPage: (state, action: PayloadAction<IPage>) => {
      return { ...state, pageSelected: action.payload };
    },
    setCollapsedFlow: (state, action: PayloadAction<boolean>) => {
      return { ...state, collapsedFlow: action.payload };
    },
    setCollapsedSidebar: (state, action: PayloadAction<boolean>) => {
      return { ...state, collapsedSidebar: action.payload };
    },
    setCollapsedTeamMember: (state, action: PayloadAction<boolean>) => {
      return { ...state, collapsedTeamMember: action.payload };
    },
    setDraftMessage: (
      state,
      action: PayloadAction<IDraftMessage | undefined>,
    ) => {
      return { ...state, draftMessage: action.payload };
    },
    setListPageActived: (state, action: PayloadAction<IPage[]>) => {
      state.listPageActived = action.payload;
    },
    setListPageGroup: (state, action: PayloadAction<IPageGroup[]>) => {
      return { ...state, listPageGroup: action.payload };
    },
    setListPageInactived: (state, action: PayloadAction<IPage[]>) => {
      state.listPageInactived = action.payload;
    },
    setListPermissions: (state, action: PayloadAction<IPermission[]>) => {
      return { ...state, listPermissions: action.payload };
    },
    setListUsers: (state, action: PayloadAction<IUser[]>) => {
      return { ...state, listUsers: action.payload };
    },
    setPageSetting: (state, action: PayloadAction<IPageSettings | null>) => {
      return { ...state, pageSetting: action.payload };
    },
    setQuickReplies: (state, action: PayloadAction<IQuickReply[]>) => {
      return { ...state, quickReplies: action.payload };
    },
    setSavedFilter: (state, action: PayloadAction<ISavedFilter[]>) => {
      return { ...state, savedFilter: action.payload };
    },
    setSequences: (state, action: PayloadAction<ISequence[]>) => {
      return { ...state, sequences: action.payload };
    },
    setStatisticsUserTags: (
      state,
      action: PayloadAction<StatisticsUserTags[]>,
    ) => {
      return { ...state, statisticsUserTags: action.payload };
    },
    setTags: (state, action: PayloadAction<ITag[]>) => {
      return { ...state, tags: action.payload };
    },
  },
});

export const pageSliceTransform = createTransform<PageState, PageState>(
  (inboundState) => {
    return {
      ...inboundState,
      listPermissions: [],
      listUsers: [],
      quickReplies: [],
      sequences: [],
      statisticsUserTags: [],
      tags: [],
    };
  },
  (outboundState) => outboundState,
  { whitelist: [pageSlice.name] },
);

export const {
  selectPage,
  setCollapsedFlow,
  setCollapsedSidebar,
  setCollapsedTeamMember,
  setDraftMessage,
  setListPageActived,
  setListPageGroup,
  setListPageInactived,
  setListPermissions,
  setListUsers,
  setPageSetting,
  setQuickReplies,
  setSavedFilter,
  setSequences,
  setStatisticsUserTags,
  setTags,
} = pageSlice.actions;
export default pageSlice.reducer;
