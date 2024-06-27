import mongoose from 'mongoose';

const productNamesSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    categoryId:{
      type:String,
      required:true,
    },
    categoryName:{
      type:String,
      required:true,
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

const ProductNamesModel = mongoose.model('Product', productNamesSchema);

export default ProductNamesModel;
