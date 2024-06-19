import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
    docName: { type: String, required: true },
    file: { type: String, required: true },
  });

const leadGenerateSchema = new mongoose.Schema({
    agentID:{
        type: String,
    },
    leadID:{
        type: String,
    },
    policyType :{
        type:String,
        required: true,
    },
    category:{
        type:String,
        required: true
    },
    subCategory:{
        type:String,
        required:true
    },
    company:{
    type:String,
    required:true
   },
    caseType:{
        type:String,
        required:true
    },
    policyStatus:{
        type:String,
        required:true
    },

    documents: [DocumentSchema],

    remarks:{
        type:String,
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
leadGenerateSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdOn = Date.now();
        this.updatedOn = null;
    } else {
        this.updatedOn = Date.now();
    }
    next();
});

// Middleware to handle updates specifically
leadGenerateSchema.pre('findOneAndUpdate', function (next) {
    this._update.updatedOn = Date.now(); 
    next();
});
const leadGenerateModel = mongoose.model('leadGenerate', leadGenerateSchema);

export default leadGenerateModel;
