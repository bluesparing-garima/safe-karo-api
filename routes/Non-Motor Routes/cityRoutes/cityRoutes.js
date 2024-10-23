import express from "express"
import {
  createCity,
  getAllCities,
  getCitiesByStateId,
  getCityById,
  updateCity,
  deleteCity,
} from '../../../controller/Non-Motor/cityController/cityController.js';

const router = express.Router();

router.post('/', createCity);
router.get('/', getAllCities);
router.get('/state-id/:stateId', getCitiesByStateId);
router.get('/:id', getCityById);    
router.put('/:id', updateCity);
router.delete('/:id', deleteCity);

export default router;