import mongoose from "mongoose";
// import leadGenerateModel from "./leadGenerateSchema.js";
const leadPaymentSchema = new mongoose.Schema({
  leadId: {
    type: String,
    required: true,
  },
  paymentLink: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  remarks: {
    type: String,
    required: true,
  },
  operationId: {
    type: String,
  },  
  operationName:{
    type:String,
  },
  partnerId: {
    type: String,
    required: true,
  },
  partnerName:{
    type:String,
    required:true
  },
  createdBy: {
    type: String,
    trim: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: String,
    default: null,
  },
  updatedOn: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const leadPaymentModel = mongoose.model("leadPayment", leadPaymentSchema);
export default leadPaymentModel;
