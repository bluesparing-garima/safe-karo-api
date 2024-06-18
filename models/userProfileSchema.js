import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
    image: { type: String }, // base64 string
    adharCardFront: { type: String }, // base64 string
    adharCardBack: { type: String }, // base64 string
    panCard: { type: String }, // base64 string
    qualification: { type: String, trim: true },
    bankProof: { type: String }, // base64 string
  });

const userProfileSchema = new mongoose.Schema({
    branch: { type: String, required: true, trim: true },
    headRM: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    dateOfBirth: { type: Date },
    gender: { type: String },
    address: { type: String, trim: true },
    pincode: { type: String, trim: true },
    bankName: { type: String, trim: true },
    IFSC: { type: String, trim: true },
    accountHolderName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    salary: { type: Number },
    isActive: { type: Boolean, default: true }, // Add isActive field
    document:[DocumentSchema],
    createdBy: { type: String, required: true, trim: true },
    updatedBy: { type: String, default: null },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: null },
    isActive: { type: Boolean, default: true }, 
});

const UserModel = mongoose.model("UserProfile", userProfileSchema);

export default UserModel;
