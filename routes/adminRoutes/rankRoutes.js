import express from 'express';
import {
    createRank,
    updateRank,
    getAllRanks,
    getPartnerCategory,
    deleteRank
} from '../../controller/adminController/rankController.js';

const router = express.Router();

router.post('/', createRank);
router.put('/:rankId', updateRank);
router.get('/', getAllRanks);
router.get('/badge', getPartnerCategory);
router.delete('/:rankId', deleteRank);

export default router;
