import mongoose from "mongoose";
const { Schema } = mongoose;

const statementManageSchema = new Schema({
  partnerBalance: {
    type: Number,
    trim: true,
  },
  payOutAmount: {
    type: Number,
    trim: true,
  },
  startDate: {
    type: Date,
    trim: true,
  },
  endDate: {
    type: Date,
    trim: true,
  },
  partnerId: {
    type: String,
    trim: true,
  },
  accountId:{
     type: mongoose.Schema.Types.ObjectId, ref: 'Account' 
  },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now },
});

// Middleware to update timestamps on save
statementManageSchema.pre('save', function (next) {
  if (this.isNew) {
      this.createdOn = Date.now();
      this.updatedOn = null;
  } else {
      this.updatedOn = Date.now();
  }
  next();
});

// Middleware to handle updates specifically
statementManageSchema.pre('findOneAndUpdate', function (next) {
  this._update.updatedOn = Date.now(); 
  next();
});

const StatementManage = mongoose.model(
  "StatementManage",
  statementManageSchema
);
export default StatementManage;
