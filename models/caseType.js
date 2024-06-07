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
      default: null,
    },
  },

);

const CaseTypeModel = mongoose.model('CaseType', caseTypeSchema);

export default CaseTypeModel;
