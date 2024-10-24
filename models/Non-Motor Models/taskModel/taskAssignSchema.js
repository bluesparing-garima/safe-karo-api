import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  state: {
    type: String,
    trim: true,
  },
  stateId: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  cityId: {
    type: String,
    trim: true,
  },
  area: {
    type: String,
    trim: true,
  },
  areaId: {
    type: String,
    trim: true,
  },
  investigation: {
    type: String,
    trim: true,
  },
  investigationId: {
    type: String,
    trim: true,
  },
  employee: {
    type: String,
    trim: true,
  },
  employeeId: {
    type: String,
    trim: true,
  },
  relationshipManagerId: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    trim: true,
    default: "Created",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    default: "Relationship Manager",
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
const TaskModel = mongoose.model("Task", taskSchema);
export default TaskModel;
