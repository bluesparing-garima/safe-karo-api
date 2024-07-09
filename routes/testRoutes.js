import express from 'express';
import { uploadFilesAndData,createMotorPolicy } from '../controller/fileController.js';

const router = express.Router();

router.post('/test', uploadFilesAndData);
router.post('/test/policy/motor', createMotorPolicy);

export default router;
