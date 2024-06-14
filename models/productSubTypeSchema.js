import mongoose from 'mongoose';

const productSubTypesSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      default: null,
    },
    productName: {
      type: String,
      default: null,
    },
    productType: {
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

const ProductSubTypeModel = mongoose.model('ProductType', productSubTypesSchema);

export default ProductSubTypeModel;
