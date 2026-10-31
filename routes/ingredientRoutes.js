import express from 'express';
import { IngredientController } from '../controllers/ingredientController.js';
import { validateIngredient } from '../middleware/validator.js';

const router = express.Router();

router.route('/')
  .get(IngredientController.getAll)
  .post(validateIngredient, IngredientController.create);

router.get('/categories', IngredientController.getCategories);

router.route('/:id')
  .get(IngredientController.getById)
  .put(IngredientController.update)
  .delete(IngredientController.delete);

router.get('/:id/movements', IngredientController.getMovements);

export default router;
