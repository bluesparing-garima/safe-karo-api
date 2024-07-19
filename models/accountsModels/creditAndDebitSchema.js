import mongoose from 'mongoose';

const creditAndDebitSchema = new mongoose.Schema({
    type:{
        type:String,
        trim:true
    },
    accountId:{
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
    userId:{
        type: String,
        trim: true
    },
    remarks:{
        type:String,
        trim:false
    },
    createdOn:{
        type:Date,
        default: Date.now
    },
    createdBy:{
        type: String,
        trim: true
    },
    updatedOn:{
        type: Date,
        default: null
    },
    updatedBy:{
        type: String,
        trim: true
    }
});

// Middleware to update timestamps on save
creditAndDebitSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdOn = Date.now();
        this.updatedOn = null;
    } else {
        this.updatedOn = Date.now();
    }
    next();
});

// Middleware to handle updates specifically
creditAndDebitSchema.pre('findOneAndUpdate', function (next) {
    this._update.updatedOn = Date.now(); 
    next();
});

export default mongoose.model('creditAndDebit', creditAndDebitSchema);