import mongoose from 'mongoose';

const caseTypeSchema = new mongoose.Schema(
  {
    caseType: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
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
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  }
);

const CaseTypeModel = mongoose.model('CaseType', caseTypeSchema);

export default CaseTypeModel;
