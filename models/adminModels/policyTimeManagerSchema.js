import mongoose from 'mongoose';

const PolicyTimerManageSchema = new mongoose.Schema({
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'MotorPolicy', required: true },
  timer: { type: String, required: true },
  createdOn: { type: Date, default: Date.now },
});

export default mongoose.model('PolicyTimerManage', PolicyTimerManageSchema);
