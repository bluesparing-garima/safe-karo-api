import mongoose from 'mongoose';

const modelSchema = new mongoose.Schema(
  {
    makeId:{
        type:String,
    },
    makeName: {
      type: String,
    },
    modelName:{
        type:String,
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

const Model = mongoose.model('Model', modelSchema);

export default Model;
