import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const uuid = uuidv4();

const roleSchema = new mongoose.Schema({
  uuid: {
    type: String,
    unique: true,
    default: uuid,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  assignedRole: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const RoleModel = mongoose.model("roleassigneed", roleSchema);

export default RoleModel;
