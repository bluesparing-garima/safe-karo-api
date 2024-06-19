import mongoose from "mongoose";

const leadGeneratePaymentSchema = mongoose.Schema({
     agentID:{
        type: String,
        required: true,
     },
     leadID:{
        type: String,
        required: true,
     },
     paymentStatus:{
        type: String,
     },
     paymentProof:{
        type: String,
    },
    paymentLink:{
        type: String,
    },
    createdBy: {
        type: String,
        required: true,
    },
    updatedBy: {
        type: String,
        default: null,
      },
    createdOn: {
        type: Date,
        default: Date.now,
      },
    updatedOn: {
        type: Date,
        default: Date.now,
    },
})

// Middleware to update timestamps on save
leadGeneratePaymentSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdOn = Date.now();
        this.updatedOn = null;
    } else {
        this.updatedOn = Date.now();
    }
    next();
});

// Middleware to handle updates specifically
leadGeneratePaymentSchema.pre('findOneAndUpdate', function (next) {
    this._update.updatedOn = Date.now();
    next();
});

const leadGeneratePaymentModel = mongoose.model("leadGeneratePayment",leadGeneratePaymentSchema);
export default leadGeneratePaymentModel;