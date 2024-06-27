import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  docName: { type: String, trim: true },
  file: { type: String, trim: true },
});

const leadGenerateSchema = new mongoose.Schema({
  partnerId: { type: String, default: "", trim: true },
  partnerName: { type: String, default: "", trim: true },
  relationshipManagerId: { type: String, default: "", trim: true },
  relationshipManagerName: { type: String, default: "", trim: true },
  leadCreatedBy:{type:String,trim:true},
  // leadAcceptedBy:{type:String,trim:true},
  policyType: { type: String, trim: true },
  caseType: { type: String, trim: true },
  category: { type: String, trim: true },
  companyName: { type: String, trim: true },
  status: { type: String, trim: true },
  documents: [DocumentSchema],
  remarks: { type: String },
  createdBy: { type: String, trim: true },
  updatedBy: { type: String, default: null },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
});

const leadGenerateModel = mongoose.model("leadGenerate", leadGenerateSchema);

export default leadGenerateModel;
