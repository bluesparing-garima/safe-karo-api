import mongoose from 'mongoose';

const caseTypeSchema = new mongoose.Schema(
  {
    caseType: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
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
  },
  {
    timestamps: Date.now, // Automatically manages createdAt and updatedAt fields
  }
);

const CaseTypeModel = mongoose.model('CaseType', caseTypeSchema);

export default CaseTypeModel;
