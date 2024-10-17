import express from 'express';
import { 
  createNotification, 
  getNotificationsForUser, 
  markNotificationAsViewed, 
  getAllNotifications 
} from '../controller/notificationController.js';

const router = express.Router();

router.post('/', createNotification);
router.get('/user/:userId', getNotificationsForUser);
router.put('/view/:notificationId', markNotificationAsViewed);
router.get('/', getAllNotifications);

export default router;
