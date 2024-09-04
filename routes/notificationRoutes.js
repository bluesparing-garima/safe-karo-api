import express from 'express';
import { createNotification, getNotificationsForUser, markNotificationAsViewed } from '../../controllers/notificationController.js';

const router = express.Router();

// Create a notification
router.post('/notifications', createNotification);

// Get notifications for a specific user
router.get('/notifications/:userId', getNotificationsForUser);

// Mark notification as viewed
router.put('/notifications/view/:notificationId', markNotificationAsViewed);

export default router;
