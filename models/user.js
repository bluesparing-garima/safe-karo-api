import mongoose from "mongoose";

//Definind Schema
const userSchema = new mongoose.Schema({
  name: { type: String, require: true, trim: true },
  email: { type: String, require: true, trim: true, unique: true },
  password: { type: String, require: true, trim: true },
  phoneNumber: { type: String, require: true, trim: true },
  createdOn: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  // profile: {
  //   firstName: { type: String },
  //   lastName: { type: String },
  //   address: { type: String },
  //   phoneNumber: {type: String},
  //   pancardImage: {type: String},
  //   aadharCardImage: { type: String},
  //   photo: { type: String},
  //   bankDetails: {
  //     bankName: { type: String},
  //     accountNumber: { type: String},
  //     ifscCode: {type: String}   
  //   }
  // },
});

//Model
const UserModel = mongoose.model('appUser', userSchema)

export default UserModel