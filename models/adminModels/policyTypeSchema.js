import mongoose from "mongoose";

// Define schema
const policyTypeSchema = new mongoose.Schema({
  policyType: { type: String, required: true, trim: true },
  createdBy: { type: String, required: true, trim: true },
  updatedBy: { type: String, default: null },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: null },
  isActive: { type: Boolean, default: true }, 
});

const PolicyTypeModel = mongoose.model("policyType", policyTypeSchema);
export default PolicyTypeModel;
