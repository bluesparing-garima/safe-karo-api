import mongoose from 'mongoose';

const fuelTypeSchema = new mongoose.Schema(
  {
    fuelType: {
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

const FuelTypeModel = mongoose.model('Fuel', fuelTypeSchema);

export default FuelTypeModel;
