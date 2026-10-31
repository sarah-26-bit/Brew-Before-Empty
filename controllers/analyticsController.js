import { AnalyticsService } from '../services/analyticsService.js';
import { successResponse } from '../middleware/responseFormatter.js';

export class AnalyticsController {
  static async getAnalytics(req, res, next) {
    try {
      const analytics = await AnalyticsService.getCrystalBallAnalytics();
      return successResponse(res, analytics, 'Crystal Ball Analytics compiled successfully');
    } catch (err) {
      next(err);
    }
  }
}

