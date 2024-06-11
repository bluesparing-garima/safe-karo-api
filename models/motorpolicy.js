import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  docName: { type: String, required: true },
  file: { type: String, required: true }, // Base64 encoded file
});

const MotorPolicySchema = new mongoose.Schema(
  {
    policyType: { type: String, require: true },
    caseType: { type: String, require: true },
    category: { type: String, require: true },
    companyName: { type: String, require: true },
    broker: { type: String, require: true },
    make: { type: String, require: true },
    model: { type: String, require: true },
    fuelType: { type: String, require: true },
    seatingCapacity: { type: String, require: true },
    ncb: { type: String, require: true },
    vehicleNumber: { type: String, require: true },
    fullName: { type: String, require: true },
    emailId: { type: String, require: true },
    phoneNumber: { type: String, require: true },
    mgfYear: { type: String, require: true },
    tenure: { type: String, require: true },
    cc: { type: String, require: true },
    idv: { type: String, require: true },
    od: { type: String, require: true },
    tp: { type: String, require: true },
    netPremium: { type: String, require: true },
    finalPremium: { type: String, require: true },
    paymentMode: { type: String, require: true },
    rto: { type: String, require: true },
    documents: [DocumentSchema], // Array of documents
  },
  { timestamps: true }
);

export default mongoose.model("MotorPolicy", MotorPolicySchema);
