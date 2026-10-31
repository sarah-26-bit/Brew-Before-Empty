import express from 'express';
import { RestockController } from '../controllers/restockController.js';

const router = express.Router();

router.get('/', RestockController.getRecommendations);
router.post('/execute', RestockController.executeRestock);

export default router;

