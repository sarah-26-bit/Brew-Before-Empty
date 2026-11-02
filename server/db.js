import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isSupabaseConfigured, getSupabaseClient } from '../config/supabase.js';
import { SupabaseService } from '../services/supabaseService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'data', 'db.json');
const INITIAL_FILE = path.join(__dirname, 'data', 'initialData.json');

let inMemoryCache = null;
let supabaseSynced = false;

export function getDatabase() {
  if (inMemoryCache) return inMemoryCache;

  if (!fs.existsSync(DB_FILE)) {
    const initialData = fs.readFileSync(INITIAL_FILE, 'utf-8');
    fs.writeFileSync(DB_FILE, initialData, 'utf-8');
    inMemoryCache = JSON.parse(initialData);
    return inMemoryCache;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    inMemoryCache = JSON.parse(raw);
    return inMemoryCache;
  } catch (err) {
    const initialData = fs.readFileSync(INITIAL_FILE, 'utf-8');
    fs.writeFileSync(DB_FILE, initialData, 'utf-8');
    inMemoryCache = JSON.parse(initialData);
    return inMemoryCache;
  }
}

export function saveDatabase(data) {
  inMemoryCache = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Local DB write notice:', err.message);
  }

  // If Supabase is configured, sync to Supabase tables
  if (isSupabaseConfigured()) {
    syncToSupabase(data).catch(err => {
      console.warn('⚠️ Supabase background sync notice:', err.message);
    });
  }

  return data;
}

export function resetDatabase() {
  const initialData = fs.readFileSync(INITIAL_FILE, 'utf-8');
  fs.writeFileSync(DB_FILE, initialData, 'utf-8');
  inMemoryCache = JSON.parse(initialData);

  if (isSupabaseConfigured()) {
    syncToSupabase(inMemoryCache).catch(err => {
      console.warn('⚠️ Supabase reset sync notice:', err.message);
    });
  }

  return inMemoryCache;
}

/**
 * Sync in-memory database to Supabase PostgreSQL (Products, Inventory, Potions, Sales, Anomalies, Settings)
 */
async function syncToSupabase(data) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    // 1. Sync Products & Inventory
    if (data.ingredients && Array.isArray(data.ingredients)) {
      for (const ing of data.ingredients) {
        await SupabaseService.upsertProduct(ing);
      }
    }

    // 2. Sync Curse state
    if (data.curseState) {
      await supabase.from('curse_state').upsert({
        id: 'active_curse',
        name: data.curseState.name,
        active: data.curseState.active,
        multiplier: data.curseState.multiplier,
        curse_level: data.curseState.curseLevel,
        description: data.curseState.description,
        affected_products: data.curseState.affectedIngredients || []
      }, { onConflict: 'id' });
    }

    // 3. Sync Settings
    if (data.settings) {
      await supabase.from('settings').upsert({
        id: 'global_settings',
        shop_name: data.settings.shopName,
        alchemist_in_charge: data.settings.alchemistInCharge,
        currency_symbol: data.settings.currencySymbol,
        low_stock_warning_threshold: data.settings.lowStockWarningThreshold,
        auto_restock_threshold_days: data.settings.autoRestockThresholdDays,
        prophecy_horizon_days: data.settings.prophecyHorizonDays,
        sound_effects_enabled: data.settings.soundEffectsEnabled,
        haptic_runes: data.settings.hapticRunes,
        auto_warding_defense: data.settings.autoWardingDefense
      }, { onConflict: 'id' });
    }
  } catch (err) {
    console.warn('Supabase sync notice:', err.message);
  }
}

/**
 * Initialize connection and pull initial state from Supabase if available
 */
export async function initSupabaseData() {
  if (!isSupabaseConfigured() || supabaseSynced) return;

  try {
    const remoteProducts = await SupabaseService.getProducts();

    if (remoteProducts && remoteProducts.length > 0) {
      const db = getDatabase();
      db.ingredients = remoteProducts;

      // Also pull remote potions, sales, anomalies
      const remotePotions = await SupabaseService.getPotions();
      if (remotePotions && remotePotions.length > 0) {
        db.potions = remotePotions;
      }

      const remoteSales = await SupabaseService.getSales();
      if (remoteSales && remoteSales.length > 0) {
        db.sales = remoteSales;
      }

      const remoteAnomalies = await SupabaseService.getAnomalies();
      if (remoteAnomalies && remoteAnomalies.length > 0) {
        db.anomalies = remoteAnomalies;
      }

      inMemoryCache = db;
      supabaseSynced = true;
      console.log(`✨ Synced ${remoteProducts.length} items from Supabase cloud database.`);
    } else {
      // Supabase is empty, seed it with initial alchemical ledger
      console.log('⚡ Supabase database is empty. Auto-seeding initial alchemical ledger...');
      const db = getDatabase();
      await syncToSupabase(db);
      supabaseSynced = true;
    }
  } catch (err) {
    console.warn('Notice: Could not load initial state from Supabase:', err.message);
  }
}
