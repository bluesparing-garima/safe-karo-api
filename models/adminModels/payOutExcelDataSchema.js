import mongoose from 'mongoose';

const PayOutDataSchema = new mongoose.Schema({
    productType: {type:String,trim:true},
    subCategory:  {type:String,trim:true},
    fuelType:  {type:String,trim:true},
    engine:  {type:String,trim:true}, // value coming from CC from frontend.
    weight:{type:Number,trim:true},
    ncb:  {type:String,trim:true},
    policyType:  {type:String,trim:true},
    rto:  {type:String,trim:true},
    caseType:  {type:String,trim:true},
    companyName:  {type:String,trim:true},
    make: {type:String,trim:true},
    model: {type:String,trim:true},
    vehicleAge:  {type:String,trim:true},
    od:  {type:Number,trim:true},
    tp:  {type:Number,trim:true},
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
PayOutDataSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdOn = Date.now();
        this.updatedOn = null;
    } else {
        this.updatedOn = Date.now();
    }
    next();
});

// Middleware to handle updates specifically
PayOutDataSchema.pre('findOneAndUpdate', function (next) {
    this._update.updatedOn = Date.now(); 
    next();
});

const PayOutExcelDataModel = mongoose.model('PayOutExcelData', PayOutDataSchema);

export default PayOutExcelDataModel;
