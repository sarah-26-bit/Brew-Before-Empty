import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../services/api';

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minThreshold: number;
  costPerUnit: number;
  supplier: string;
  purity?: string;
  rarity?: string;
  dailyConsumption: number;
  effectiveDailyConsumption?: number;
  leadTimeDays: number;
  lastUpdated?: string;
  isLowStock?: boolean;
  stockStatus: 'HEALTHY' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';
  daysRemaining?: number;
  stockoutDate?: string;
}

export interface PotionRecipeItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

export interface Potion {
  id: string;
  name: string;
  tier: string;
  category: string;
  price: number;
  description: string;
  recipe: PotionRecipeItem[];
  maxCraftable?: number;
  canBrew?: boolean;
}

export interface SaleTransaction {
  id: string;
  potionId: string;
  potionName: string;
  quantity: number;
  unitPrice: number;
  totalGold: number;
  customer: string;
  guild: string;
  timestamp: string;
  deductions: {
    ingredientId: string;
    ingredientName: string;
    deducted: number;
    unit: string;
    remaining: number;
  }[];
}

export interface Anomaly {
  id: string;
  title: string;
  ingredientId: string;
  ingredientName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  detectedAt: string;
  description: string;
  anomalyType: string;
  status: 'ACTIVE' | 'RESOLVED';
  recommendedAction: string;
  zScore?: number;
  resolutionNote?: string;
}

export interface RestockRecommendation {
  ingredientId: string;
  ingredientName: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
  supplier: string;
  leadTimeDays: number;
  costPerUnit: number;
  suggestedOrderQty: number;
  totalCost: number;
  urgency: 'IMMEDIATE' | 'HIGH' | 'MODERATE' | 'LOW';
  reason: string;
}

export interface CurseState {
  active: boolean;
  name: string;
  multiplier: number;
  description: string;
  affectedIngredients: string[];
}

export interface OverviewMetrics {
  totalStockItems: number;
  totalInventoryValue: number;
  lowStockCount: number;
  criticalStockCount: number;
  activeAnomaliesCount: number;
  totalSalesRevenue: number;
  transactionCount: number;
  curseActive: boolean;
}

interface InventoryContextType {
  ingredients: Ingredient[];
  potions: Potion[];
  sales: SaleTransaction[];
  anomalies: Anomaly[];
  curseState: CurseState;
  overview: OverviewMetrics | null;
  restockRecs: RestockRecommendation[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  loadAllData: () => Promise<void>;
  refresh: () => Promise<void>;
  addIngredient: (data: Partial<Ingredient>) => Promise<Ingredient>;
  updateIngredient: (id: string, data: Partial<Ingredient>) => Promise<Ingredient>;
  deleteIngredient: (id: string) => Promise<void>;
  quickAdjustStock: (id: string, delta: number) => Promise<void>;
  recordSale: (data: { potionId: string; quantity: number; customer: string; guild?: string }) => Promise<SaleTransaction>;
  executeRestock: (ingredientId: string, quantity: number) => Promise<any>;
  toggleCurse: (active?: boolean) => Promise<CurseState>;
  resolveAnomaly: (id: string, note?: string) => Promise<void>;
}

const defaultCurse: CurseState = {
  active: false,
  name: 'Midnight Curse',
  multiplier: 1.75,
  description: 'Blood Moon Surge increases consumption by 75%',
  affectedIngredients: ['ing-01', 'ing-03', 'ing-05'],
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [potions, setPotions] = useState<Potion[]>([]);
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [curseState, setCurseState] = useState<CurseState>(defaultCurse);
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [restockRecs, setRestockRecs] = useState<RestockRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    try {
      setError(null);
      const [
        ingRes,
        potionsRes,
        salesRes,
        anomRes,
        curseRes,
        overviewRes,
        restockRes,
      ] = await Promise.allSettled([
        api.getIngredients(),
        api.getPotions(),
        api.getSales(),
        api.getAnomalies(),
        api.getCurseState(),
        api.getOverview(),
        api.getRestockRecommendations(),
      ]);

      if (ingRes.status === 'fulfilled') setIngredients(ingRes.value.data || []);
      if (potionsRes.status === 'fulfilled') setPotions(potionsRes.value.data || []);
      if (salesRes.status === 'fulfilled') setSales(salesRes.value.data || []);
      if (anomRes.status === 'fulfilled') setAnomalies(anomRes.value.data || []);
      if (curseRes.status === 'fulfilled') setCurseState(curseRes.value.data || defaultCurse);
      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data?.metrics || null);
      if (restockRes.status === 'fulfilled') {
        const rData = restockRes.value.data;
        setRestockRecs(Array.isArray(rData) ? rData : rData?.recommendations || []);
      }
    } catch (err: any) {
      console.warn('Inventory data load error:', err.message);
      setError(err.message || 'Failed to sync with potion vault');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const addIngredient = async (data: Partial<Ingredient>): Promise<Ingredient> => {
    const res = await api.addIngredient(data);
    await loadAllData();
    return res.data;
  };

  const updateIngredient = async (id: string, data: Partial<Ingredient>): Promise<Ingredient> => {
    const res = await api.updateIngredient(id, data);
    await loadAllData();
    return res.data;
  };

  const deleteIngredient = async (id: string): Promise<void> => {
    await api.deleteIngredient(id);
    await loadAllData();
  };

  const quickAdjustStock = async (id: string, delta: number): Promise<void> => {
    const current = ingredients.find((i) => i.id === id);
    if (!current) return;
    const newStock = Math.max(0, current.currentStock + delta);
    await api.updateIngredient(id, { currentStock: newStock });
    await loadAllData();
  };

  const recordSale = async (data: { potionId: string; quantity: number; customer: string; guild?: string }): Promise<SaleTransaction> => {
    const res = await api.recordSale(data);
    await loadAllData();
    return res.data.transaction;
  };

  const executeRestock = async (ingredientId: string, quantity: number): Promise<any> => {
    const res = await api.executeRestock({ ingredientId, quantity });
    await loadAllData();
    return res.data;
  };

  const toggleCurse = async (active?: boolean): Promise<CurseState> => {
    const targetState = active !== undefined ? active : !curseState.active;
    const res = await api.toggleCurse({ active: targetState });
    setCurseState(res.data);
    await loadAllData();
    return res.data;
  };

  const resolveAnomaly = async (id: string, note?: string): Promise<void> => {
    await api.resolveAnomaly(id, note || 'Resolved by Mobile Alchemist');
    await loadAllData();
  };

  return (
    <InventoryContext.Provider
      value={{
        ingredients,
        potions,
        sales,
        anomalies,
        curseState,
        overview,
        restockRecs,
        loading,
        refreshing,
        error,
        loadAllData,
        refresh,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        quickAdjustStock,
        recordSale,
        executeRestock,
        toggleCurse,
        resolveAnomaly,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

