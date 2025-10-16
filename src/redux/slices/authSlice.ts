import { IUser } from '@/models/ModelUser';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuthState = {
  authState: boolean;
  currentMember: null | Partial<IUser>;
};

const initialState: AuthState = {
  authState: false,
  currentMember: null,
};

export const authSlice = createSlice({
  initialState,
  name: 'auth',
  reducers: {
    setAuthState: (state, action) => {
      state.authState = action.payload;

      return state;
    },
    setCurrentMember: (state, action: PayloadAction<null | Partial<IUser>>) => {
      state.currentMember = action.payload;

      return state;
    },
  },
});

export const { setAuthState, setCurrentMember } = authSlice.actions;
export default authSlice.reducer;
