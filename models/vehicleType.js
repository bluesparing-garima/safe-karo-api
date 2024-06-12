import mongoose from 'mongoose';

const vehicleTypesSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      default: null, // Initially set to null
    },
    vehicleType: {
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

const VehicleTypesModel = mongoose.model('VehicleType', vehicleTypesSchema);

export default VehicleTypesModel;
