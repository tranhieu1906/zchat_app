import * as SecureStore from 'expo-secure-store';

export const reduxPersistStorage = {
  getItem: (key: string) => {
    const value = SecureStore.getItem(key);
    return Promise.resolve(value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
    return;
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItem(key, value);
    return Promise.resolve(true);
  },
};
