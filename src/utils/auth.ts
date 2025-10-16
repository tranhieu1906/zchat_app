import * as SecureStore from 'expo-secure-store';

export const TOKEN_KEY = 'user_token';
export const USER_KEY = 'user_info';

export const saveAuth = async (token: string, user: any) => {
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEY, token),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
  ]);
};

export const loadAuth = () => {
  const [token, userJson] = [
    SecureStore.getItem(TOKEN_KEY),
    SecureStore.getItem(USER_KEY),
  ];
  const currentUser = userJson ? JSON.parse(userJson) : undefined;
  return { currentUser, token };
};

export const clearAuth = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
};
