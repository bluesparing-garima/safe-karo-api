import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  docName: { type: String, required: true },
  file: { type: String, required: true },
});

const MotorPolicySchema = new mongoose.Schema(
  {
    policyType: { type: String, trim: true }, // package
    caseType: { type: String, trim: true }, // new, renewal
    category: { type: String, trim: true }, // motor,health
    subCategory: { type: String, trim: true, default: "" }, //
    companyName: { type: String, trim: true },
    broker: { type: String, trim: true },
    vehicleAge: { type: String, trim: true },
    make: { type: String, trim: true },//company of vehicle
    model: { type: String, trim: true },// company 
    fuelType: { type: String, trim: true },
    rto: { type: String, trim: true },
    vehicleNumber: { type: String, trim: true },
    seatingCapacity: { type: String, trim: true },
    engine: { type: Number, trim: true },
    cc: { type: String, trim: true },
    ncb: { type: String, trim: true },
    policyNumber: { type: String, default: "", trim: true },
    fullName: { type: String, trim: true },
    emailId: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    mfgYear: { type: String, trim: true },
    tenure: { type: String, trim: true },
    registrationDate: { type: Date, trim: true },
    endDate: { type: Date, trim: true },
    issueDate: { type: Date, trim: true },
    idv: { type: String, trim: true },
    od: { type: String, trim: true },
    tp: { type: String, trim: true },
    odPremium:{type:String,trim:true},
    tpPremium:{type:String,trim:true},
    policyStatus:{type:String, trim:true},
    netPremium: { type: String, trim: true },
    finalPremium: { type: String, trim: true },
    paymentMode: { type: String, trim: true },
    policyCreatedBy: { type: String, trim: true },
    partnerId: { type: String, default: "", trim: true },
    partnerName: { type: String, default: "", trim: true },
    relationshipManagerId: { type: String, default: "", trim: true },
    relationshipManagerName: { type: String, default: "", trim: true },
    paymentDetails: { type: String, default: "", trim: true },
    productType: { type: String, default: "", trim: true },
    documents: [DocumentSchema],
    isActive: { type: Boolean, default: true, trim: true }, // Add isActive field
  },
  { timestamps: true }
);

export default mongoose.model("MotorPolicy", MotorPolicySchema);
