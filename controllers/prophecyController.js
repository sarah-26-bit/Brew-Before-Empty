import { ProphecyService } from '../services/prophecyService.js';
import { IngredientService } from '../services/ingredientService.js';
import { successResponse } from '../middleware/responseFormatter.js';

export class ProphecyController {
  static async getAllForecasts(req, res, next) {
    try {
      const forecastDays = Number(req.query.days) || 7;
      const historyDays = Number(req.query.history) || 14;
      const forecasts = await ProphecyService.getAllForecasts(forecastDays, historyDays);
      return successResponse(res, forecasts, 'Prophecy AI demand forecasts computed successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getIngredientForecast(req, res, next) {
    try {
      const ingredient = await IngredientService.getIngredientById(req.params.id);
      const forecastDays = Number(req.query.days) || 7;
      const forecast = await ProphecyService.forecastIngredientDemand(ingredient, forecastDays);
      return successResponse(res, forecast, `Demand forecast for ${ingredient.name}`);
    } catch (err) {
      next(err);
    }
  }
}
