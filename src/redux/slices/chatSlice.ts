import {
  FilterMessage,
  IConversation,
  IFilterConversation,
  IMessage,
} from '@/models/ModelChat';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createTransform } from 'redux-persist';

export type ChatState = {
  conversationActive: IConversation | undefined;
  filterConversation: IFilterConversation;
  filterMessage: FilterMessage | undefined;
  isScrollToMessage: boolean;
  keyboardHeight: number;
  listConversationChecked: string[];
  replyMessage: IMessage | undefined;
  selectedPhotos: string[];
  showInfoPost: boolean;
};

const initialState: ChatState = {
  conversationActive: undefined,
  filterConversation: {
    sortByUnread: false,
    type: ['all'],
  },
  filterMessage: undefined,
  isScrollToMessage: false,
  keyboardHeight: 0,
  listConversationChecked: [],
  replyMessage: undefined,
  selectedPhotos: [],
  showInfoPost: true,
};

export const chatSlice = createSlice({
  initialState,
  name: 'chat',
  reducers: {
    resetChatSlice: (state) => {
      state = initialState;

      return state;
    },
    setConversationActive: (
      state,
      action: PayloadAction<IConversation | undefined>,
    ) => {
      state.conversationActive = action.payload;

      return state;
    },
    setFilterConversation: (
      state,
      action: PayloadAction<IFilterConversation>,
    ) => {
      state.filterConversation = action.payload;

      return state;
    },
    setFilterMessage: (
      state,
      action: PayloadAction<FilterMessage | undefined>,
    ) => {
      state.filterMessage = action.payload;

      return state;
    },
    setIsScrollToMessage: (state, action: PayloadAction<boolean>) => {
      state.isScrollToMessage = action.payload;

      return state;
    },
    setKeyboardHeight: (state, action: PayloadAction<number>) => {
      state.keyboardHeight = action.payload;

      return state;
    },
    setListConversationChecked: (state, action: PayloadAction<string[]>) => {
      state.listConversationChecked = action.payload;

      return state;
    },
    setReplyMessage: (state, action: PayloadAction<IMessage | undefined>) => {
      state.replyMessage = action.payload;

      return state;
    },
    setSelectedPhotos: (state, action: PayloadAction<string[]>) => {
      state.selectedPhotos = action.payload;

      return state;
    },
    setShowInfoPost: (state, action: PayloadAction<boolean>) => {
      state.showInfoPost = action.payload;

      return state;
    },
  },
});

export const chatSliceTransform = createTransform<ChatState, ChatState>(
  (inboundState) => {
    return {
      ...inboundState,
      isScrollToMessage: false,
      listConversationChecked: [],
    };
  },
  (outboundState) => outboundState,
  { whitelist: [chatSlice.name] },
);

export const {
  resetChatSlice,
  setConversationActive,
  setFilterConversation,
  setFilterMessage,
  setIsScrollToMessage,
  setKeyboardHeight,
  setListConversationChecked,
  setReplyMessage,
  setSelectedPhotos,
  setShowInfoPost,
} = chatSlice.actions;
export default chatSlice.reducer;
