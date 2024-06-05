import mongoose  from "mongoose";

//Define Schema
const motorpolicySchema = new mongoose.Schema({
  uuid: {  type: String, require: true, trim: true },
  createdBy: { type: String },
  policyCategory: { type: String, require: true, trim: true },
  policyType: { type: String, require: true, trim: true },
  caseType: { type: String, require: true, trim: true },
  product: { type: String, require: true, trim: true },
  insureanceComapny: { type: String, require: true, trim: true },
  broker: { type: String, require: true, trim: true },
  make: { type: String, require: true, trim: true },
  model: { type: String, require: true, trim: true },
  fuelType: { type: String, require: true, trim: true },
  RTO: { type: String, require: true, trim: true },
  seatCapacity: { type: String, require: true, trim: true },
  cc: { type: Number, require: true, trim: true },
  registerDate: { type: String, require: true, trim: true },
  ncb: { type: String, require: true, trim: true },
  vechileNumber: { type: String, require: true, trim: true },
  policyNumber: { type: String, require: true, trim: true },
  fullName: { type: String, require: true, trim: true },
  emailId: { type: String, require: true, trim: true },
  phoneNumber: { type: String, require: true, trim: true },
  mfgYear: { type: String, require: true, trim: true },
  tenure: { type: Number, require: true, trim: true },
  issueDate: { type: String, require: true, trim: true },
  endDate: { type: String, require: true, trim: true },
  idv: { type: Number, require: true, trim: true },
  od: { type: Number, require: true, trim: true },
  tp: { type: Number, require: true, trim: true },
  netPremium: { type: Number, require: true, trim: true },
  finalPremium: { type: Number, require: true, trim: true },
  paymentMode: { type: String, require: true, trim: true },
  madeBy: { type: String, require: true, trim: true },
  rcFront: { type: String, required: true, trim: true },
  rcBack: { type: String, required: true, trim: true },
  previousPolicy: { type: String, required: true, trim: true },
  survey: { type: String, required: true, trim: true },
  puc: { type: String, required: true, trim: true },
  fitness: { type: String, required: true, trim: true },
  propsal: { type: String, required: true, trim: true },
  currentPolicy: { type: String, required: true, trim: true },
  other: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date , default: null}
});

//Model
const MotorPolicyModel = mongoose.model("motorPolicy", motorpolicySchema);

export default MotorPolicyModel;