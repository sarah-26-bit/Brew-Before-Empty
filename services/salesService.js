import mongoose from 'mongoose';
import { Sale } from '../models/Sale.js';
import { Potion } from '../models/Potion.js';
import { Ingredient } from '../models/Ingredient.js';
import { StockMovement } from '../models/StockMovement.js';

export class SalesService {
  /**
   * Record a potion sale, automatically deduct recipe ingredients,
   * prevent negative inventory, and record stock movements.
   */
  static async recordSale(saleData) {
    const {
      potionId,
      potionName,
      quantity = 1,
      customer = 'Anonymous Sorcerer',
      guild = 'Independent Order',
    } = saleData;

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      const err = new Error('Sale quantity must be a positive integer');
      err.statusCode = 400;
      throw err;
    }

    // 1. Resolve potion recipe
    let potion = null;
    if (potionId) {
      potion = await Potion.findById(potionId);
    }
    if (!potion && potionName) {
      potion = await Potion.findOne({ name: new RegExp(`^${potionName.trim()}$`, 'i') });
    }

    if (!potion) {
      const err = new Error(`Potion '${potionName || potionId}' not found in grimoire recipes`);
      err.statusCode = 404;
      throw err;
    }

    // 2. Pre-check all ingredients and calculate needed consumption
    const requiredDeductions = [];
    const missingIngredients = [];

    for (const item of potion.recipe) {
      const ingredient = await Ingredient.findById(item.ingredient);
      const neededQty = Number((item.quantity * qty).toFixed(2));

      if (!ingredient) {
        missingIngredients.push({
          ingredientName: item.ingredientName,
          required: neededQty,
          available: 0,
          unit: item.unit,
          reason: 'Ingredient not found in inventory',
        });
        continue;
      }

      if (ingredient.currentStock < neededQty) {
        missingIngredients.push({
          ingredientName: ingredient.name,
          required: neededQty,
          available: ingredient.currentStock,
          unit: item.unit,
          deficit: Number((neededQty - ingredient.currentStock).toFixed(2)),
        });
      } else {
        requiredDeductions.push({
          ingredient,
          neededQty,
          unit: item.unit,
        });
      }
    }

    // PREVENT NEGATIVE INVENTORY: If any reagent is deficient, abort sale!
    if (missingIngredients.length > 0) {
      const err = new Error('Insufficient magical ingredients to brew and dispense this potion');
      err.statusCode = 400;
      err.details = missingIngredients;
      throw err;
    }

    // 3. Atomically deduct ingredients and record stock movements
    const consumedIngredientsReport = [];
    const generatedSaleId = `TXN-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;

    for (const deduction of requiredDeductions) {
      const { ingredient, neededQty, unit } = deduction;
      const previousStock = ingredient.currentStock;

      // Atomic update with condition to prevent race conditions & negative stock
      const updatedIngredient = await Ingredient.findOneAndUpdate(
        { _id: ingredient._id, currentStock: { $gte: neededQty } },
        { $inc: { currentStock: -neededQty } },
        { returnDocument: 'after' }
      );

      if (!updatedIngredient) {
        const err = new Error(`Concurrent depletion detected for ${ingredient.name}. Sale cancelled to prevent negative inventory.`);
        err.statusCode = 409;
        throw err;
      }

      // Record stock movement
      await StockMovement.create({
        ingredient: updatedIngredient._id,
        ingredientName: updatedIngredient.name,
        type: 'SALE_CONSUMPTION',
        quantityChange: -neededQty,
        unit,
        previousStock,
        newStock: updatedIngredient.currentStock,
        referenceId: generatedSaleId,
        reason: `Sold ${qty}x ${potion.name}`,
      });

      consumedIngredientsReport.push({
        ingredient: updatedIngredient._id,
        ingredientName: updatedIngredient.name,
        quantityDeducted: neededQty,
        unit,
      });
    }

    // 4. Save sale record
    const totalPrice = Number((potion.price * qty).toFixed(2));
    const sale = new Sale({
      saleId: generatedSaleId,
      potion: potion._id,
      potionName: potion.name,
      quantity: qty,
      totalPrice,
      customer: customer.trim(),
      guild: guild.trim(),
      consumedIngredients: consumedIngredientsReport,
    });

    await sale.save();

    return {
      sale,
      message: `Sale registered! Automatically deducted reagents for ${qty}x ${potion.name}.`,
      deductions: consumedIngredientsReport,
    };
  }

  /**
   * Get all sales transactions
   */
  static async getSales(options = {}) {
    const limit = Number(options.limit) || 50;
    const skip = Number(options.skip) || 0;

    const query = {};
    if (options.potionName) {
      query.potionName = new RegExp(options.potionName, 'i');
    }
    if (options.customer) {
      query.customer = new RegExp(options.customer, 'i');
    }

    const [sales, total] = await Promise.all([
      Sale.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit),
      Sale.countDocuments(query),
    ]);

    return { sales, total };
  }

  /**
   * Get potion recipes catalogue
   */
  static async getPotions() {
    return Potion.find().populate('recipe.ingredient').sort({ name: 1 });
  }

  /**
   * Create new potion recipe
   */
  static async createPotion(data) {
    const potion = new Potion(data);
    await potion.save();
    return potion;
  }
}
