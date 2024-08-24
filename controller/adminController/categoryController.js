import CategoryModel from "../../models/adminModels/categorySchema.js";

// Create Category
const createCategory = async (req, res) => {
  try {
    const { categoryName, createdBy, isActive } = req.body;

    // Check if all required fields are provided
    if (!categoryName || !createdBy) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newCategory = new CategoryModel({
      categoryName,
      createdBy,
      updatedBy: null, // Set updatedBy to null initially
      updatedOn: null, // Set updatedOn to null initially
      isActive: isActive !== undefined ? isActive : true, // Set default value to true if not provided
    });

    await newCategory.save();
    res.status(200).json({
      message: "New category created successfully",
      data: newCategory,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new category",
      error: error.message,
    });
  }
};

// Get all category names
const getAllCategorys = async (req, res) => {
  try {
    const Categorys = await CategoryModel.find().sort({ categoryName: 1 });
    res.status(200).json({
      message: "Success! Here are all category names",
      data: Categorys,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve category name" });
  }
};

// Get category name by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category name exists
    const existingcategory = await CategoryModel.findById(id);
    if (!existingcategory) {
      return res
        .status(404)
        .json({ status: "failed", message: "Broker name not found" });
    }
    res.status(200).json({
      message: "Success! Here is the category name with ID",
      data: existingcategory,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve category name" });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, updatedBy, isActive } = req.body;

    // Check if category exists
    const existingCategory = await CategoryModel.findById(id);
    if (!existingCategory) {
      return res
        .status(404)
        .json({ status: "failed", message: "Category not found" });
    }

    // Update the category
    existingCategory.categoryName = categoryName;
    existingCategory.updatedBy = updatedBy;
    existingCategory.updatedOn = new Date();
    if (isActive !== undefined) {
      existingCategory.isActive = isActive;
    }

    const updatedCategory = await existingCategory.save();

    res.status(200).json({
      message: `Category ${id} updated successfully`,
      data: updatedCategory,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update category",
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category name exists
    const existingcategory = await CategoryModel.findById(id);
    if (!existingcategory) {
      return res
        .status(404)
        .json({ status: "failed", message: "Broker name not found" });
    }

    // Delete the category name
    await CategoryModel.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "Broker name deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to delete category name" });
  }
};

export {
  createCategory,
  getAllCategorys,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
