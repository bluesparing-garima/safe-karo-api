import mongoose from "mongoose";
// import leadGenerateModel from "./leadGenerateSchema.js";

const leadQuotationSchema = new mongoose.Schema({
  leadId: {
    type: String,
    required: true,
    trim: true,
  },
  quotationImage: {
    type: String,
    required: true,
    trim: true,
  },
  comments: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    required: true,
    trim: true,
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

const leadQuotationModel = mongoose.model("leadQuotation", leadQuotationSchema);
export default leadQuotationModel;
