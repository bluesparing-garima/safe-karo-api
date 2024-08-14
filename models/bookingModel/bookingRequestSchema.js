import mongoose from 'mongoose';

// const DocumentSchema = new mongoose.Schema({
//     docName: { 
//         type: String, 
//     },
//     file: { type: String},
// });

const bookingRequestSchema = new mongoose.Schema({
    partnerId:{type:String,trim:true},
    partnerName:{type:String,trim:true},
    relationshipManagerId: { type: String, default: "", trim: true },
    relationshipManagerName: { type: String, default: "", trim: true },
    bookingCreatedBy:{type:String, trim:true},
    policyNumber: { type: String, trim: true },
    category: { type: String, trim: true },
    caseType: { type: String, trim: true },
    policyType: { type: String, trim: true },
    productType: { type: String, trim: true },
    subCategory: { type: String, trim: true },
    companyName: { type: String, trim: true },
    rcFront: { type: String, trim: true },
    rcBack: { type: String, trim: true },
    previousPolicy: { type: String, trim: true },
    survey: { type: String, trim: true },
    puc: { type: String, trim: true },
    fitness: { type: String, trim: true },
    proposal: { type: String, trim: true },
    currentPolicy: { type: String, trim: true },
    other: { type: String, trim: true },
    bookingStatus:{type:String,trim:true},
    bookingAcceptedBy:{type:String,trim:true},
    leadId:{type:String,trim:true},
    timer: { type: String },
    createdBy: { type: String, trim: true },
    createdOn: { type: Date, default: Date.now },
    updatedBy: { type: String, default: null },
    updatedOn: { type: Date, default: null },
    isActive:{type:Boolean,default:true}
});

// Middleware to update timestamps on save
bookingRequestSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdOn = Date.now();
        this.updatedOn = null;
    } else {
        this.updatedOn = Date.now();
    }
    next();
});

// Middleware to handle updates specifically
bookingRequestSchema.pre('findOneAndUpdate', function (next) {
    this._update.updatedOn = Date.now(); 
    next();
});

const BookingRequestModel = mongoose.model('BookingRequest', bookingRequestSchema);

export default BookingRequestModel;
