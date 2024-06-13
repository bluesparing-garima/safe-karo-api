
import mongoose from 'mongoose';

const productNamesSchema = new mongoose.Schema(
  {
    productName: {
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
  },
);

const ProductNamesModel = mongoose.model('ProductName', productNamesSchema);

export default ProductNamesModel;
