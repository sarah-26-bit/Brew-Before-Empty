import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase.js';

export class SupabaseService {
  /**
   * Check if Supabase connection is active
   */
  static isConnected() {
    return isSupabaseConfigured();
  }

  /**
   * Fetch all products & current stock levels from Supabase
   * Supports product_inventory_view, products+inventory join, and fallback ingredients
   */
  static async getProducts() {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    // 1. Try view first
    try {
      const { data: viewData, error: viewError } = await supabase
        .from('product_inventory_view')
        .select('*')
        .order('name');

      if (!viewError && viewData && viewData.length > 0) {
        return viewData.map(row => ({
          id: row.id,
          name: row.name,
          description: row.description,
          category: row.category,
          currentStock: Number(row.current_stock ?? row.quantity ?? 0),
          unit: row.unit,
          minThreshold: Number(row.minimum_stock ?? row.min_threshold ?? 20),
          costPerUnit: Number(row.cost_per_unit ?? 10),
          leadTimeDays: Number(row.lead_time_days ?? 3),
          supplier: row.supplier,
          purity: row.purity,
          rarity: row.rarity,
          dailyConsumption: Number(row.daily_consumption ?? 5),
          imageUrl: row.image_url,
          lastUpdated: row.inventory_updated_at || row.created_at
        }));
      }
    } catch (e) {
      // Continue to next strategy
    }

    // 2. Direct table join: products with inventory
    try {
      const { data: prods, error: prodErr } = await supabase
        .from('products')
        .select(`
          *,
          inventory (quantity, updated_at)
        `)
        .order('name');

      if (!prodErr && prods && prods.length > 0) {
        return prods.map(p => {
          const inv = Array.isArray(p.inventory) ? p.inventory[0] : p.inventory;
          return {
            id: p.id,
            name: p.name,
            description: p.description,
            category: p.category,
            currentStock: Number(inv?.quantity ?? 0),
            unit: p.unit,
            minThreshold: Number(p.minimum_stock ?? 20),
            costPerUnit: Number(p.cost_per_unit ?? 10),
            leadTimeDays: Number(p.lead_time_days ?? 3),
            supplier: p.supplier,
            purity: p.purity,
            rarity: p.rarity,
            dailyConsumption: Number(p.daily_consumption ?? 5),
            imageUrl: p.image_url,
            lastUpdated: inv?.updated_at || p.created_at
          };
        });
      }
    } catch (e) {
      // Continue to next strategy
    }

    // 3. Fallback: ingredients table
    try {
      const { data: ingData, error: ingError } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (!ingError && ingData) {
        return ingData.map(row => ({
          id: row.id,
          name: row.name,
          category: row.category,
          currentStock: Number(row.current_stock ?? 0),
          unit: row.unit,
          minThreshold: Number(row.min_threshold ?? row.minimum_stock ?? 20),
          costPerUnit: Number(row.cost_per_unit ?? 10),
          leadTimeDays: Number(row.lead_time_days ?? 3),
          supplier: row.supplier,
          purity: row.purity,
          rarity: row.rarity,
          dailyConsumption: Number(row.daily_consumption ?? 5),
          imageUrl: row.image_url,
          lastUpdated: row.updated_at
        }));
      }
    } catch (e) {
      console.warn('Supabase reagent fetch warning:', e.message);
    }

    return null;
  }

  /**
   * Alias for backward compatibility with existing code
   */
  static async getIngredients() {
    return this.getProducts();
  }

  /**
   * Insert or update product and its inventory quantity in Supabase
   */
  static async upsertProduct(prod) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const prodPayload = {
      id: prod.id,
      name: prod.name,
      description: prod.description || `${prod.name} (${prod.category})`,
      category: prod.category,
      unit: prod.unit,
      minimum_stock: prod.minThreshold ?? prod.minimum_stock ?? 20,
      cost_per_unit: prod.costPerUnit ?? prod.cost_per_unit ?? 10,
      lead_time_days: prod.leadTimeDays ?? prod.lead_time_days ?? 3,
      supplier: prod.supplier,
      purity: prod.purity,
      rarity: prod.rarity,
      daily_consumption: prod.dailyConsumption ?? prod.daily_consumption ?? 5
    };

    // 1. Upsert into products
    try {
      await supabase.from('products').upsert(prodPayload, { onConflict: 'id' });
    } catch (e) {}

    // 2. Upsert into inventory
    if (prod.currentStock !== undefined) {
      try {
        await supabase.from('inventory').upsert({
          product_id: prod.id,
          quantity: prod.currentStock,
          updated_at: new Date().toISOString()
        }, { onConflict: 'product_id' });
      } catch (e) {}
    }

    // 3. Keep ingredients table in sync if it exists
    try {
      await supabase.from('ingredients').upsert({
        id: prod.id,
        name: prod.name,
        category: prod.category,
        current_stock: prod.currentStock,
        unit: prod.unit,
        min_threshold: prod.minThreshold ?? prod.minimum_stock ?? 20,
        cost_per_unit: prod.costPerUnit,
        lead_time_days: prod.leadTimeDays,
        supplier: prod.supplier,
        purity: prod.purity,
        rarity: prod.rarity,
        daily_consumption: prod.dailyConsumption,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    } catch (e) {}

    return prod;
  }

  /**
   * Alias
   */
  static async upsertIngredient(ing) {
    return this.upsertProduct(ing);
  }

  /**
   * Delete product/ingredient from Supabase
   */
  static async deleteProduct(id) {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      await supabase.from('inventory').delete().eq('product_id', id);
      await supabase.from('products').delete().eq('id', id);
      await supabase.from('ingredients').delete().eq('id', id);
      return true;
    } catch (err) {
      console.warn('Supabase delete error:', err.message);
      return false;
    }
  }

  /**
   * Alias
   */
  static async deleteIngredient(id) {
    return this.deleteProduct(id);
  }

  /**
   * Log a stock movement
   */
  static async logStockMovement({ productId, movementType, quantity, previousQuantity, newQuantity, reason, referenceId }) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase.from('stock_movements').insert({
        product_id: productId,
        movement_type: movementType,
        quantity,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        reason,
        reference_id: referenceId,
        created_at: new Date().toISOString()
      }).select().single();

      return data;
    } catch (err) {
      console.warn('Supabase logStockMovement error:', err.message);
      return null;
    }
  }

  /**
   * Fetch stock movements
   */
  static async getStockMovements(productId = null, limit = 50) {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      let query = supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;
      return error ? [] : data;
    } catch (err) {
      return [];
    }
  }

  /**
   * Fetch all potions
   */
  static async getPotions() {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('potions')
      .select('*')
      .order('price', { ascending: true });

    if (error) return null;

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      tier: row.tier,
      price: Number(row.price),
      description: row.description,
      recipe: row.recipe || []
    }));
  }

  /**
   * Fetch sales orders
   */
  static async getSales(limit = 100) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return null;

    return (data || []).map(row => ({
      id: row.id,
      potionId: row.potion_id,
      potionName: row.potion_name,
      quantity: row.quantity,
      totalGold: Number(row.total_gold),
      customer: row.customer,
      guild: row.guild,
      ingredientsDeducted: row.ingredients_deducted || [],
      timestamp: row.created_at
    }));
  }

  /**
   * Record sale order and log stock movements
   */
  static async recordSale(sale) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const payload = {
      id: sale.id || `TXN-${Date.now()}`,
      potion_id: sale.potionId,
      potion_name: sale.potionName,
      quantity: sale.quantity,
      total_gold: sale.totalGold,
      customer: sale.customer || 'Anonymous Mage',
      guild: sale.guild || 'Independent',
      ingredients_deducted: sale.ingredientsDeducted || [],
      created_at: sale.timestamp || new Date().toISOString()
    };

    const { data, error } = await supabase.from('sales').insert(payload).select().single();
    if (error) {
      console.warn('Supabase recordSale error:', error.message);
      return null;
    }

    // Deduct from inventory and log stock movements
    if (sale.ingredientsDeducted && Array.isArray(sale.ingredientsDeducted)) {
      for (const item of sale.ingredientsDeducted) {
        if (item.productId || item.id) {
          const pId = item.productId || item.id;
          const deductQty = item.amount || item.quantityDeducted || 0;
          try {
            // Fetch current quantity
            const { data: currentInv } = await supabase
              .from('inventory')
              .select('quantity')
              .eq('product_id', pId)
              .maybeSingle();

            const prevQty = Number(currentInv?.quantity ?? 0);
            const newQty = Math.max(0, prevQty - deductQty);

            await supabase
              .from('inventory')
              .update({ quantity: newQty, updated_at: new Date().toISOString() })
              .eq('product_id', pId);

            await this.logStockMovement({
              productId: pId,
              movementType: 'sale',
              quantity: -deductQty,
              previousQuantity: prevQty,
              newQuantity: newQty,
              reason: `Dispensed in sale order ${payload.id}`,
              referenceId: payload.id
            });
          } catch (e) {
            console.warn('Error adjusting inventory for sale:', e.message);
          }
        }
      }
    }

    return data;
  }

  /**
   * Fetch anomalies
   */
  static async getAnomalies() {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('anomalies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return null;

    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      ingredientId: row.product_id,
      ingredientName: row.product_name,
      severity: row.severity,
      detectedAt: row.created_at,
      description: row.description,
      anomalyType: row.anomaly_type,
      status: row.status,
      recommendedAction: row.recommended_action
    }));
  }

  /**
   * Resolve an anomaly
   */
  static async resolveAnomaly(id, note = '') {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('anomalies')
      .update({
        status: 'RESOLVED',
        resolved_at: new Date().toISOString(),
        description: note ? `${note}` : undefined
      })
      .eq('id', id)
      .select()
      .single();

    return error ? null : data;
  }
}
