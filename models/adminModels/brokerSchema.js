import mongoose from 'mongoose';

const brokerSchema = new mongoose.Schema(
  {
    brokerCode:{
      type:String,
    },
    brokerName: {
      type: String,
      required: true,
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
    isActive: {
      type: Boolean,
      default: true,    
    },
  },
);

const BrokerModel = mongoose.model('Broker', brokerSchema);

export default BrokerModel;
