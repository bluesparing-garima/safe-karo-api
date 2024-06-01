import mongoose from "mongoose";

//Define Schema
const healthpolicySchema = new mongoose.Schema({
  policyCategory: { type: String, require: true, trim: true },
  orderNumber: { type: String, require: true, trim: true },
  caseType: { type: String, required: true, trim: true },
  productId: { type: String, require: true, trim: true },
  insureanceComapnyId: { type: String, require: true, trim: true },
  policyNumber: { type: String, require: true, trim: true },
  brokerId: { type: String, require: true, trim: true },
  name: { type: String, require: true, trim: true },
  email: { type: String, require: true, trim: true },
  phoneNumber: { type: String, require: true, trim: true },
  issueDate: { type: String, require: true, trim: true },
  endDate: { type: String, require: true, trim: true },
  insuredSum: { type: Number, require: true, trim: true },
  netPremium: { type: Number, require: true, trim: true },
  finalPremium: { type: Number, require: true, trim: true },
  paymentMode: { type: String, require: true, trim: true },
  chequeNumber: { type: String, require: true, trim: true },
  rmId: { type: String, require: true, trim: true },
  partnerId: { type: String, require: true, trim: true },
  operationId: { type: String, require: true, trim: true },
  payoutStatus: { type: String, require: true, trim: true },
  payinStatus: { type: String, require: true, trim: true },
  date: { type: String, require: true, trim: true },
});

//Model
const HealthPolicyModel = mongoose.model("healthPolicy", healthpolicySchema);

export default HealthPolicyModel;
