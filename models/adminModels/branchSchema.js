import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema(
  {
    branchName: {
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
  },
);

const BranchModel = mongoose.model('Branch', branchSchema);

export default BranchModel;
