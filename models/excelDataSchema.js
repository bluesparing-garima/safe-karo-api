import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema({
    productType: String,
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
    vehicleAge: String,
    od: Number,
    tp: Number,
    createdBy: {
        type: String,
    },
    createdOn: {
        type: Date,
        default: Date.now,
    },
    updatedBy: {
        type: String,
        default: null,
    },
    updatedOn: {
        type: Date,
        default: null,
    },
});

// Middleware to update timestamps on save
DataSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdOn = Date.now(); // Set createdOn to the current date on document creation
        this.updatedOn = null; // Ensure updatedOn is null on creation
    } else {
        this.updatedOn = Date.now(); // Set updatedOn to the current date on document update
    }
    next();
});

// Middleware to handle updates specifically
DataSchema.pre('findOneAndUpdate', function (next) {
    this._update.updatedOn = Date.now(); // Set updatedOn to the current date on document update
    next();
});

const ExcelDataModel = mongoose.model('ExcelData', DataSchema);

export default ExcelDataModel;
