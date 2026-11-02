import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const api = {
  // Health & Overview
  getHealth: () => apiClient.get('/health'),
  getOverview: () => apiClient.get('/overview'),

  // Ingredients (CRUD)
  getIngredients: () => apiClient.get('/ingredients'),
  addIngredient: (data) => apiClient.post('/ingredients', data),
  updateIngredient: (id, data) => apiClient.put(`/ingredients/${id}`, data),
  deleteIngredient: (id) => apiClient.delete(`/ingredients/${id}`),

  // Potions
  getPotions: () => apiClient.get('/potions'),

  // Sales & Transactions
  getSales: () => apiClient.get('/sales'),
  recordSale: (data) => apiClient.post('/sales', data),

  // Prophecy AI & Spikes
  getProphecy: () => apiClient.get('/prophecy'),
  simulateSpike: (spikeData) => apiClient.post('/prophecy/simulate-spike', spikeData),

  // Restock Spell
  getRestockRecommendations: () => apiClient.get('/restock'),
  executeRestock: (payload) => apiClient.post('/restock/execute', payload),

  // Strange Happenings / Anomalies
  getAnomalies: () => apiClient.get('/anomalies'),
  resolveAnomaly: (id, note) => apiClient.post(`/anomalies/${id}/resolve`, { note }),
  addAnomaly: (data) => apiClient.post('/anomalies', data),

  // Crystal Ball Analytics
  getAnalytics: () => apiClient.get('/analytics'),

  // Midnight Curse
  getCurseState: () => apiClient.get('/curse'),
  toggleCurse: (payload) => apiClient.post('/curse/toggle', payload),

  // Settings
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (data) => apiClient.put('/settings', data),
  resetDatabase: () => apiClient.post('/settings/reset'),

  // SPELLSTOCK Intelligence Chatbot
  sendChatMessage: (message, history = []) => apiClient.post('/chat', { message, history }),
};

export default apiClient;

