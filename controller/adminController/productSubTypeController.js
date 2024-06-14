import ProductSubTypeModel from "../../models/productSubTypeSchema.js";

// Create a new product type
const createProductType = async (req, res) => {
  try {
    const { productId, productName, productType, createdBy, isActive } = req.body;

    // Check if all required fields are provided
    if (!productType || !createdBy) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newProductType = new ProductSubTypeModel({
      productId: productId || "",
      productName: productName || "",
      productType,
      createdBy,
      updatedBy: null, // Set updatedBy to null initially
      updatedOn: null, // Set updatedOn to null initially
      isActive: isActive !== undefined ? isActive : true, // Set isActive to true if not provided
    });

    await newProductType.save();
    res.status(200).json({
      status: "success",
      data: newProductType,
      message: "New product type created successfully",
    });
  } catch (error) {
    console.error("Error creating product type:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new product type",
      error: error.message,
    });
  }
};

// Get all product types
const getAllProductTypes = async (req, res) => {
  try {
    const productTypes = await ProductSubTypeModel.find({ isActive: true });
    res.status(200).json({
      status: "success",
      data: productTypes,
      message: "Success! Here are all product types",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve product types",
    });
  }
};

// Get product type by name
const getProductTypeByName = async (req, res) => {
  try {
    const { productType } = req.params;
    const product = await ProductSubTypeModel.findOne({ productType, isActive: true });
    if (!product) {
      return res
        .status(404)
        .json({ status: "failed", message: "Product type not found" });
    }
    res.status(200).json({
      status: "success",
      data: product,
      message: "Success! Here is the product type with specified name",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve product type",
    });
  }
};

// Get product type by ID
const getProductTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product type exists
    const product = await ProductSubTypeModel.findById(id);
    if (!product || !product.isActive) {
      return res
        .status(404)
        .json({ status: "failed", message: "Product type not found" });
    }
    res.status(200).json({
      status: "success",
      data: product,
      message: "Success! Here is the product type with specified ID",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve product type",
    });
  }
};

// Update product type
const updateProductType = async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy, isActive, ...updateData } = req.body;

    // Check if product type exists
    const existingProductType = await ProductSubTypeModel.findById(id);
    if (!existingProductType) {
      return res
        .status(404)
        .json({ status: "failed", message: "Product type not found" });
    }

    // Update the product type
    existingProductType.set({
      ...updateData,
      updatedBy,
      updatedOn: new Date(),
      isActive: isActive !== undefined ? isActive : existingProductType.isActive,
    });
    const updatedProductType = await existingProductType.save();

    res.status(200).json({
      status: "success",
      data: updatedProductType,
      message: `Product type ${id} updated successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update product type",
    });
  }
};

// Delete product type
const deleteProductType = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product type exists
    const existingProductType = await ProductSubTypeModel.findById(id);
    if (!existingProductType) {
      return res
        .status(404)
        .json({ status: "failed", message: "Product type not found" });
    }

    // Delete the product type
    await ProductSubTypeModel.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "Product type deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to delete product type",
    });
  }
};

export {
  createProductType,
  getAllProductTypes,
  getProductTypeByName,
  getProductTypeById,
  updateProductType,
  deleteProductType,
};
