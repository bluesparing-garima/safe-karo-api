import leadGenerateModel from "../../models/agentModels/leadGenerateSchema.js";

// Create a new lead
const createNewLead = async (req, res) => {
  const {
    policyType,
    category,
    companyName,
    caseType,
    status,
    documents,
    remarks,
    partnerId,
    partnerName,
    relationshipManagerId,
    relationshipManagerName,
    leadCreatedBy,
    createdBy
  } = req.body;

  if (
    !policyType ||
    !category ||
    !companyName ||
    !caseType ||
    !status ||
    !partnerId ||
    !createdBy
  ) {
    return res.status(400).json({ status: "failed", message: "Required fields are missing" });
  }

  try {
    const newLead = new leadGenerateModel({
      policyType,
      category,
      companyName,
      caseType,
      status,
      documents,
      remarks,
      partnerId: partnerId || "",
      partnerName: partnerName || "",
      relationshipManagerId: relationshipManagerId || "",
      relationshipManagerName: relationshipManagerName || "",
      leadCreatedBy,
      createdBy: createdBy,
      createdOn: new Date(),
      isActive: true,
    });

    const savedLead = await newLead.save();

    res.status(200).json({
      message: "New Lead created successfully",
      data: savedLead,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Unable to create new lead",
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
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve leads",
      error: error.message,
    });
  }
};

// Get leads requests by leadCreatedBy
export const getleadsByCreatedBy = async (req, res) => {
  try {
    const { leadCreatedBy } = req.params;
    const leads = await leadGenerateModel.find({ leadCreatedBy });
    
    if (leads.length === 0) {
      return res.status(404).json({
        message: `No lead found for leadCreatedBy: ${leadCreatedBy}`,
        status: "success",
      });
    }
    res.status(200).json({
      message: "Lead retrieved successfully.",
      data: leads,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving leads",
      error: error.message,
    });
  }
};

// Get lead by partnerID
export const getLeadsByPartnerId = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const leads = await leadGenerateModel.find({ partnerId });
    
    if (leads.length === 0) {
      return res.status(404).json({
        message: `No leads found for partnerId: ${partnerId}`,
        status: "success",
      });
    }
    res.status(200).json({
      message: "Leads retrieved successfully.",
      data: leads,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving leads",
      error: error.message,
    });
  }
};

// Get lead by ID
const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if lead exists
    const existingLead = await leadGenerateModel.findById(id);
    if (!existingLead) {
      return res.status(404).json({ status: "failed", message: "Lead not found" });
    }

    res.status(200).json({
      message: "Success! Here is the lead with ID",
      data: existingLead,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve Lead",
      error: error.message,
    });
  }
};

// Update Lead
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if Lead exists and update in one step
    const updatedLead = await leadGenerateModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({ status: "failed", message: "Lead not found" });
    }

    res.status(200).json({
      message: "Lead updated successfully",
      data: updatedLead,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Unable to update Lead",
      error: error.message,
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
      return res.status(404).json({ status: "failed", message: "Lead not found" });
    }

    // Delete the lead
    await leadGenerateModel.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "Lead deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Unable to delete the lead",
      error: error.message,
    });
  }
};

export { createNewLead, getAllLeads, getLeadById, updateLead, deleteLead };
