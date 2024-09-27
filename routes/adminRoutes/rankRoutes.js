import express from 'express';
import {
    createRank,
    getAllRanks,
    getPartnerCategory,
    deleteRank
} from '../../controller/adminController/rankController.js';

const router = express.Router();

router.post('/', createRank); 
router.get('/', getAllRanks);
router.get('/badge', getPartnerCategory);
router.delete('/:rankId', deleteRank);

export default router;
