import mongoose from 'mongoose';

const vehicleTypesSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      default: null,
    },
    vehicleName: {
      type: String,
      default: null,
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
);

const VehicleTypeModel = mongoose.model('VehicleType', vehicleTypesSchema);

export default VehicleTypeModel;
