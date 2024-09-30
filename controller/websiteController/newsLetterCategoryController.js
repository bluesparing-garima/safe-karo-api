import NewsLetterCategory from "../../models/websiteModels/newsLetterCategorySchema.js";

// CREATE: Add a new category
export const createNewsLetterCategory = async (req, res) => {
  try {
    const { category, createdBy, isActive } = req.body;
    if (!category || !createdBy) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newNewsLetterCategory = new NewsLetterCategory({
      category,
      createdBy,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newNewsLetterCategory.save();
    res.status(201).json({
      message: "New newsLetter category created successfully",
      data: newNewsLetterCategory,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating newsLetter category:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new newsLetter category",
      error: error.message,
    });
  }
};

// READ: Get all categories
export const getAllNewsLetterCategories = async (req, res) => {
  try {
    const categories = await NewsLetterCategory.find().sort({ category: 1 });
    res.status(200).json({
      message: "Success! Here are all newsLetter categories",
      data: categories,
      status: "success",
    });
  } catch (error) {
    console.error("Error retrieving newsLetter categories:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve newsLetter categories",
    });
  }
};

// READ: Get a category by ID
export const getNewsLetterCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await NewsLetterCategory.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ status: "failed", message: "NewsLetter category not found" });
    }
    res.status(200).json({
      message: "Success! Here is the newsLetter category",
      data: category,
      status: "success",
    });
  } catch (error) {
    console.error("Error retrieving newsLetter category by ID:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve newsLetter category",
    });
  }
};

// UPDATE: Update a newsLetter category by ID
export const updateNewsLetterCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, updatedBy, isActive } = req.body;

    const existingCategory = await NewsLetterCategory.findById(id);
    if (!existingCategory) {
      return res
        .status(404)
        .json({ status: "failed", message: "NewsLetter category not found" });
    }

    // Update fields
    existingCategory.category = category || existingCategory.category;
    existingCategory.updatedBy = updatedBy;
    existingCategory.updatedOn = new Date();
    if (isActive !== undefined) {
      existingCategory.isActive = isActive;
    }

    const updatedCategory = await existingCategory.save();

    res.status(200).json({
      message: `NewsLetter category ${id} updated successfully`,
      data: updatedCategory,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating newsLetter category:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update newsLetter category",
    });
  }
};

// DELETE: Remove a newsLetter category by ID
export const deleteNewsLetterCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCategory = await NewsLetterCategory.findById(id);
    if (!existingCategory) {
      return res
        .status(404)
        .json({ status: "failed", message: "NewsLetter category not found" });
    }

    await NewsLetterCategory.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "NewsLetter category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting newsLetter category:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to delete newsLetter category",
    });
  }
};
