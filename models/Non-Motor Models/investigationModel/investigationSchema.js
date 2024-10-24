import mongoose from "mongoose"

const investigationSchema = new mongoose.Schema({
  investigation: {
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
const InvestigationModel = mongoose.model('Investigation', investigationSchema);
export default InvestigationModel;