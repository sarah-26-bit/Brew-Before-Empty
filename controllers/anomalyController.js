import { AnomalyService } from '../services/anomalyService.js';
import { successResponse } from '../middleware/responseFormatter.js';

export class AnomalyController {
  static async getAnomalies(req, res, next) {
    try {
      const { status } = req.query;
      const anomalies = await AnomalyService.getAnomalies(status);
      return successResponse(res, anomalies, 'Strange Happenings telemetry retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async resolve(req, res, next) {
    try {
      const { note } = req.body;
      const resolved = await AnomalyService.resolveAnomaly(req.params.id, note);
      return successResponse(res, resolved, 'Disturbance neutralized and ward applied');
    } catch (err) {
      next(err);
    }
  }
}
