import { IngredientService } from '../services/ingredientService.js';
import { successResponse } from '../middleware/responseFormatter.js';

export class IngredientController {
  static async getAll(req, res, next) {
    try {
      const { category, search, status } = req.query;
      const ingredients = await IngredientService.getAllIngredients({ category, search, status });
      return successResponse(res, ingredients, 'Ingredients retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const ingredient = await IngredientService.getIngredientById(req.params.id);
      return successResponse(res, ingredient, 'Ingredient retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const ingredient = await IngredientService.createIngredient(req.body);
      return successResponse(res, ingredient, 'Ingredient cataloged into Potion Pantry', 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const ingredient = await IngredientService.updateIngredient(req.params.id, req.body);
      return successResponse(res, ingredient, 'Ingredient updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const deleted = await IngredientService.deleteIngredient(req.params.id);
      return successResponse(res, deleted, 'Ingredient banished from inventory');
    } catch (err) {
      next(err);
    }
  }

  static async getMovements(req, res, next) {
    try {
      const movements = await IngredientService.getStockMovements(req.params.id, req.query.limit);
      return successResponse(res, movements, 'Stock movement history retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getCategories(req, res, next) {
    try {
      const categories = await IngredientService.getCategories();
      return successResponse(res, categories, 'Ingredient categories retrieved');
    } catch (err) {
      next(err);
    }
  }
}

