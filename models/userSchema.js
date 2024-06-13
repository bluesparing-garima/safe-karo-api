import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true, trim: true },
  phoneNumber: { type: Number, required: true, trim: true },
  role: { type: String, required: true, trim: true }, 
  createdOn: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }, // Add isActive field
});

const UserModel = mongoose.model("appUser", userSchema);

export default UserModel;
