import mongoose from "mongoose";

// const DocumentSchema = new mongoose.Schema({
//     docName: { type: String, trim: true },
//     file: { type: String, trim: true },
//   });
//
//   quotationImage: [DocumentSchema],

const leadQuotationSchema = new mongoose.Schema({
  leadId: {
    type: String,
    required: true,
    trim: true,
  },
  quotationImage: {
    type: String,
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
  operationId: {
    type: String,
  },
  operationName:{
    type:String,
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
