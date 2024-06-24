import express from 'express';
import { getActivityLogs, getActivityLogById, deleteActivityLog } from '../controller/adminController/activityLogController.js';
const router = express.Router();

// Route to get all activity logs
router.get('/', getActivityLogs);

// Route to get an activity log by ID
router.get('/:id', getActivityLogById);

// Route to delete an activity log by ID
router.delete('/:id', deleteActivityLog);

export default router;
