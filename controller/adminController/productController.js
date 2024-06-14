import ProductModel from "../../models/productSchema.js";

// Create a new product name
const createProductName = async (req, res) => {
  try {
    const { productName,categoryId,categoryName,createdBy, isActive } = req.body;

    // Check if all required fields are provided
    if (!categoryId || !categoryName || !productName || !createdBy) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newProductName = new ProductModel({
      categoryId,
      categoryName,
      productName,
      createdBy,
      updatedBy: null,
      updatedOn: null,
      isActive: isActive !== undefined ? isActive : true, // Set isActive to the provided value or default to true
    });

    await newProductName.save();
    res.status(200).json({
      message: "New product name created successfully",
      data: newProductName,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating product name:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new product name",
      error: error.message,
    });
  }
};

// Get all product names
const getAllProductNames = async (req, res) => {
  try {
    const productNames = await ProductModel.find();
    res.status(200).json({
      message: "Success! Here are all product names",
      data: productNames,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to retrieve product names" });
  }
};

// Get product name by ID
const getProductNameById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product name exists
    const existingProductName = await ProductModel.findById(id);
    if (!existingProductName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Product name not found" });
    }
    res.status(200).json({
      message: "Success! Here is the product name with ID",
      data: existingProductName,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to retrieve product name" });
  }
};

// Update product name
const updateProductName = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName,categoryName,categoryId, updatedBy, isActive } = req.body;

    // Check if product name exists
    const existingProductName = await ProductModel.findById(id);
    if (!existingProductName) {
      return res.status(404).json({ status: "failed", message: "Product name not found" });
    }

    // Update the product name
    existingProductName.productName = productName;
    existingProductName.categoryName = categoryName;
    existingProductName.categoryId = categoryId;
    existingProductName.updatedBy = updatedBy;
    existingProductName.updatedOn = new Date();
    existingProductName.isActive = isActive !== undefined ? isActive : existingProductName.isActive;

    const updatedProductName = await existingProductName.save();

    res.status(200).json({
      message: `Product name ${id} updated successfully`,
      data: updatedProductName,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating product name:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update product name",
    });
  }
};

// Delete product name
const deleteProductName = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product name exists
    const existingProductName = await ProductModel.findById(id);
    if (!existingProductName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Product name not found" });
    }

    // Delete the product name
    await ProductModel.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "Product name deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to delete product name" });
  }
};

export {
  createProductName,
  getAllProductNames,
  getProductNameById,
  updateProductName,
  deleteProductName,
};
