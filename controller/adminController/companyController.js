import CompanyModel from "../../models/companySchema.js";

// Create a new company name
const createCompanyName = async (req, res) => {
  try {
    const { companyName, createdBy } = req.body;

    // Check if all required fields are provided
    if (!companyName || !createdBy) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newcompanyName = new CompanyModel({
      companyName,
      createdBy,
      updatedBy: null, // Set updatedBy to null initially
      updatedOn: null, // Set updatedOn to null initially
    });

    await newcompanyName.save();
    res.status(200).json({
      message: "New company name created successfully",
      data:  newcompanyName ,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating company name:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new company name",
      error: error.message,
    });
  }
};

// Get all company names
const getAllCompanyNames = async (req, res) => {
  try {
    const CompanyNames = await CompanyModel.find();
    res.status(200).json({
      message: "Success! Here are all company names",
      data:  CompanyNames ,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve company name" });
  }
};

// Get company name by ID
const getCompanyNameById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if company name exists
    const existingcompanyName = await CompanyModel.findById(id);
    if (!existingcompanyName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Company name not found" });
    }
    res.status(200).json({
      message: "Success! Here is the company name with ID",
      data:  existingcompanyName ,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve company name" });
  }
};

// Update companyName
const updateCompanyName = async (req, res) => {
    try {
      const { id } = req.params;
      const { companyName, updatedBy } = req.body;
  
      // Check if company name exists
      const existingCompanyName = await CompanyModel.findById(id);
      if (!existingCompanyName) {
        return res.status(404).json({ status: "failed", message: "Company name not found" });
      }
  
      // Update the company name
      existingCompanyName.companyName = companyName;
      existingCompanyName.updatedBy = updatedBy;
      existingCompanyName.updatedOn = new Date();
  
      const updatedCompanyName = await existingCompanyName.save();
  
      res.status(200).json({
        message: `Company name ${id} updated successfully`,
        data: updatedCompanyName ,
        status: "success",
      });
    } catch (error) {
      console.error("Error updating company name:", error);
      res.status(500).json({
        status: "failed",
        message: "Unable to update company name",
      });
    }
  };

// Delete companyName
const deleteCompanyName = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if company name exists
    const existingcompanyName = await CompanyModel.findById(id);
    if (!existingcompanyName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Company name not found" });
    }

    // Delete the company name
    await CompanyModel.findByIdAndDelete(id);
    res
      .status(200)
      .json({
        status: "success",
        message: "Company name deleted successfully",
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to delete company name" });
  }
};

export {
  createCompanyName,
  getAllCompanyNames,
  getCompanyNameById,
  updateCompanyName,
  deleteCompanyName,
};
