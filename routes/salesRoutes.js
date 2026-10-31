import express from 'express';
import { SalesController } from '../controllers/salesController.js';
import { validateSale } from '../middleware/validator.js';

const router = express.Router();

router.route('/')
  .get(SalesController.getSales)
  .post(validateSale, SalesController.recordSale);

router.route('/potions')
  .get(SalesController.getPotions)
  .post(SalesController.createPotion);

export default router;

