import express from 'express';
import { ProphecyController } from '../controllers/prophecyController.js';

const router = express.Router();

router.get('/', ProphecyController.getAllForecasts);
router.get('/:id', ProphecyController.getIngredientForecast);

export default router;

