import mongoose from "mongoose";


const leadCommentsAndQuotationSchema = mongoose.Schema({
    agentID:{
        type: String,
        required: true,
    },
    leadID : {
        type: String,
        required: true
    },
    status:{
        type:String
    },
    comments:{
        type:String
    },
    quotation:{
        type:String
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
leadCommentsAndQuotationSchema.pre('save', function (next) {
  if (this.isNew) {
      this.createdOn = Date.now();
      this.updatedOn = null;
  } else {
      this.updatedOn = Date.now();
  }
  next();
});

// Middleware to handle updates specifically
leadCommentsAndQuotationSchema.pre('findOneAndUpdate', function (next) {
  this._update.updatedOn = Date.now();
  next();
});

const leadCommentsAndQuotationModel =  mongoose.model("leadCommentsAndQuotation",leadCommentsAndQuotationSchema);

export default leadCommentsAndQuotationModel;