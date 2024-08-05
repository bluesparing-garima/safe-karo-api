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
    type: String,
    trim: true,
  }
});

const StatementManage = mongoose.model(
  "StatementManage",
  statementManageSchema
);
export default StatementManage;
