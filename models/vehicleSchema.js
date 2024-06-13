import mongoose from 'mongoose';

const vehicleNamesSchema = new mongoose.Schema(
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
  },
);

const VehicleNamesModel = mongoose.model('VehicleName', vehicleNamesSchema);

export default VehicleNamesModel;
