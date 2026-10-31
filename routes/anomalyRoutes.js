import express from 'express';
import { AnomalyController } from '../controllers/anomalyController.js';

const router = express.Router();

router.get('/', AnomalyController.getAnomalies);
router.post('/:id/resolve', AnomalyController.resolve);

export default router;
