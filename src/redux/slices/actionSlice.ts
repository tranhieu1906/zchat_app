import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ActionConversation = {
  assignGroupId?: string;
  assignTo?: string[];
  id?: string;
  isBlocked?: boolean;
  isPinned?: boolean;
  pageId?: string;
  scopedUserId?: string;
  unread?: boolean;
};

export type ActionListConversation = 'checkedAll' | 'none' | 'unCheckedAll';

export type ActionState = {
  actionConversations: ActionConversation[];
  actionListConversation: ActionListConversation;
  savedFAQ: boolean;
  savedMainMenu: boolean;
};

const initialState: ActionState = {
  actionConversations: [],
  actionListConversation: 'none',
  savedFAQ: false,
  savedMainMenu: false,
};

export const actionSlice = createSlice({
  initialState,
  name: 'action',
  reducers: {
    setActionConversations: (
      state,
      action: PayloadAction<ActionConversation[]>,
    ) => {
      state.actionConversations = action.payload;

      return state;
    },
    setActionListConversation: (
      state,
      action: PayloadAction<ActionListConversation>,
    ) => {
      state.actionListConversation = action.payload;

      return state;
    },
    setSavedFAQ: (state, action: PayloadAction<boolean>) => {
      state.savedFAQ = action.payload;

      return state;
    },
    setSavedMainMenu: (state, action: PayloadAction<boolean>) => {
      state.savedMainMenu = action.payload;

      return state;
    },
  },
});

export const {
  setActionConversations,
  setActionListConversation,
  setSavedFAQ,
  setSavedMainMenu,
} = actionSlice.actions;
export default actionSlice.reducer;
