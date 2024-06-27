import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
    docName: { 
        type: String, 
    },
    file: { type: String},
});

const bookingRequestSchema = new mongoose.Schema({
    partnerId:{type:String,trim:true},
    partnerName:{type:String,trim:true},
    bookingCreatedBy:{type:String, trim:true},
    policyNumber: { type: String, trim: true },
    category: { type: String, trim: true },
    caseType: { type: String, trim: true },
    policyType: { type: String, trim: true },
    productType: { type: String, trim: true },
    subCategory: { type: String, trim: true },
    companyName: { type: String, trim: true },
    // documents: {
    //     type: [DocumentSchema],
    //     validate: {
    //         validator: function(docs) {
    //             return docs.some(doc => doc.docName === 'policyPDF');
    //         },
    //         message: 'At least one document must have docName "policyPDF"'
    //     },
    // },
    // policyPDF:{type:String,trim:true},
    documents:[DocumentSchema],
    bookingStatus:{type:String,trim:true},
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
