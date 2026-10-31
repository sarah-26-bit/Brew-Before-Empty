import express from 'express';
import { AnalyticsController } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/', AnalyticsController.getAnalytics);

export default router;

