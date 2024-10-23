import express from "express"
import {
  createState,
  getAllStates,
  getStateById,
  updateState,
  deleteState,
} from '../../../controller/Non-Motor/stateController/stateController.js';

const router = express.Router();

router.post('/', createState);
router.get('/', getAllStates);
router.get('/:id', getStateById);    
router.put('/:id', updateState);
router.delete('/:id', deleteState);

export default router;