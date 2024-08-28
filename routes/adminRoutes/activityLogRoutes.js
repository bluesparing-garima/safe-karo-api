import express from 'express';
//import { getActivityLogs, getActivityLogById, deleteActivityLog } from '../../controller/adminController/activityLogController.js';
import{getLogActivity} from "../../middlewares/logActivity.js";

const router = express.Router();

// Route to get all activity logs
router.get('/', getLogActivity);


export default router;
