import mongoose from "mongoose";

const accountManageSchema = new mongoose.Schema({
  transactionCode:{
    type:String,
    trim:true,
  },
  accountType: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    trim: true,
  },
  accountId: {
    type: String,
    trim: true,
  },
  accountCode: {
    type: String,
    trim: true,
  },
  amount: {
    type: Number,
    trim: true,
  },
  userName: {
    type: String,
    trim: true,
  },
  userId: {
    type: String,
    trim: true,
  },
  partnerId: {
    type: String,
    trim: true,
  },
  partnerName: {
    type: String,
    trim: true,
  },
  partnerBalance:{
    type:Number,
    trim:true,
  },
  brokerId: {
    type: String,
    trim: true,
  },
  brokerName: {
    type: String,
    trim: true,
  },
  remarks: {
    type: String,
    trim: false,
  },
  policyNumber: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
    trim: true,
  },
  endDate:{
    type: Date,
    trim: true,
  },
  distributedDate:{
    type: Date,
    trim: true,
  },
  employeeId:{
    type: String,
    trim: true,
  },
  employeeName:{
    type: String,
    trim: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
    trim: true,
  },
  updatedOn: {
    type: Date,
    default: null,
  },
  updatedBy: {
    type: String,
    trim: true,
  },
});

// Middleware to update timestamps on save
accountManageSchema.pre("save", function (next) {
  if (this.isNew) {
    this.createdOn = Date.now();
    this.updatedOn = null;
  } else {
    this.updatedOn = Date.now();
  }
  next();
});

// Middleware to handle updates specifically
accountManageSchema.pre("findOneAndUpdate", function (next) {
  this._update.updatedOn = Date.now();
  next();
});

export default mongoose.model("accountManage", accountManageSchema);