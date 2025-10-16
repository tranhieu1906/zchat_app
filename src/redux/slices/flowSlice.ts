import { ITimeRange } from '@/models/common';
import { ICondition, IFlow, ISequence } from '@/models/ModelPage';
import PageService from '@/services/PageService';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 } from 'uuid';

import { RootState } from '../store';

export enum TypeButtonChildren {
  OA_QUERY_HIDE = 'oa.query.hide',
  OA_QUERY_SHOW = 'oa.query.show',
  POSTBACK = 'postback',
}

export type FlowState = {
  currentCard: null | TypeCard;
  flowSelected: IFlow | null;
  reCreateFlow: boolean;
  sequenceSelected: ISequence | null;
  validateFlow: IResponseValidateFlow;
};

export type IButtonChildren = {
  flow?: IFlow;
  key: string;
  nextStep: string;
  title: string;
  type: TypeButtonChildren;
};

export type IChildren = {
  attachmentId?: string;
  buttons?: IButtonChildren[];
  conditions?: ICondition[];
  delay?: number;
  expiresIn?: number;
  filename?: string;
  filetype?: string;
  filters?: any[];
  key: string;
  nextStep?: string;
  percent?: number;
  sequenceIds?: string[];
  size?: number;
  tagIds?: string[];
  thumbnailUrl?: string;
  type:
    | 'add_sequence'
    | 'add_tag'
    | 'condition'
    | 'delay'
    | 'image'
    | 'randomizer'
    | 'remove_sequence'
    | 'remove_tag'
    | 'text'
    | 'video';
  typeFilter?: 'all' | 'any';
  url?: string;
  value?: string;
};

export type IConfigFlow = {
  delay?: number;
  durationType?: KeyDurationType;
  isTimeLimit?: boolean;
  timeRange?: ITimeRange;
};

export type IResponseValidateFlow = {
  cardError?: TypeCard;
  childrenError?: IChildren;
  message?: string;
  success: boolean;
};
export type KeyDurationType = 'day' | 'hour' | 'minute' | 'second';

export type TypeCard = {
  children: IChildren[];
  config?: IConfigFlow;
  flow?: IFlow;
  key: string;
  name?: string;
  nextStep: string;
  position: { x: number; y: number };
  type: string;
};

const initialState: FlowState = {
  currentCard: null,
  flowSelected: null,
  reCreateFlow: false,
  sequenceSelected: null,
  validateFlow: {
    success: true,
  },
};

const handleParseDrafts = (drafts: TypeCard[]) => {
  const result = drafts.map((item) => {
    const parseItem = { ...item };
    if (item.type === 'condition' && item.children.length === 0) {
      parseItem.children.push({
        filters: [],
        key: v4(),
        type: 'condition',
      });
    }
    if (item.type === 'randomizer' && item.children.length === 0) {
      parseItem.children.push({
        key: v4(),
        percent: 100,
        type: 'randomizer',
      });
    }

    return parseItem;
  });

  return result;
};

export const updateCardThunk = createAsyncThunk(
  'flow/updateCard',
  async (newCard: TypeCard, { dispatch, getState }) => {
    const state = getState() as RootState;
    const { currentCard, flowSelected } = state.flow;

    if (flowSelected) {
      const newDrafts = handleParseDrafts(flowSelected.drafts);
      const indexCard = newDrafts.findIndex((item) => item.key === newCard.key);
      if (indexCard !== -1) {
        newDrafts[indexCard] = { ...newCard };
      }
      if (newCard.key === currentCard?.key) {
        dispatch(setCurrentCard(newCard));
      }
      dispatch(updateFlowSelected({ drafts: newDrafts }));
      await PageService.updateFlow(flowSelected._id, { drafts: newDrafts });
    }
  },
);

export const updateFlowThunk = createAsyncThunk(
  'flow/updateCard',
  async (newDrafts: TypeCard[], { dispatch, getState }) => {
    const state = getState() as RootState;
    const { currentCard, flowSelected } = state.flow;

    if (flowSelected) {
      const parseDrafts = handleParseDrafts(newDrafts);
      const newCurrentCard = parseDrafts.find(
        (item) => item.key === currentCard?.key,
      );
      dispatch(setCurrentCard(newCurrentCard));
      dispatch(updateFlowSelected({ drafts: parseDrafts }));
      await PageService.updateFlow(flowSelected._id, { drafts: parseDrafts });
    }
  },
);

export const flowSlice = createSlice({
  initialState,
  name: 'flow',
  reducers: {
    setCurrentCard: (state, action) => {
      state.currentCard = action.payload;

      return state;
    },
    setFlowSelected: (state, action) => {
      state.flowSelected = action.payload;

      return state;
    },
    setReCreateFlow: (state, action) => {
      state.reCreateFlow = action.payload;

      return state;
    },
    setSequenceSelected: (state, action: PayloadAction<ISequence | null>) => {
      state.sequenceSelected = action.payload;

      return state;
    },
    setValidateFlow: (state, action: PayloadAction<IResponseValidateFlow>) => {
      state.validateFlow = action.payload;

      return state;
    },
    updateDraftsFlow: (state, action) => {
      const drafts = state.flowSelected?.drafts ?? [];
      const indexCard = drafts.findIndex(
        (item) => item.key === action.payload.key,
      );
      if (indexCard !== -1) {
        drafts[indexCard] = { ...action.payload };
      }
      return state;
    },
    updateFlowSelected: (state, action) => {
      state.flowSelected = {
        ...state.flowSelected,
        ...action.payload,
      };

      return state;
    },
  },
});

export const {
  setCurrentCard,
  setFlowSelected,
  setReCreateFlow,
  setSequenceSelected,
  setValidateFlow,
  updateDraftsFlow,
  updateFlowSelected,
} = flowSlice.actions;
export default flowSlice.reducer;
