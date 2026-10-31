import { SalesService } from '../services/salesService.js';
import { successResponse } from '../middleware/responseFormatter.js';

export class SalesController {
  static async recordSale(req, res, next) {
    try {
      const result = await SalesService.recordSale(req.body);
      return successResponse(res, result.sale, result.message, 201, {
        deductions: result.deductions,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSales(req, res, next) {
    try {
      const { limit, skip, potionName, customer } = req.query;
      const { sales, total } = await SalesService.getSales({ limit, skip, potionName, customer });
      return successResponse(res, sales, 'Sales ledger retrieved successfully', 200, { total });
    } catch (err) {
      next(err);
    }
  }

  static async getPotions(req, res, next) {
    try {
      const potions = await SalesService.getPotions();
      return successResponse(res, potions, 'Potion recipes retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createPotion(req, res, next) {
    try {
      const potion = await SalesService.createPotion(req.body);
      return successResponse(res, potion, 'Potion recipe inscribed into grimoire', 201);
    } catch (err) {
      next(err);
    }
  }
}

