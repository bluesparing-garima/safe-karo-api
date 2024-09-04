import NotificationModel from '../../models/notificationModel.js';

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { title, type, role, notificationFor, notificationBy, createdBy } = req.body;

    const newNotification = new NotificationModel({
      title,
      type,
      role,
      notificationFor,
      notificationBy,
      createdBy
    });

    await newNotification.save();

    res.status(201).json({
      message: "Notification created successfully",
      data: newNotification,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating notification",
      error: error.message,
    });
  }
};

// Get all notifications for a specific user
export const getNotificationsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await NotificationModel.find({ notificationFor: userId, isActive: true });

    res.status(200).json({
      message: "Notifications retrieved successfully",
      data: notifications,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving notifications",
      error: error.message,
    });
  }
};

// Mark notification as viewed
export const markNotificationAsViewed = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const updatedNotification = await NotificationModel.findByIdAndUpdate(
      notificationId,
      { isView: true, updatedOn: new Date() },
      { new: true }
    );

    res.status(200).json({
      message: "Notification marked as viewed",
      data: updatedNotification,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error marking notification as viewed",
      error: error.message,
    });
  }
};
