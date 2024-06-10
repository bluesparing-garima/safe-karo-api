import mongoose from "mongoose";

const createRoleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      unique: true,
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
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
);

const CreateRoleModel = mongoose.model("newRoles", createRoleSchema);

export default CreateRoleModel;
