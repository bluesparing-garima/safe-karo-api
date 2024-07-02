import express from 'express';
import { userRegistration, verifyAndCompleteRegistration, userLogin, verifyAndCompleteLogin } from '../controller/userController.js';
import logActivity from "../middlewares/logActivity.js";
const router = express.Router();

router.post('/register', logActivity,userRegistration);
router.post('/verify-registration', logActivity,verifyAndCompleteRegistration);
router.post('/login',logActivity, userLogin);
router.post('/verify-login', logActivity,verifyAndCompleteLogin);

export default router;
