import express from "express"
import {
  createArea,
  getAllAreas,
  getAreasByCity,
  getAreaById,
  updateArea,
  deleteArea,
} from '../../../controller/Non-Motor/areaController/areaController.js';

const router = express.Router();

router.post('/', createArea);
router.get('/', getAllAreas);
router.get('/city-id/:cityId', getAreasByCity);
router.get('/:id', getAreaById);    
router.put('/:id', updateArea);
router.delete('/:id', deleteArea);

export default router;