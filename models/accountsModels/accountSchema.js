import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    trim: true,
  },
  accountHolderName: {
    type: String,
    trim: true,
  },
  IFSCCode: {
    type: String,
    trim: true,
  },
  amount: {
    type: Number,
    trim: true,
  },
  bankName: {
    type: String,
    trim: true,
  },
  accountCode: {
    type: String,
    trim: true,
  },
  createdOn:{
    type: Date,
    default: Date.now,
  },
  createdBy:{
    type: String,
    trim: true,
  },
  updatedOn:{
    type: Date,
    default: null,
  },
  updatedBy:{
    type: String,
    trim: true,
  },
});


// Middleware to update timestamps on save
accountSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdOn = Date.now();
        this.updatedOn = null;
    } else {
        this.updatedOn = Date.now();
    }
    next();
});

// Middleware to handle updates specifically
accountSchema.pre('findOneAndUpdate', function (next) {
    this._update.updatedOn = Date.now(); 
    next();
});


export default mongoose.model("Account", accountSchema);
