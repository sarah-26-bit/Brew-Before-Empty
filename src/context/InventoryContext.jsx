import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [notification, setNotification] = useState(null);
  const [globalCounts, setGlobalCounts] = useState({
    lowStock: 0,
    anomalies: 0,
    curseActive: false,
    curseName: '',
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification((prev) => (prev?.id === Date.now() ? null : prev));
    }, duration);
  }, []);

  const triggerGlobalRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Fetch overview quick counts for sidebar badges
  const fetchGlobalBadgeCounts = useCallback(async () => {
    try {
      const res = await api.getOverview();
      if (res?.data?.metrics) {
        setGlobalCounts({
          lowStock: res.data.metrics.lowStockCount || 0,
          anomalies: res.data.metrics.activeAnomaliesCount || 0,
          curseActive: !!res.data.curseState?.active,
          curseName: res.data.curseState?.name || '',
        });
      }
    } catch (err) {
      // Backend may be starting or unreachable; silent catch for badge poller
    }
  }, []);

  useEffect(() => {
    fetchGlobalBadgeCounts();
  }, [refreshKey, fetchGlobalBadgeCounts]);

  return (
    <InventoryContext.Provider
      value={{
        activeTab,
        setActiveTab,
        notification,
        setNotification,
        showToast,
        globalCounts,
        triggerGlobalRefresh,
        refreshKey,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}

