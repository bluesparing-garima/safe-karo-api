import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true},
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true},
  phoneNumber: { type: Number, required: true},
  role: { type: String, required: true}, 
  partnerId:{type:String,required:true},
  createdOn: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

const UserModel = mongoose.model("appUser", userSchema);

export default UserModel;
