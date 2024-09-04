import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String },
  type: { type: String, enum: ['success', 'error', 'warning'] },
  role: { type: String, enum: ['booking', 'operation', 'partner'] },
  notificationFor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // assuming you have a User model
  notificationBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // assuming you have a User model
  isView: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdOn: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedOn: { type: Date },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const NotificationModel = mongoose.model('Notification', notificationSchema);

export default NotificationModel;