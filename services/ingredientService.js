import { Ingredient } from '../models/Ingredient.js';
import { StockMovement } from '../models/StockMovement.js';

export class IngredientService {
  /**
   * Fetch all ingredients with optional filtering and search
   */
  static async getAllIngredients(filters = {}) {
    const query = {};

    if (filters.category && filters.category !== 'ALL') {
      query.category = filters.category;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { supplier: { $regex: filters.search, $options: 'i' } },
      ];
    }

    let ingredients = await Ingredient.find(query).sort({ name: 1 });

    if (filters.status && filters.status !== 'ALL') {
      ingredients = ingredients.filter((ing) => {
        if (filters.status === 'LOW') return ing.isLowStock;
        if (filters.status === 'CRITICAL') return ing.stockStatus === 'CRITICAL' || ing.stockStatus === 'OUT_OF_STOCK';
        if (filters.status === 'HEALTHY') return !ing.isLowStock;
        return true;
      });
    }

    return ingredients;
  }

  /**
   * Retrieve single ingredient by ID
   */
  static async getIngredientById(id) {
    const ingredient = await Ingredient.findById(id);
    if (!ingredient) {
      const err = new Error(`Reagent with ID ${id} not found in Potion Pantry`);
      err.statusCode = 404;
      throw err;
    }
    return ingredient;
  }

  /**
   * Create new ingredient and log initial stock movement if currentStock > 0
   */
  static async createIngredient(data) {
    const ingredient = new Ingredient(data);
    await ingredient.save();

    if (ingredient.currentStock > 0) {
      await StockMovement.create({
        ingredient: ingredient._id,
        ingredientName: ingredient.name,
        type: 'INITIAL_INVENTORY',
        quantityChange: ingredient.currentStock,
        unit: ingredient.unit,
        previousStock: 0,
        newStock: ingredient.currentStock,
        reason: 'Initial vault cataloging',
      });
    }

    return ingredient;
  }

  /**
   * Update ingredient details and record stock movement if quantity changed
   */
  static async updateIngredient(id, updateData) {
    const ingredient = await this.getIngredientById(id);
    const oldStock = ingredient.currentStock;

    // Apply updates
    Object.assign(ingredient, updateData);

    // Prevent negative stock
    if (ingredient.currentStock < 0) {
      const err = new Error('Stock quantity cannot be reduced below zero');
      err.statusCode = 400;
      throw err;
    }

    await ingredient.save();

    // If stock changed manually, record stock movement
    if (updateData.currentStock !== undefined && updateData.currentStock !== oldStock) {
      const diff = updateData.currentStock - oldStock;
      await StockMovement.create({
        ingredient: ingredient._id,
        ingredientName: ingredient.name,
        type: diff > 0 ? 'RESTOCK' : 'MANUAL_ADJUSTMENT',
        quantityChange: diff,
        unit: ingredient.unit,
        previousStock: oldStock,
        newStock: ingredient.currentStock,
        reason: updateData.reason || 'Manual alchemical adjustment in Potion Pantry',
      });
    }

    return ingredient;
  }

  /**
   * Delete ingredient and clean up references
   */
  static async deleteIngredient(id) {
    const ingredient = await this.getIngredientById(id);
    await Ingredient.findByIdAndDelete(id);

    // Log deletion movement
    await StockMovement.create({
      ingredient: ingredient._id,
      ingredientName: ingredient.name,
      type: 'MANUAL_ADJUSTMENT',
      quantityChange: -ingredient.currentStock,
      unit: ingredient.unit,
      previousStock: ingredient.currentStock,
      newStock: 0,
      reason: 'Reagent banished from Sanctum records',
    });

    return ingredient;
  }

  /**
   * Get stock movement history for an ingredient or globally
   */
  static async getStockMovements(ingredientId = null, limit = 50) {
    const query = ingredientId ? { ingredient: ingredientId } : {};
    return StockMovement.find(query).sort({ timestamp: -1 }).limit(limit);
  }

  /**
   * Get distinct categories
   */
  static async getCategories() {
    return Ingredient.distinct('category');
  }
}
