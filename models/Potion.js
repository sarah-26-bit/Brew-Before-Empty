import { getDatabase } from '../server/db.js';
import { QueryPromise } from './QueryPromise.js';

export class Potion {
  constructor(data = {}) {
    this._id = data._id || data.id || `pot-${Date.now()}`;
    this.id = this._id;
    this.name = data.name || '';
    this.tier = data.tier || 'Tier II Adept';
    this.price = Number(data.price || 50);
    this.description = data.description || '';
    this.recipe = (data.recipe || []).map(r => ({
      ...r,
      ingredient: r.ingredient || r.productId || r.ingredientId || r.id
    }));
  }

  static find(query = {}) {
    return new QueryPromise(async () => {
      const db = getDatabase();
      return (db.potions || []).map(p => new Potion(p));
    });
  }

  static async findById(id) {
    const db = getDatabase();
    const raw = (db.potions || []).find(p => (p.id === id || p._id === id));
    return raw ? new Potion(raw) : null;
  }

  static async findOne(query = {}) {
    const db = getDatabase();
    if (query.name) {
      const match = (db.potions || []).find(p => 
        query.name.test ? query.name.test(p.name) : p.name.toLowerCase() === String(query.name).toLowerCase()
      );
      return match ? new Potion(match) : null;
    }
    return null;
  }
}

export default Potion;
