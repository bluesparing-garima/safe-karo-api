import mongoose from 'mongoose';

const caseTypesSchema = new mongoose.Schema(
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
  },

);

const CaseTypesModel = mongoose.model('CaseType', caseTypesSchema);

export default CaseTypesModel;
