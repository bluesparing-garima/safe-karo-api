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
  leadCreatedBy: { type: String, trim: true },
  // leadAcceptedBy:{type:String,trim:true},
  policyType: { type: String, trim: true, required: true },
  caseType: { type: String, trim: true, required: true },
  category: { type: String, trim: true },
  companyName: { type: String, trim: true, required: true },
  status: { type: String, trim: true },
  rcFront: { type: String, trim: true },
  rcBack: { type: String, trim: true },
  previousPolicy: { type: String, trim: true },
  survey: { type: String, trim: true },
  puc: { type: String, trim: true },
  fitness: { type: String, trim: true },
  proposal: { type: String, trim: true },
  currentPolicy: { type: String, trim: true },
  other: { type: String, trim: true },
  remarks: { type: String },
  createdBy: { type: String, trim: true },
  updatedBy: { type: String, default: null },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
});

const leadGenerateModel = mongoose.model("leadGenerate", leadGenerateSchema);

export default leadGenerateModel;
