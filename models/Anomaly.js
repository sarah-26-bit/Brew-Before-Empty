import { SupabaseService } from '../services/supabaseService.js';
import { getDatabase, saveDatabase } from '../server/db.js';
import { QueryPromise } from './QueryPromise.js';

export class Anomaly {
  constructor(data = {}) {
    this._id = data._id || data.id || `anom-${Date.now()}`;
    this.id = this._id;
    this.title = data.title || '';
    this.ingredient = data.ingredient || data.ingredientId || data.productId;
    this.ingredientId = this.ingredient;
    this.ingredientName = data.ingredientName || data.productName || '';
    this.type = data.type || data.anomalyType || 'CONSUMPTION_SPIKE';
    this.anomalyType = this.type;
    this.severity = data.severity || 'MEDIUM';
    this.zScore = data.zScore || data.z_score || 0;
    this.observedValue = data.observedValue || data.observed_value || 0;
    this.expectedValue = data.expectedValue || data.expected_value || 0;
    this.unit = data.unit || 'units';
    this.description = data.description || '';
    this.explanation = data.explanation || this.description;
    this.recommendedAction = data.recommendedAction || data.recommended_action || '';
    this.status = data.status || 'ACTIVE';
    this.createdAt = data.createdAt || data.detectedAt || new Date().toISOString();
    this.detectedAt = this.createdAt;
  }

  static find(query = {}) {
    return new QueryPromise(async () => {
      const db = getDatabase();
      let list = (db.anomalies || []).map(a => new Anomaly(a));
      if (query.status) {
        list = list.filter(a => a.status === query.status);
      }
      if (query.ingredient) {
        list = list.filter(a => a.ingredient === query.ingredient);
      }
      return list;
    });
  }

  static async findOne(query = {}) {
    const list = await this.find(query);
    return list.length > 0 ? list[0] : null;
  }

  static async create(data) {
    const anom = new Anomaly(data);
    const db = getDatabase();
    if (!db.anomalies) db.anomalies = [];
    db.anomalies.unshift({ ...anom });
    saveDatabase(db);
    return anom;
  }

  static async findByIdAndUpdate(id, updates) {
    const db = getDatabase();
    const idx = (db.anomalies || []).findIndex(a => a.id === id || a._id === id);
    if (idx >= 0) {
      db.anomalies[idx] = { ...db.anomalies[idx], ...updates };
      saveDatabase(db);
      if (SupabaseService.isConnected()) {
        await SupabaseService.resolveAnomaly(id, updates.note || updates.description);
      }
      return new Anomaly(db.anomalies[idx]);
    }
    return null;
  }
}

export default Anomaly;
