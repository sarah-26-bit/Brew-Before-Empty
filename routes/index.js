import express from 'express';
import ingredientRoutes from './ingredientRoutes.js';
import salesRoutes from './salesRoutes.js';
import prophecyRoutes from './prophecyRoutes.js';
import restockRoutes from './restockRoutes.js';
import anomalyRoutes from './anomalyRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import eventRoutes from './eventRoutes.js';
import { SeedService } from '../services/seedService.js';
import { successResponse } from '../middleware/responseFormatter.js';

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  return successResponse(
    res,
    {
      status: 'operational',
      engine: 'POTIONPULSE / SPELLSTOCK Intelligence Backend',
      edition: 'Hack-O-Lantern 2026',
      uptimeSeconds: process.uptime(),
      memoryUsage: process.memoryUsage(),
    },
    'Alchemical Core is healthy and attuned to the astral plane'
  );
});

// Seed endpoint for development
router.post('/seed', async (req, res, next) => {
  try {
    const force = req.query.force === 'true' || req.body?.force === true;
    const result = await SeedService.seedHistoricalData(force);
    return successResponse(res, result, 'Synthetic historical data populated successfully');
  } catch (err) {
    next(err);
  }
});

// Core Modules
router.use('/ingredients', ingredientRoutes);
router.use('/sales', salesRoutes);
router.use('/forecasts', prophecyRoutes);
router.use('/restock', restockRoutes);
router.use('/anomalies', anomalyRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/events', eventRoutes);

export default router;
