import express from 'express';
import { createTrip, getTrips, getTripById, deleteTrip } from '../controllers/tripController.js';

const router = express.Router();

router.route('/')
  .post(createTrip)
  .get(getTrips);

router.route('/:id')
  .get(getTripById)
  .delete(deleteTrip);

export default router;
