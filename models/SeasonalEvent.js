import { getDatabase, saveDatabase } from '../server/db.js';
import { QueryPromise } from './QueryPromise.js';

export class SeasonalEvent {
  constructor(data = {}) {
    this._id = data._id || data.id || 'active_curse';
    this.id = this._id;
    this.name = data.name || 'Blood Moon Festival Rush';
    this.multiplier = Number(data.multiplier || 1.75);
    this.isActive = data.isActive ?? data.active ?? true;
    this.description = data.description || '';
    this.affectedIngredients = data.affectedIngredients || [];
    this.startDate = data.startDate || new Date(Date.now() - 7 * 86400000);
    this.endDate = data.endDate || new Date(Date.now() + 7 * 86400000);
  }

  isCurrentlyActive() {
    return Boolean(this.isActive);
  }

  async save() {
    const db = getDatabase();
    db.curseState = {
      ...db.curseState,
      name: this.name,
      multiplier: this.multiplier,
      active: this.isActive,
      description: this.description,
      affectedIngredients: this.affectedIngredients
    };
    saveDatabase(db);
    return this;
  }

  static find(query = {}) {
    return new QueryPromise(async () => {
      const db = getDatabase();
      if (db.curseState) {
        return [
          new SeasonalEvent({
            id: 'active_curse',
            name: db.curseState.name,
            multiplier: db.curseState.multiplier,
            isActive: db.curseState.active,
            description: db.curseState.description,
            affectedIngredients: db.curseState.affectedIngredients || []
          })
        ];
      }
      return [];
    });
  }
}

export default SeasonalEvent;
