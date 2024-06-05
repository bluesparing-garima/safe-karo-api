import mongoose from "mongoose";

//Definind Schema
const userSchema = new mongoose.Schema({
  name: { type: String, require: true, trim: true },
  email: { type: String, require: true, trim: true, unique: true },
  password: { type: String, require: true, trim: true },
  phoneNumber: { type: String, require: true, trim: true },
  createdOn: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
});

//Model
const UserModel = mongoose.model('appUser', userSchema)

export default UserModel