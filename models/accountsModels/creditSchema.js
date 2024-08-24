import mongoose from "mongoose";

const creditSchema = new mongoose.Schema({
  transactionCode:{type:String,trim:true},
  policyNumber: { type: String, trim: true },
  partnerId: { type: String, trim: true },
  payInAmount: { type: Number, trim: true },
  payInCommission: { type: Number, default: 0 },
  payInPaymentStatus: { type: String, trim: true, default: "UnPaid" },
  payInBalance: { type: Number, default: 0 },
  policyDate: { type: String, trim: true },
  paymentCreatedBy: { type: String, trim: true },
  paymentUpdatedBy: { type: String, default: null },
  paymentCreatedOn: { type: Date, default: Date.now },
  paymentUpdatedOn: { type: Date, default: Date.now },
});

const credits = mongoose.model("credit", creditSchema);
export default credits;
