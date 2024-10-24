import express from "express"
import {
  createinvestigation,
  getAllinvestigations,
  getinvestigationById,
  updateinvestigation,
  deleteinvestigation,
} from '../../../controller/Non-Motor/investigationController/investigationController.js';

const router = express.Router();

router.post('/', createinvestigation);
router.get('/', getAllinvestigations);
router.get('/:id', getinvestigationById);    
router.put('/:id', updateinvestigation);
router.delete('/:id', deleteinvestigation);

export default router;