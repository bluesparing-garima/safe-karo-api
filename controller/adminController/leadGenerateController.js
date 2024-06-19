import leadGenerateModel from "../../models/leadGenerateSchema.js";


// Create a new lead
const createNewLead = async (req, res) => {
  try {
    const { policyType, category,subCategory,company,caseType,policyStatus,comments,documents,remarks,quotation} = req.body;

    // Check if all required fields are provided
    if (!policyType || !category || !subCategory || !company || !caseType || !policyStatus || !comments || !documents || !remarks || !quotation) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newLead  = new leadGenerateModel({
      policyType,
      category,
      subCategory,
      company,
      caseType,
      policyStatus,
      comments,
      documents,
      remarks,
      quotation
    });

    await newLead.save();
    res.status(200).json({
      message: "New Lead created successfully",
      data: newLead,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating New Lead :", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new lead ",
      error: error.message,
    });
  }
};

// Get all leads
const getAllLeads = async (req, res) => {
  try {
    const leads = await leadGenerateModel.find();
    res.status(200).json({
      message: "Success! Here are all the leads",
      data: leads,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve leads" });
  }
};

// Get lead by ID
const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if lead exists
    const existingLead = await leadGenerateModel.findById(id);
    if (!existingLead) {
      return res
        .status(404)
        .json({ status: "failed", message: "Lead not found" });
    }
    res.status(200).json({
      message: "Success! Here is the broker name with ID",
      data: existingLead,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve Lead" });
  }
};

// Update Lead
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if Lead exists and update in one step
    const updatedLead = await leadGenerateModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedLead) {
      return res.status(404).json({ status: "failed", message: "Lead not found" });
    }

    res.status(200).json({
      message: "Lead updated successfully",
      data: updatedLead,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating Lead:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update Lead",
    });
  }
};



// Delete Lead
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if Lead exists
    const existingLead = await leadGenerateModel.findById(id);
    if (!existingLead) {
      return res
        .status(404)
        .json({ status: "failed", message: "lead not found" });
    }

    // Delete the lead
    await leadGenerateModel.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to delete the lead" });
  }
};

export {
  createNewLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
};
















