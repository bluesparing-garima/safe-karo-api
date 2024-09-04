import mongoose from "mongoose";

const pdfDataSchema = new mongoose.Schema({
  policyNumber: { type: String, trim: true },
  netPremium: { type: Number, trim: true },
  totalIDV: { type: Number, trim: true },
  mfgYear: { type: Date, trim: true },
  ccKw: { type: Number, trim: true },
  seatingCapacity: { type: Number, trim: true },
  policyType: { type: String, trim: true },
  fuelType: { type: String, trim: true },
  TP: { type: Number, trim: true },
  OD: { type: Number, trim: true },
  issuedDate: { type: Date, trim: true },
  endDate: { type: Date, trim: true },
  typeOfCover: { type: String, trim: true },
  fullName: { type: String, trim: true },
  broker: { type: String, trim: true },
  phoneNumber: { type: String, trim: true },
  make: { type: String, trim: true },
  model: { type: String, trim: true },
  productType: { type: String, trim: true },
  category: { type: String, trim: true },
  finalPremium: { type: Number, trim: true },
  companyName: { type: String, trim: true },
});

const PdfData = mongoose.model("PdfData", pdfDataSchema);

export default PdfData;
