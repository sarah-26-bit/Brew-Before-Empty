import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';
import { storage } from './storage';

// Default host resolution:
// - Android Emulator uses 10.0.2.2 (and falls back to http://localhost:5001 via adb reverse)
// - iOS Simulator and Web use localhost:5001
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';
const API_HOST_KEY = 'BREW_API_BASE_URL';

let currentBaseUrl = `${DEFAULT_HOST}/api`;

const apiClient: AxiosInstance = axios.create({
  baseURL: currentBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
});

// Initialize persisted custom host if any
storage.getItem(API_HOST_KEY).then((saved) => {
  if (saved) {
    currentBaseUrl = saved;
    apiClient.defaults.baseURL = saved;
  }
});

// Auto-failover interceptor for Android emulator (10.0.2.2 <-> localhost:5001)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (Platform.OS === 'android') {
      const is10022 = originalRequest.baseURL?.includes('10.0.2.2');
      const isLocalhost = originalRequest.baseURL?.includes('localhost') || originalRequest.baseURL?.includes('127.0.0.1');

      if (is10022) {
        originalRequest._retry = true;
        const altUrl = 'http://localhost:5001/api';
        currentBaseUrl = altUrl;
        apiClient.defaults.baseURL = altUrl;
        originalRequest.baseURL = altUrl;
        try {
          return await axios(originalRequest);
        } catch (retryErr) {
          return Promise.reject(retryErr);
        }
      } else if (isLocalhost) {
        originalRequest._retry = true;
        const altUrl = 'http://10.0.2.2:5001/api';
        currentBaseUrl = altUrl;
        apiClient.defaults.baseURL = altUrl;
        originalRequest.baseURL = altUrl;
        try {
          return await axios(originalRequest);
        } catch (retryErr) {
          return Promise.reject(retryErr);
        }
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  getBaseUrl(): string {
    return apiClient.defaults.baseURL || currentBaseUrl;
  },

  async setBaseUrl(newUrl: string): Promise<void> {
    const formatted = newUrl.endsWith('/api') ? newUrl : `${newUrl.replace(/\/+$/, '')}/api`;
    currentBaseUrl = formatted;
    apiClient.defaults.baseURL = formatted;
    await storage.setItem(API_HOST_KEY, formatted);
  },

  // Health & Overview
  getHealth: () => apiClient.get('/health'),
  getOverview: () => apiClient.get('/overview'),

  // Ingredients (Potion Pantry)
  getIngredients: () => apiClient.get('/ingredients'),
  addIngredient: (data: any) => apiClient.post('/ingredients', data),
  updateIngredient: (id: string, data: any) => apiClient.put(`/ingredients/${id}`, data),
  deleteIngredient: (id: string) => apiClient.delete(`/ingredients/${id}`),

  // Potions (Recipes)
  getPotions: () => apiClient.get('/potions'),

  // Sales & Transactions
  getSales: () => apiClient.get('/sales'),
  recordSale: (data: any) => apiClient.post('/sales', data),

  // Prophecy AI (Forecasting)
  getProphecy: () => apiClient.get('/prophecy'),
  simulateSpike: (spikeData: any) => apiClient.post('/prophecy/simulate-spike', spikeData),

  // Restock Spell (Procurement)
  getRestockRecommendations: () => apiClient.get('/restock'),
  executeRestock: (payload: any) => apiClient.post('/restock/execute', payload),

  // Strange Happenings (Anomalies)
  getAnomalies: () => apiClient.get('/anomalies'),
  resolveAnomaly: (id: string, note?: string) => apiClient.post(`/anomalies/${id}/resolve`, { note }),

  // Crystal Ball (Analytics)
  getAnalytics: () => apiClient.get('/analytics'),

  // Midnight Curse (Festival Surge)
  getCurseState: () => apiClient.get('/curse'),
  toggleCurse: (payload: any) => apiClient.post('/curse/toggle', payload),

  // Settings
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (data: any) => apiClient.put('/settings', data),
  resetDatabase: () => apiClient.post('/settings/reset'),

  // SPELLSTOCK INTELLIGENCE AI Chatbot
  sendChatMessage: (message: string, history: any[] = []) =>
    apiClient.post('/chat', { message, history }),
};

export default api;
