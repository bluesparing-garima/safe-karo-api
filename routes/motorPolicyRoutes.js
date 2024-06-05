import express from 'express';
import upload from '../middlewares/multer.js';
import { createMotorPolicy } from '../controller/motorPolicyController.js';

const router = express.Router();

router.post('/', upload.fields([
  { name: 'rcFront', maxCount: 1 },
  { name: 'rcBack', maxCount: 1 },
  { name: 'previousPolicy', maxCount: 1 },
  { name: 'survey', maxCount: 1 },
  { name: 'puc', maxCount: 1 },
  { name: 'fitness', maxCount: 1 },
  { name: 'proposal', maxCount: 1 },
  { name: 'currentPolicy', maxCount: 1 },
  { name: 'other', maxCount: 1 }
])
, createMotorPolicy);

export default router;
