import mongoose from "mongoose";

// define schema
const policyTypeSchema = new mongoose.Schema({
    policyType: { type: String, require: true, trim: true },
    createdBy: { type: String, require: true, trim: true},
    timeStamp: { type: Date, default: Date.now}
});

const PolicyTypeModel = mongoose.model('policyType', policyTypeSchema);
export default PolicyTypeModel;