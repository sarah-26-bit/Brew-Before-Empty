import { SupabaseService } from '../services/supabaseService.js';
import { getDatabase, saveDatabase } from '../server/db.js';
import { QueryPromise } from './QueryPromise.js';

export class Ingredient {
  constructor(data = {}) {
    this._id = data._id || data.id || `prod-${Date.now()}`;
    this.id = this._id;
    this.name = data.name || '';
    this.description = data.description || '';
    this.category = data.category || 'General Reagents';
    this.currentStock = Number(data.currentStock ?? data.quantity ?? 0);
    this.unit = data.unit || 'drams';
    this.minThreshold = Number(data.minThreshold ?? data.minimum_stock ?? 20);
    this.costPerUnit = Number(data.costPerUnit ?? data.cost_per_unit ?? 10.0);
    this.leadTimeDays = Number(data.leadTimeDays ?? data.lead_time_days ?? 3);
    this.supplier = data.supplier || 'Alchemical Guild';
    this.purity = data.purity || '98.5%';
    this.rarity = data.rarity || 'Common';
    this.dailyConsumption = Number(data.dailyConsumption ?? data.daily_consumption ?? 5.0);
  }

  async save() {
    const db = getDatabase();
    const idx = (db.ingredients || []).findIndex(i => (i.id === this.id || i._id === this.id));
    if (idx >= 0) {
      db.ingredients[idx] = { ...this };
    } else {
      if (!db.ingredients) db.ingredients = [];
      db.ingredients.push({ ...this });
    }
    saveDatabase(db);

    if (SupabaseService.isConnected()) {
      await SupabaseService.upsertProduct(this);
    }
    return this;
  }

  static find(query = {}) {
    return new QueryPromise(async () => {
      const db = getDatabase();
      let list = (db.ingredients || []).map(i => new Ingredient(i));

      if (query.category && query.category !== 'ALL') {
        list = list.filter(i => i.category === query.category);
      }
      if (query.name) {
        const regex = query.name.$regex ? new RegExp(query.name.$regex, query.name.$options || 'i') : null;
        if (regex) list = list.filter(i => regex.test(i.name));
      }
      return list;
    });
  }

  static async findById(id) {
    const db = getDatabase();
    const raw = (db.ingredients || []).find(i => (i.id === id || i._id === id));
    return raw ? new Ingredient(raw) : null;
  }

  static async findByIdAndUpdate(id, updateData) {
    const ing = await this.findById(id);
    if (!ing) return null;
    Object.assign(ing, updateData);
    await ing.save();
    return ing;
  }

  static async findOneAndUpdate(filter, update, options = {}) {
    const id = filter._id || filter.id;
    let ing = id ? await this.findById(id) : null;
    if (!ing && filter.name) {
      const db = getDatabase();
      const raw = (db.ingredients || []).find(i => i.name === filter.name);
      if (raw) ing = new Ingredient(raw);
    }
    if (!ing) return null;

    if (update.$inc) {
      for (const [key, val] of Object.entries(update.$inc)) {
        ing[key] = (ing[key] || 0) + val;
      }
    }
    if (update.$set) {
      Object.assign(ing, update.$set);
    }
    await ing.save();
    return ing;
  }

  static async findByIdAndDelete(id) {
    const db = getDatabase();
    db.ingredients = (db.ingredients || []).filter(i => (i.id !== id && i._id !== id));
    saveDatabase(db);

    if (SupabaseService.isConnected()) {
      await SupabaseService.deleteProduct(id);
    }
    return { success: true };
  }

  static async countDocuments() {
    const db = getDatabase();
    return (db.ingredients || []).length;
  }

  static async distinct(field) {
    const db = getDatabase();
    const values = (db.ingredients || []).map(i => i[field]).filter(Boolean);
    return [...new Set(values)];
  }
}

export default Ingredient;
