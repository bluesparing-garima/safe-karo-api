import ProductModel from "../../models/product.js";

// Create a new product name
const createProductName = async (req, res) => {
  try {
    const { productName, createdBy } = req.body;

    // Check if all required fields are provided
    if (!productName || !createdBy) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newproductName = new ProductModel({
      productName,
      createdBy,
      updatedBy: null, // Set updatedBy to null initially
      updatedOn: null, // Set updatedOn to null initially
    });

    await newproductName.save();
    res.status(200).json({
      message: "New product name created successfully",
      data:  newproductName ,
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
    const ProductNames = await ProductModel.find();
    res.status(200).json({
      message: "Success! Here are all product names",
      data:  ProductNames ,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve product name" });
  }
};

// Get product name by ID
const getProductNameById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product name exists
    const existingproductName = await ProductModel.findById(id);
    if (!existingproductName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Product name not found" });
    }
    res.status(200).json({
      message: "Success! Here is the product name with ID",
      data:  existingproductName ,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve product name" });
  }
};

// Update product name
const updateProductName = async (req, res) => {
    try {
      const { id } = req.params;
      const { productName, updatedBy } = req.body;
  
      // Check if product name exists
      const existingProductName = await ProductModel.findById(id);
      if (!existingProductName) {
        return res.status(404).json({ status: "failed", message: "Product name not found" });
      }
  
      // Update the product name
      existingProductName.productName = productName;
      existingProductName.updatedBy = updatedBy;
      existingProductName.updatedOn = new Date();
  
      const updatedProductName = await existingProductName.save();
  
      res.status(200).json({
        message: `Product name ${id} updated successfully`,
        data: updatedProductName ,
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

// Delete productname
const deleteProductName = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product name exists
    const existingproductName = await ProductModel.findById(id);
    if (!existingproductName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Product name not found" });
    }

    // Delete the product name
    await ProductModel.findByIdAndDelete(id);
    res
      .status(200)
      .json({
        status: "success",
        message: "Product name deleted successfully",
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to delete product name" });
  }
};

export {
  createProductName,
  getAllProductNames,
  getProductNameById,
  updateProductName,
  deleteProductName,
};
