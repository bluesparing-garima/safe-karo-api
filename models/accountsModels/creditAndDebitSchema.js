import mongoose from 'mongoose';

const creditAndDebitSchema = new mongoose.Schema({
    type:{
        type:String,
        trim:true
    },
    account:{
        type:String,
        trim:true
    },
    accountCode:{
        type:String,
        trim:true
    },
    amount:{
        type:Number,
        trim:true
    },
    userName:{
        type:String,
        trim:true
    },
    remarks:{
        type:String,
        trim:false
    },
});

export default mongoose.model('creditAndDebit', creditAndDebitSchema);