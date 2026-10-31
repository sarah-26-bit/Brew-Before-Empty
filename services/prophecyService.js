import { StockMovement } from '../models/StockMovement.js';
import { Ingredient } from '../models/Ingredient.js';
import { MidnightCurseService } from './midnightCurseService.js';

export class ProphecyService {
  /**
   * Calculate daily consumption from actual historical stock movements
   * Filters movements of type 'SALE_CONSUMPTION', 'SPOILAGE_DISCARD', 'SEASONAL_SURGE_DECAY'
   */
  static async calculateHistoricalDailyConsumption(ingredientId, daysHistory = 14) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysHistory);
    cutoffDate.setHours(0, 0, 0, 0);

    const movements = await StockMovement.find({
      ingredient: ingredientId,
      type: { $in: ['SALE_CONSUMPTION', 'SPOILAGE_DISCARD', 'SEASONAL_SURGE_DECAY'] },
      timestamp: { $gte: cutoffDate },
    }).sort({ timestamp: 1 });

    // Group consumption by calendar date (YYYY-MM-DD)
    const dailyMap = {};
    for (let i = 0; i < daysHistory; i++) {
      const d = new Date(cutoffDate);
      d.setDate(d.getDate() + i);
      const dateKey = d.toISOString().split('T')[0];
      dailyMap[dateKey] = 0;
    }

    for (const mov of movements) {
      const dateKey = mov.timestamp.toISOString().split('T')[0];
      if (dailyMap[dateKey] !== undefined) {
        dailyMap[dateKey] += Math.abs(mov.quantityChange);
      } else {
        dailyMap[dateKey] = Math.abs(mov.quantityChange);
      }
    }

    const dailyValues = Object.entries(dailyMap).map(([date, consumption]) => ({
      date,
      consumption: Number(consumption.toFixed(2)),
    }));

    return dailyValues;
  }

  /**
   * Forecast the next 7 days of demand for an ingredient using Weighted Moving Average (WMA)
   * Integrates seasonal multipliers from active Midnight Curse events
   */
  static async forecastIngredientDemand(ingredient, forecastDays = 7, daysHistory = 14) {
    const historicalData = await this.calculateHistoricalDailyConsumption(ingredient._id, daysHistory);
    const consumptionSeries = historicalData.map((d) => d.consumption);

    // Calculate baseline daily average
    const totalHistoricalConsumption = consumptionSeries.reduce((sum, v) => sum + v, 0);
    const simpleDailyAverage = consumptionSeries.length > 0
      ? totalHistoricalConsumption / consumptionSeries.length
      : 1.0;

    // Weighted Moving Average (WMA) giving progressively higher weights to recent days
    // e.g. for last 7 days: weights [1, 2, 3, 4, 5, 6, 7] normalized
    const recentWindow = Math.min(7, consumptionSeries.length);
    const recentValues = consumptionSeries.slice(-recentWindow);

    let weightedSum = 0;
    let weightSum = 0;
    for (let i = 0; i < recentValues.length; i++) {
      const weight = i + 1; // 1 to recentWindow
      weightedSum += recentValues[i] * weight;
      weightSum += weight;
    }
    const weightedDailyAverage = weightSum > 0 ? (weightedSum / weightSum) : simpleDailyAverage;

    // Retrieve active Midnight Curse demand multiplier
    const { multiplier: curseMultiplier, activeEvents } =
      await MidnightCurseService.getIngredientMultiplier(ingredient._id, ingredient.category);

    // If an ingredient has minimal historical data (e.g. freshly seeded), fallback gracefully to default burn rate
    const baseDaily = weightedDailyAverage > 0.1 ? weightedDailyAverage : 2.5;
    const effectiveDailyForecast = Number((baseDaily * curseMultiplier).toFixed(2));

    // Predict demand day-by-day for the next forecastDays
    const dailyForecasts = [];
    const today = new Date();
    let cumulativeDemand = 0;

    for (let day = 1; day <= forecastDays; day++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + day);

      // Add a slight day-of-week seasonality curve (weekends have +15% demand)
      const dayOfWeek = forecastDate.getDay();
      const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.15 : 0.95;
      const dayDemand = Number((effectiveDailyForecast * weekendFactor).toFixed(2));

      cumulativeDemand += dayDemand;

      dailyForecasts.push({
        dayIndex: day,
        date: forecastDate.toISOString().split('T')[0],
        dayOfWeek: forecastDate.toLocaleDateString('en-US', { weekday: 'short' }),
        predictedDemand: dayDemand,
        cumulativeDemand: Number(cumulativeDemand.toFixed(2)),
      });
    }

    // Estimate Stockout Date
    const daysUntilStockout = effectiveDailyForecast > 0
      ? Math.max(0, Math.floor(ingredient.currentStock / effectiveDailyForecast))
      : 999;

    const stockoutDate = new Date(today);
    stockoutDate.setDate(today.getDate() + daysUntilStockout);

    let stockoutFormatted = stockoutDate.toISOString().split('T')[0];
    if (ingredient.currentStock <= 0) {
      stockoutFormatted = 'Depleted (Out of Stock)';
    } else if (daysUntilStockout > 365) {
      stockoutFormatted = 'Safe (> 1 year)';
    }

    // Generate natural language Prediction Explanation
    const explanationParts = [];
    explanationParts.push(
      `Baseline daily consumption is ${weightedDailyAverage.toFixed(2)} ${ingredient.unit}/day derived from a ${recentWindow}-day Weighted Moving Average (WMA).`
    );

    if (curseMultiplier > 1.0) {
      const eventNames = activeEvents.map((e) => e.name).join(', ');
      explanationParts.push(
        `Active celestial surge (${eventNames}) elevates demand by ${((curseMultiplier - 1.0) * 100).toFixed(0)}%, resulting in an effective burn rate of ${effectiveDailyForecast} ${ingredient.unit}/day.`
      );
    } else {
      explanationParts.push('No active celestial surge is accelerating consumption for this reagent category.');
    }

    if (daysUntilStockout <= 3) {
      explanationParts.push(
        `CRITICAL RISK: At current velocity, available vault stock (${ingredient.currentStock} ${ingredient.unit}) will exhaust in ~${daysUntilStockout} days on ${stockoutFormatted}.`
      );
    } else if (daysUntilStockout <= 7) {
      explanationParts.push(
        `ELEVATED RISK: Depletion expected within the 7-day horizon. Restock order should be placed immediately considering the ${ingredient.leadTimeDays}-day supplier lead time.`
      );
    } else {
      explanationParts.push(
        `STABLE: Current stock sustains operations for ~${daysUntilStockout} days until ${stockoutFormatted}.`
      );
    }

    return {
      ingredient: {
        id: ingredient._id,
        name: ingredient.name,
        category: ingredient.category,
        currentStock: ingredient.currentStock,
        minThreshold: ingredient.minThreshold,
        unit: ingredient.unit,
        leadTimeDays: ingredient.leadTimeDays,
      },
      forecastParameters: {
        method: 'Weighted Moving Average (WMA)',
        historyDaysAnalyzed: daysHistory,
        baselineDailyAverage: Number(weightedDailyAverage.toFixed(2)),
        curseMultiplier,
        effectiveDailyForecast,
        activeEvents,
      },
      nextSevenDaysDemand: dailyForecasts,
      totalSevenDayForecast: Number(cumulativeDemand.toFixed(2)),
      stockoutEstimation: {
        daysRemaining: daysUntilStockout,
        estimatedStockoutDate: stockoutFormatted,
        isAtRiskWithinLeadTime: daysUntilStockout <= ingredient.leadTimeDays,
      },
      predictionExplanation: explanationParts.join(' '),
    };
  }

  /**
   * Get demand predictions for all ingredients across the pantry
   */
  static async getAllForecasts(forecastDays = 7, daysHistory = 14) {
    const ingredients = await Ingredient.find().sort({ name: 1 });
    const forecasts = [];

    for (const ing of ingredients) {
      const forecast = await this.forecastIngredientDemand(ing, forecastDays, daysHistory);
      forecasts.push(forecast);
    }

    // Sort by most imminent stockout date
    forecasts.sort((a, b) => a.stockoutEstimation.daysRemaining - b.stockoutEstimation.daysRemaining);

    return {
      forecastHorizonDays: forecastDays,
      generatedAt: new Date().toISOString(),
      forecasts,
    };
  }
}

