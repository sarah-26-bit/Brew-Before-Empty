import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const memoryStore: Record<string, string> = {};

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS !== 'web' && await SecureStore.isAvailableAsync()) {
        return await SecureStore.getItemAsync(key);
      }
      return memoryStore[key] || null;
    } catch {
      return memoryStore[key] || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS !== 'web' && await SecureStore.isAvailableAsync()) {
        await SecureStore.setItemAsync(key, value);
      } else {
        memoryStore[key] = value;
      }
    } catch {
      memoryStore[key] = value;
    }
  },

  async deleteItem(key: string): Promise<void> {
    try {
      if (Platform.OS !== 'web' && await SecureStore.isAvailableAsync()) {
        await SecureStore.deleteItemAsync(key);
      } else {
        delete memoryStore[key];
      }
    } catch {
      delete memoryStore[key];
    }
  },
};

