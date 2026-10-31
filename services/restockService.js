import { Ingredient } from '../models/Ingredient.js';
import { ProphecyService } from './prophecyService.js';
import { StockMovement } from '../models/StockMovement.js';

export class RestockService {
  /**
   * Calculate actionable restocking recommendations
   * Considers:
   * 1. Forecast demand over lead time (Lead Time Demand = Lead Time Days * Daily Forecast)
   * 2. Safety stock buffer (typically minThreshold or statistical buffer)
   * 3. Current stock level
   * 4. Target Reorder Point (ROP) = Lead Time Demand + Safety Stock
   * 5. Recommended Reorder Quantity (EOQ/Target replenishment)
   */
  static async calculateRestockRecommendations() {
    const ingredients = await Ingredient.find().sort({ name: 1 });
    const recommendations = [];

    for (const ingredient of ingredients) {
      // Get single forecast with 7-day projection
      const forecast = await ProphecyService.forecastIngredientDemand(ingredient, 7);
      const dailyForecast = forecast.forecastParameters.effectiveDailyForecast;
      const leadTimeDays = ingredient.leadTimeDays || 3;

      // Calculations
      const leadTimeDemand = Number((dailyForecast * leadTimeDays).toFixed(2));
      const safetyStock = ingredient.minThreshold;
      const reorderPoint = Number((leadTimeDemand + safetyStock).toFixed(2));

      // Target maximum stock: typically 2x safety stock + lead time demand
      const targetStock = Math.ceil(safetyStock * 2 + leadTimeDemand);
      const suggestedReorderQty = Math.max(0, targetStock - ingredient.currentStock);
      const estimatedCost = Number((suggestedReorderQty * ingredient.costPerUnit).toFixed(2));

      // Urgency classification
      let urgency = 'ROUTINE';
      let urgencyReason = 'Stock levels are currently balanced.';

      if (ingredient.currentStock <= 0) {
        urgency = 'CRITICAL';
        urgencyReason = 'Vault completely depleted! Immediate procurement ritual required.';
      } else if (ingredient.currentStock <= leadTimeDemand) {
        urgency = 'CRITICAL';
        urgencyReason = `Stockout will occur before new supply can arrive (Lead time: ${leadTimeDays} days, stock sustains: ${forecast.stockoutEstimation.daysRemaining} days).`;
      } else if (ingredient.currentStock <= reorderPoint) {
        urgency = 'HIGH';
        urgencyReason = `Stock has breached Reorder Point (${ingredient.currentStock} vs ${reorderPoint} ${ingredient.unit}).`;
      } else if (forecast.stockoutEstimation.daysRemaining <= 7) {
        urgency = 'MEDIUM';
        urgencyReason = `Projected depletion within 7 days under active consumption velocity.`;
      }

      recommendations.push({
        ingredientId: ingredient._id,
        name: ingredient.name,
        category: ingredient.category,
        currentStock: ingredient.currentStock,
        minThreshold: ingredient.minThreshold,
        unit: ingredient.unit,
        costPerUnit: ingredient.costPerUnit,
        supplier: ingredient.supplier,
        leadTimeDays,
        dailyConsumptionRate: dailyForecast,
        leadTimeDemand,
        safetyStock,
        reorderPoint,
        suggestedReorderQty,
        estimatedCost,
        urgency,
        urgencyReason,
        daysUntilStockout: forecast.stockoutEstimation.daysRemaining,
        estimatedStockoutDate: forecast.stockoutEstimation.estimatedStockoutDate,
        needsReorder: suggestedReorderQty > 0 && (urgency !== 'ROUTINE' || ingredient.currentStock <= ingredient.minThreshold),
      });
    }

    // Filter to items needing reorder or return sorted by urgency
    const urgencyWeight = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, ROUTINE: 3 };
    recommendations.sort((a, b) => urgencyWeight[a.urgency] - urgencyWeight[b.urgency]);

    const actionableItems = recommendations.filter((r) => r.needsReorder);
    const totalRestockInvestment = actionableItems.reduce((sum, item) => sum + item.estimatedCost, 0);

    return {
      totalActionableRecommendations: actionableItems.length,
      totalEstimatedInvestment: Number(totalRestockInvestment.toFixed(2)),
      recommendations,
      actionableRestockList: actionableItems,
    };
  }

  /**
   * Execute restocking spell: applies replenishments and records movements
   */
  static async executeRestock(restockOrders) {
    const results = [];
    let totalCost = 0;

    for (const order of restockOrders) {
      const ingredient = await Ingredient.findById(order.ingredientId);
      if (!ingredient) continue;

      const qtyToAdd = Number(order.quantity);
      if (qtyToAdd <= 0) continue;

      const previousStock = ingredient.currentStock;
      ingredient.currentStock += qtyToAdd;
      await ingredient.save();

      const cost = Number((qtyToAdd * ingredient.costPerUnit).toFixed(2));
      totalCost += cost;

      await StockMovement.create({
        ingredient: ingredient._id,
        ingredientName: ingredient.name,
        type: 'RESTOCK',
        quantityChange: qtyToAdd,
        unit: ingredient.unit,
        previousStock,
        newStock: ingredient.currentStock,
        referenceId: `RESTOCK-${Date.now().toString().slice(-4)}`,
        reason: order.reason || 'Restock Spell invocation fulfilled',
      });

      results.push({
        ingredientId: ingredient._id,
        name: ingredient.name,
        quantityAdded: qtyToAdd,
        newStock: ingredient.currentStock,
        unit: ingredient.unit,
        cost,
      });
    }

    return {
      message: `Restock Spell executed successfully! Replenished ${results.length} reagents.`,
      totalCost: Number(totalCost.toFixed(2)),
      restockedItems: results,
    };
  }
}

