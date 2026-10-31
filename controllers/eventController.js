import { MidnightCurseService } from '../services/midnightCurseService.js';
import { SeedService } from '../services/seedService.js';
import { successResponse } from '../middleware/responseFormatter.js';

export class EventController {
  static async registerEvent(req, res, next) {
    try {
      const event = await MidnightCurseService.registerEvent(req.body);
      return successResponse(res, event, 'Seasonal event registered into Midnight Curse crucible', 201);
    } catch (err) {
      next(err);
    }
  }

  static async getEvents(req, res, next) {
    try {
      const events = await MidnightCurseService.getEvents();
      const active = await MidnightCurseService.getActiveEvents();
      return successResponse(res, { events, activeEvents: active }, 'Seasonal events retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async toggleEvent(req, res, next) {
    try {
      const { isActive } = req.body;
      const event = await MidnightCurseService.toggleEvent(req.params.id, isActive);
      return successResponse(res, event, `Event ${event.name} status updated to ${event.isActive ? 'ACTIVE' : 'DORMANT'}`);
    } catch (err) {
      next(err);
    }
  }

  static async seed(req, res, next) {
    try {
      const force = req.query.force === 'true' || req.body.force === true;
      const result = await SeedService.seedHistoricalData(force);
      return successResponse(res, result, 'Synthetic historical data populated successfully');
    } catch (err) {
      next(err);
    }
  }
}

