import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema({
    vehicleType: String,
    subCategory: String,
    fuelType: String,
    engine: String,
    ncb: String,
    policyType: String,
    rto: String,
    insuredType: String,
    caseType: String,
    companyName: String,
    make: String,
    model: String,
    age: String,
    od: Number,
    tp: Number,
}, { timestamps: true });

const ExcelDataModel = mongoose.model('ExcelData', DataSchema);
export default ExcelDataModel;

