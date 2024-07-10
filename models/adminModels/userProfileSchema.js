import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  docName: { type: String, trim: true },
  file: { type: String, trim: true },
});

const userProfileSchema = new mongoose.Schema({
  // fields which should be in userProfile.
  branchName: { type: String, trim: true },
  role: { type: String, trim: true },
  headRMId: { type: String, trim: true },
  headRM: { type: String, trim: true },
  bankName: { type: String, trim: true },
  IFSC: { type: String, trim: true },
  accountHolderName: { type: String, trim: true },
  accountNumber: { type: String, trim: true },
  salary: { type: Number, trim: true },
  joiningDate: { type: String, trim: true },

  // fields which are in partners
  password: { type: String, trim: true },
  originalPassword: { type: String, trim: true },
  wallet: { type: Number, trim: true, default: 0 },

  // fields which are common.
  partnerId: { type: String, unique: true },
  fullName: { type: String, trim: true },
  phoneNumber: { type: String, trim: true },
  email: { type: String, trim: true, unique: true },
  dateOfBirth: { type: Date, trim: true },
  gender: { type: String, trim: true },
  address: { type: String, trim: true },
  pincode: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  image: { type: String, trim: true },
  adharCardFront: { type: String, trim: true },
  adharCardBack: { type: String, trim: true },
  panCard: { type: String, trim: true },
  qualification: { type: String, trim: true },
  bankProof: { type: String, trim: true },
  experience: { type: String, trim: true },
  other: { type: String, trim: true },
  createdBy: { type: String, trim: true },
  updatedBy: { type: String, default: null },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: null },
});

const UserModel = mongoose.model("UserProfile", userProfileSchema);

export default UserModel;
