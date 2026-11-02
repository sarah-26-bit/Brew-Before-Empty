import { SupabaseService } from '../services/supabaseService.js';
import { getDatabase, saveDatabase } from '../server/db.js';
import { QueryPromise } from './QueryPromise.js';

export class Sale {
  constructor(data = {}) {
    this._id = data._id || data.id || `TXN-${Date.now()}`;
    this.id = this._id;
    this.saleId = this.id;
    this.potion = data.potion || data.potionId;
    this.potionId = this.potion;
    this.potionName = data.potionName || '';
    this.quantity = Number(data.quantity || 1);
    this.totalPrice = Number(data.totalPrice ?? data.totalGold ?? 0);
    this.totalGold = this.totalPrice;
    this.customer = data.customer || 'Anonymous Mage';
    this.guild = data.guild || 'Independent';
    this.consumedIngredients = data.consumedIngredients || data.ingredientsDeducted || [];
    this.ingredientsDeducted = this.consumedIngredients;
    this.timestamp = data.timestamp || data.createdAt || new Date().toISOString();
  }

  async save() {
    const db = getDatabase();
    if (!db.sales) db.sales = [];
    const idx = db.sales.findIndex(s => s.id === this.id || s._id === this.id);
    if (idx >= 0) {
      db.sales[idx] = { ...this };
    } else {
      db.sales.unshift({ ...this });
    }
    saveDatabase(db);

    if (SupabaseService.isConnected()) {
      await SupabaseService.recordSale(this);
    }
    return this;
  }

  static async create(data) {
    const sale = new Sale(data);
    await sale.save();
    return sale;
  }

  static find(query = {}) {
    return new QueryPromise(async () => {
      const db = getDatabase();
      return (db.sales || []).map(s => new Sale(s));
    });
  }

  static async countDocuments(query = {}) {
    const db = getDatabase();
    return (db.sales || []).length;
  }

  static async aggregate(pipeline = []) {
    const db = getDatabase();
    // Simple aggregator for total sales
    const totalGold = (db.sales || []).reduce((acc, s) => acc + (s.totalGold || s.totalPrice || 0), 0);
    const count = (db.sales || []).length;
    return [{ totalRevenue: totalGold, totalCount: count }];
  }
}

export default Sale;
