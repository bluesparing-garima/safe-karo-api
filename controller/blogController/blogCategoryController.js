import BlogCategory from "../../models/blogModels/blogCategorySchema.js";

// CREATE: Add a new category
export const createBlogCategory = async (req, res) => {
  try {
    const { category, createdBy, isActive } = req.body;
    if (!category || !createdBy) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newBlogCategory = new BlogCategory({
      category,
      createdBy,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newBlogCategory.save();
    res.status(201).json({
      message: "New blog category created successfully",
      data: newBlogCategory,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating blog category:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new blog category",
      error: error.message,
    });
  }
};

// READ: Get all categories
export const getAllBlogCategories = async (req, res) => {
  try {
    const categories = await BlogCategory.find().sort({ category: 1 });
    res.status(200).json({
      message: "Success! Here are all blog categories",
      data: categories,
      status: "success",
    });
  } catch (error) {
    console.error("Error retrieving blog categories:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve blog categories",
    });
  }
};

// READ: Get a category by ID
export const getBlogCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await BlogCategory.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ status: "failed", message: "Blog category not found" });
    }
    res.status(200).json({
      message: "Success! Here is the blog category",
      data: category,
      status: "success",
    });
  } catch (error) {
    console.error("Error retrieving blog category by ID:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve blog category",
    });
  }
};

// UPDATE: Update a blog category by ID
export const updateBlogCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, updatedBy, isActive } = req.body;

    const existingCategory = await BlogCategory.findById(id);
    if (!existingCategory) {
      return res
        .status(404)
        .json({ status: "failed", message: "Blog category not found" });
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
      message: `Blog category ${id} updated successfully`,
      data: updatedCategory,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating blog category:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update blog category",
    });
  }
};

// DELETE: Remove a blog category by ID
export const deleteBlogCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCategory = await BlogCategory.findById(id);
    if (!existingCategory) {
      return res
        .status(404)
        .json({ status: "failed", message: "Blog category not found" });
    }

    await BlogCategory.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "Blog category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog category:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to delete blog category",
    });
  }
};
