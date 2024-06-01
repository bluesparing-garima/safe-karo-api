import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
const uuid = uuidv4();

const roleSchema = new mongoose.Schema({
  uuid: {
    type: String,
    unique: true,
    default: uuid
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
  created_By: {
    type: String,
    required: true,
  },
  created_At: {
    type: Date, default: Date.now()
  },
  phoneNumber: {
    type: String,
    required: true
  },
  assigned_role: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

//Model
const RoleModel = mongoose.model('roles', roleSchema);

export default RoleModel;