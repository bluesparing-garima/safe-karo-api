import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  docName: { type: String, required: true },
  file: { type: String, required: true },
});

const MotorPolicySchema = new mongoose.Schema(
  {
    policyType: { type: String },
    caseType: { type: String },
    policyCategory: { type: String },
    category: { type: String },
    subCategory: { type: String, default: "" },
    companyName: { type: String },
    broker: { type: String },
    make: { type: String },
    model: { type: String },
    fuelType: { type: String },
    rto: { type: String },
    vehicleNumber: { type: String },
    seatingCapacity: { type: String },
    cc: { type: String },
    ncb: { type: String },
    policyNumber: { type: String, default: "" },
    fullName: { type: String },
    emailId: { type: String },
    phoneNumber: { type: String },
    mfgYear: { type: String },
    tenure: { type: String },
    registrationDate: { type: Date },
    endDate: { type: Date },
    issueDate: { type: Date },
    idv: { type: String },
    od: { type: String },
    tp: { type: String },
    netPremium: { type: String },
    finalPremium: { type: String },
    paymentMode: { type: String },
    policyCreatedBy: { type: String },
    documents: [DocumentSchema],
    partnerId: { type: String, default: "" },
    partnerName: { type: String, default: "" },
    relationshipManagerId: { type: String, default: "" },
    relationshipManagerName: { type: String, default: "" },
    isActive: { type: Boolean, default: true }, // Add isActive field
  },
  { timestamps: true }
);

export default mongoose.model("MotorPolicy", MotorPolicySchema);
