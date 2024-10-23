import mongoose from "mongoose"

const citySchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    trim: true,
  },
  stateId: {
    type: String,
    trim:true,
    required: true,
  },
  stateName: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    required: true,
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
const CityModel = mongoose.model('City', citySchema);
export default CityModel;