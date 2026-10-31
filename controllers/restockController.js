import { RestockService } from '../services/restockService.js';
import { successResponse } from '../middleware/responseFormatter.js';

export class RestockController {
  static async getRecommendations(req, res, next) {
    try {
      const recommendations = await RestockService.calculateRestockRecommendations();
      return successResponse(res, recommendations, 'Restocking recommendations generated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async executeRestock(req, res, next) {
    try {
      const { orders } = req.body;
      if (!orders || !Array.isArray(orders) || orders.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'At least one restocking order must be provided',
        });
      }
      const result = await RestockService.executeRestock(orders);
      return successResponse(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }
}

