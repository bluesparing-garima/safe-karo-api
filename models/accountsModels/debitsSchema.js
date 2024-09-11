import mongoose from "mongoose";

const debitSchema = new mongoose.Schema({
  transactionCode:{type:String,trim:true},
  policyNumber: { type: String, trim: true },
  partnerId: { type: String, trim: true },
  payOutAmount: { type: Number, trim: true },
  payOutCommission: { type: Number, default: 0 },
  payOutPaymentStatus: { type: String, trim: true, default: "UnPaid" },
  payOutBalance: { type: Number, default: 0 },
  policyDate: { type: String, trim: true },
  paymentCreatedBy: { type: String, trim: true },
  paymentUpdatedBy: { type: String, default: null },
  paymentCreatedOn: { type: Date, default: Date.now },
  paymentUpdatedOn: { type: Date, default: Date.now },
  remarks:{type:String,trim:true},  
  distributedDate:{
    type: Date,
    trim: true,
  },
});

const debits = mongoose.model("debit", debitSchema);
export default debits;
