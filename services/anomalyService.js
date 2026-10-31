import { Anomaly } from '../models/Anomaly.js';
import { Ingredient } from '../models/Ingredient.js';
import { StockMovement } from '../models/StockMovement.js';
import { ProphecyService } from './prophecyService.js';

export class AnomalyService {
  /**
   * Run statistical anomaly detection across all ingredients
   * Computes sample mean (μ) and standard deviation (σ) over historical daily consumption
   * Flags data points with Z-Score > 2.0 (spikes) or unexpected negative adjustments
   */
  static async scanForAnomalies() {
    const ingredients = await Ingredient.find();
    const detectedAnomalies = [];

    for (const ingredient of ingredients) {
      // 1. Analyze daily consumption over the past 14 days
      const dailyHistory = await ProphecyService.calculateHistoricalDailyConsumption(ingredient._id, 14);
      const values = dailyHistory.map((d) => d.consumption);

      if (values.length >= 4) {
        const n = values.length;
        const mean = values.reduce((sum, v) => sum + v, 0) / n;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (n - 1 || 1);
        const stdDev = Math.sqrt(variance);

        // Check the most recent day (yesterday or today)
        const latestObservation = values[values.length - 1];

        // Z-score calculation: Z = (X - μ) / σ
        if (stdDev > 0.1) {
          const zScore = Number(((latestObservation - mean) / stdDev).toFixed(2));

          if (zScore >= 2.0 && latestObservation > mean * 1.5) {
            let severity = 'MEDIUM';
            if (zScore >= 3.5 || latestObservation > mean * 3.0) severity = 'CRITICAL';
            else if (zScore >= 2.5) severity = 'HIGH';

            const explanation = `Statistical consumption spike detected: observed ${latestObservation} ${ingredient.unit} vs expected baseline mean of ${mean.toFixed(1)} ${ingredient.unit} (Z-Score: +${zScore}σ). Consumption is ${((latestObservation / (mean || 1)) * 100).toFixed(0)}% of typical velocity.`;

            // Check if anomaly was already recorded recently
            const existing = await Anomaly.findOne({
              ingredient: ingredient._id,
              type: 'CONSUMPTION_SPIKE',
              status: 'ACTIVE',
            });

            if (!existing) {
              const newAnomaly = await Anomaly.create({
                title: `Unusual Consumption Surge: ${ingredient.name}`,
                ingredient: ingredient._id,
                ingredientName: ingredient.name,
                type: 'CONSUMPTION_SPIKE',
                severity,
                zScore,
                observedValue: latestObservation,
                expectedValue: Number(mean.toFixed(2)),
                unit: ingredient.unit,
                explanation,
                recommendedAction: 'Verify ledger dispensation transactions for large unannounced batches or phantom leaks.',
              });
              detectedAnomalies.push(newAnomaly);
            }
          }
        }
      }

      // 2. Check for manual adjustments or rapid stockout risks
      if (ingredient.currentStock <= ingredient.minThreshold * 0.5) {
        const existingStockout = await Anomaly.findOne({
          ingredient: ingredient._id,
          type: 'RAPID_DEPLETION',
          status: 'ACTIVE',
        });

        if (!existingStockout) {
          const severeAnomaly = await Anomaly.create({
            title: `Severe Depletion Hazard: ${ingredient.name}`,
            ingredient: ingredient._id,
            ingredientName: ingredient.name,
            type: 'RAPID_DEPLETION',
            severity: ingredient.currentStock <= 0 ? 'CRITICAL' : 'HIGH',
            observedValue: ingredient.currentStock,
            expectedValue: ingredient.minThreshold,
            unit: ingredient.unit,
            explanation: `Available stock (${ingredient.currentStock} ${ingredient.unit}) has breached critical 50% safety buffer (${ingredient.minThreshold * 0.5} ${ingredient.unit}).`,
            recommendedAction: 'Cast immediate Restock Spell to prevent total apothecary halt.',
          });
          detectedAnomalies.push(severeAnomaly);
        }
      }

      // 3. Check for unexpected negative stock movements not tied to a registered sale
      const unexpectedMovements = await StockMovement.find({
        ingredient: ingredient._id,
        type: { $in: ['MANUAL_ADJUSTMENT', 'SPOILAGE_DISCARD'] },
        quantityChange: { $lt: -5 },
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      for (const mov of unexpectedMovements) {
        const existingAdj = await Anomaly.findOne({
          ingredient: ingredient._id,
          type: 'UNEXPECTED_ADJUSTMENT',
          status: 'ACTIVE',
        });

        if (!existingAdj) {
          const adjAnomaly = await Anomaly.create({
            title: `Suspicious Stock Adjustment: ${ingredient.name}`,
            ingredient: ingredient._id,
            ingredientName: ingredient.name,
            type: 'UNEXPECTED_ADJUSTMENT',
            severity: Math.abs(mov.quantityChange) >= 20 ? 'HIGH' : 'MEDIUM',
            observedValue: Math.abs(mov.quantityChange),
            expectedValue: 0,
            unit: ingredient.unit,
            explanation: `Sudden manual deduction of ${Math.abs(mov.quantityChange)} ${ingredient.unit} registered with reason: "${mov.reason || 'None specified'}".`,
            recommendedAction: 'Audit vault security seals and cross-examine apprentice logbooks.',
          });
          detectedAnomalies.push(adjAnomaly);
        }
      }
    }

    return detectedAnomalies;
  }

  /**
   * Get all anomalies with filtering
   */
  static async getAnomalies(status = null) {
    // Run automated scan first to refresh telemetry
    await this.scanForAnomalies();

    const query = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }

    return Anomaly.find(query).sort({ detectedAt: -1 });
  }

  /**
   * Resolve an anomaly by applying warding
   */
  static async resolveAnomaly(id, note = null) {
    const anomaly = await Anomaly.findById(id);
    if (!anomaly) {
      const err = new Error('Anomaly record not found');
      err.statusCode = 404;
      throw err;
    }

    anomaly.status = 'RESOLVED';
    anomaly.resolvedAt = new Date();
    anomaly.resolutionNote = note || 'Purification ward applied by the Apothecary in charge.';
    await anomaly.save();

    return anomaly;
  }
}
