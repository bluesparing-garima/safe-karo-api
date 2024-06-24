import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  objectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  endpoint: { type: String, required: true, trim: true },
  statusCode: { type: Number, required: true },
  request: { type: String, trim: true },
  response: { type: String, trim: true },
  userId: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true, trim: true },
  createdOn: { type: Date, default: Date.now },
  updatedBy: { type: String, default: null, trim: true },
  updatedOn: { type: Date, default: Date.now }
});

export default mongoose.model('ActivityLog', ActivityLogSchema);
