import mongoose from "mongoose";

const areaSchema = new mongoose.Schema({
  area: {
    type: String,
    required: true,
    trim: true,
  },
  cityId: { type: String, required: true },
  cityName: { type: String, required: true },
  stateId: { type: String, required: true },
  stateName: { type: String, required: true },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    default: "Relationship Manager"
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: String,
  },
  updatedOn: {
    type: Date,
  },
});

// Export the model
const AreaModel = mongoose.model("Area", areaSchema);
export default AreaModel;
