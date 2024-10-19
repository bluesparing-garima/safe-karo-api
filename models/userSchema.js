import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true},
  email: { type: String, required: true, trim: true, unique: true },
  dateOfBirth: { type: Date, trim: true },
  gender: { type: String, trim: true },
  password: { type: String, required: true},
  phoneNumber: { type: Number, required: true},
  role: { type: String, required: true}, 
  partnerId:{type:String},
  partnerCode:{type:String,trim:true,unique:true},
  branchName: { type: String, trim: true },
  address: { type: String, trim: true },
  pincode: { type: String, trim: true },
  profileImage: { type: String, trim: true },
  image: { type: String, trim: true },
  adharCardFront: { type: String, trim: true },
  adharCardBack: { type: String, trim: true },
  panCard: { type: String, trim: true },
  qualification: { type: String, trim: true },
  bankProof: { type: String, trim: true },
  experience: { type: String, trim: true },
  other: { type: String, trim: true },
  joiningDate: { type: Date, trim: true },
  createdOn: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  headRMId: { type: String, trim: true },
  headRM: { type: String, trim: true },
  bankName: { type: String, trim: true },
  IFSC: { type: String, trim: true },
  accountHolderName: { type: String, trim: true },
  accountNumber: { type: String, trim: true },
  salary: { type: Number, trim: true },
  originalPassword: { type: String, trim: true },
});

const UserModel = mongoose.model("appUser", userSchema);

export default UserModel;
