import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema({
    vehicleType: String,
    fuelType: String,
    Engine: String,
    ncb: String,
    policyType: String,
    caseType: String,
    companyName: String,
    make: String,
    model: String,
    age: String,
    OD: Number,
    TP: Number,
    RTO: String,
}, { timestamps: true });

const DataModel = mongoose.model('Data', DataSchema);
export default DataModel;
