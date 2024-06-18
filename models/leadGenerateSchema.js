import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
    docName: { type: String, required: true },
    file: { type: String, required: true },
  });

const leadGenerateSchema = new mongoose.Schema({
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
    comments:{
        type:String,
        required:true
    },
    documents: [DocumentSchema],
    comments:[],
    remarks:{
        type:String,
    },
    quotation:{
        type:String,
    }
})

const leadGenerateModel = mongoose.model('leadGenerate', leadGenerateSchema);

export default leadGenerateModel;
