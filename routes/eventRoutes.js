import express from 'express';
import { EventController } from '../controllers/eventController.js';
import { validateSeasonalEvent } from '../middleware/validator.js';

const router = express.Router();

router.route('/')
  .get(EventController.getEvents)
  .post(validateSeasonalEvent, EventController.registerEvent);

router.patch('/:id/toggle', EventController.toggleEvent);
router.post('/seed', EventController.seed);

export default router;
