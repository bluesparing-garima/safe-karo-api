import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    vehicleName: {
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

const VehicleModel = mongoose.model('Vehicle', vehicleSchema);

export default VehicleModel;
