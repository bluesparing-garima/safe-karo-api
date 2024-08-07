import mongoose from "mongoose";

const debitSchema = new mongoose.Schema({
  policyNumber: { type: String, trim: true },
  partnerId: { type: String, trim: true },
  payOutAmount: { type: Number, trim: true },
  payOutCommission: { type: Number, default: 0 },
  payOutPaymentStatus: { type: String, trim: true, default: "UnPaid" },
  payOutBalance: { type: Number, default: 0 },
  policyDate: { type: String, trim: true },
  createdBy: { type: String, trim: true },
  updatedBy: { type: String, default: null },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now },
});

const debits = mongoose.model("debit", debitSchema);
export default debits;
