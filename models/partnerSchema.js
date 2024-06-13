// models/partnerId.js
import mongoose from 'mongoose';

const PartnerSchema = new mongoose.Schema({
    partnerId: { type: String },
    name: { type: String },
    mobile: { type: String },
    email: { type: String},
    dateOfBirth: { type: Date },
    gender: { type: String },
    password: { type: String },
    address: { type: String},
    pincode: { type: String },
    wallet: { type: Number },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date }
});

const PartnerModel = mongoose.model('PartnerId', PartnerSchema);
export default PartnerModel;
