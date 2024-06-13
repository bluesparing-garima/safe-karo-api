import mongoose from "mongoose";

// define schema
const policyTypeSchema = new mongoose.Schema({
  policyType: { type: String, require: true, trim: true },
  createdBy: { type: String, require: true, trim: true },
  updatedBy: {
    type: String,
    default: null,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  updatedOn: {
    type: Date,
    default: null,
  },
});

const PolicyTypeModel = mongoose.model("policyType", policyTypeSchema);
export default PolicyTypeModel;
