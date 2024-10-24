import mongoose from "mongoose"

const stateSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
    trim: true,
  },
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
const StateModel = mongoose.model('State', stateSchema);
export default StateModel;