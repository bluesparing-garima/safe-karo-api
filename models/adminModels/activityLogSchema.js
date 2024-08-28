import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  endpoint: { type: String, required: true, trim: true },
  statusCode: { type: Number, required: true },
  request: { type: String, trim: true },
  response: { type: String, trim: true },
  partnerId: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, trim: true },
  createdOn: { type: Date, default: Date.now },
  updatedBy: { type: String, default: null, trim: true },
  updatedOn: { type: Date, default: Date.now }
});

// Adding indexes to optimize query performance
ActivityLogSchema.index({ endpoint: 1 });
ActivityLogSchema.index({ statusCode: 1 });
ActivityLogSchema.index({ partnerId: 1 });
ActivityLogSchema.index({ createdOn: 1 });
ActivityLogSchema.index({ isActive: 1 });

export default mongoose.model('ActivityLog', ActivityLogSchema);
