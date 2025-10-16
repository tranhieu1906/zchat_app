import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';

import { reduxPersistStorage } from './ReduxStorage';
import { actionSlice } from './slices/actionSlice';
import { authSlice } from './slices/authSlice';
import { chatSlice } from './slices/chatSlice';
import { flowSlice } from './slices/flowSlice';
import { pageSlice } from './slices/pageSlice';

const persistConfig = {
  key: 'root',
  storage: reduxPersistStorage,
  version: 1,
  whitelist: [pageSlice.name],
};
const reducer = combineReducers({
  [actionSlice.name]: actionSlice.reducer,
  [authSlice.name]: authSlice.reducer,
  [chatSlice.name]: chatSlice.reducer,
  [flowSlice.name]: flowSlice.reducer,
  [pageSlice.name]: pageSlice.reducer,
});
const persistedReducer = persistReducer(persistConfig, reducer);

const store = configureStore({
  enhancers: (getDefaultEnhancers) => {
    const defaultEnhancers = getDefaultEnhancers();
    if (process.env.EXPO_PUBLIC_NODE_ENV === 'development') {
      return [...defaultEnhancers] as any;
    }
    return defaultEnhancers;
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  reducer: persistedReducer,
});
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
