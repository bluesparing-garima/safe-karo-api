import mongoose from 'mongoose';

const makeSchema = new mongoose.Schema(
  {
    makeName: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
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

const MakeModel = mongoose.model('Make', makeSchema);

export default MakeModel;
