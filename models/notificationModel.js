import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String },
  type: { type: String, enum: ['success', 'error', 'warning'] },
  role: { type: String, enum: ['booking', 'operation', 'partner','admin','Relationship Manager'] },
  notificationFor: { type: String, trim:true },
  notificationBy: { type: String, trim:true },
  isView: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdOn: { type: Date, default: Date.now },
  createdBy: { type: String, trim:true },
  updatedOn: { type: Date },
  updatedBy: { type: String, trim:true }
});

const NotificationModel = mongoose.model('Notification', notificationSchema);

export default NotificationModel;