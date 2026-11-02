import { SupabaseService } from '../services/supabaseService.js';
import { getDatabase, saveDatabase } from '../server/db.js';
import { QueryPromise } from './QueryPromise.js';

export class StockMovement {
  constructor(data = {}) {
    this._id = data._id || data.id || `mov-${Date.now()}`;
    this.id = this._id;
    this.productId = data.productId || data.product_id || data.ingredient;
    this.ingredient = this.productId;
    this.ingredientName = data.ingredientName || '';
    this.movementType = data.movementType || data.movement_type || data.type || 'adjustment';
    this.type = this.movementType;
    this.quantityChange = Number(data.quantityChange ?? data.quantity ?? 0);
    this.unit = data.unit || 'units';
    this.previousStock = Number(data.previousStock ?? data.previous_quantity ?? 0);
    this.newStock = Number(data.newStock ?? data.new_quantity ?? 0);
    this.reason = data.reason || '';
    this.referenceId = data.referenceId || data.reference_id || '';
    this.timestamp = data.timestamp || data.created_at || new Date().toISOString();
  }

  static async create(data) {
    const movement = new StockMovement(data);
    const db = getDatabase();
    if (!db.stockMovements) db.stockMovements = [];
    db.stockMovements.unshift({ ...movement });
    saveDatabase(db);

    if (SupabaseService.isConnected()) {
      await SupabaseService.logStockMovement({
        productId: movement.productId,
        movementType: movement.movementType,
        quantity: movement.quantityChange,
        previousQuantity: movement.previousStock,
        newQuantity: movement.newStock,
        reason: movement.reason,
        referenceId: movement.referenceId
      });
    }

    return movement;
  }

  static find(query = {}) {
    return new QueryPromise(async () => {
      const db = getDatabase();
      let list = (db.stockMovements || []).map(m => new StockMovement(m));
      if (query.ingredient) {
        list = list.filter(m => m.ingredient === query.ingredient || m.productId === query.ingredient);
      }
      return list;
    });
  }

  static async aggregate(pipeline = []) {
    const db = getDatabase();
    const movements = (db.stockMovements || []).map(m => new StockMovement(m));

    // Check pipeline
    const groupStage = pipeline.find(s => s.$group);
    if (!groupStage) return movements;

    const groupField = groupStage.$group._id;

    if (groupField === '$type') {
      const typeMap = {};
      for (const m of movements) {
        const t = m.type || m.movementType;
        if (!typeMap[t]) typeMap[t] = { _id: t, totalQuantity: 0, count: 0 };
        typeMap[t].totalQuantity += Math.abs(m.quantityChange);
        typeMap[t].count += 1;
      }
      return Object.values(typeMap);
    }

    if (groupField === '$ingredient') {
      const ingMap = {};
      for (const m of movements) {
        const id = m.ingredient || m.productId;
        if (!ingMap[id]) {
          ingMap[id] = {
            _id: id,
            ingredientName: m.ingredientName,
            unit: m.unit,
            totalUnitsConsumed: 0,
            dispensationCount: 0
          };
        }
        ingMap[id].totalUnitsConsumed += Math.abs(m.quantityChange);
        ingMap[id].dispensationCount += 1;
      }
      return Object.values(ingMap).sort((a, b) => b.totalUnitsConsumed - a.totalUnitsConsumed).slice(0, 8);
    }

    return [];
  }
}

export default StockMovement;
