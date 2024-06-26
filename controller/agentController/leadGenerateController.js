import leadGenerateModel from "../../models/agentModels/leadGenerateSchema.js";
import { createActivityLog } from '../adminController/activityLogController.js';

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
    const logData = {
      endpoint: req.originalUrl,
      statusCode: 400,
      request: JSON.stringify(req.body),
      response: JSON.stringify({ status: "failed", message: "Required fields are missing" }),
      partnerId: partnerId,
      isActive: true,
      createdBy: createdBy,
      createdOn: new Date(),
    };
    await createActivityLog(logData);
    return res
      .status(400)
      .json({ status: "failed", message: "Required fields are missing" });
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
      createdBy: createdBy,
      createdOn: new Date(),
      isActive: true,
    });

    const savedLead = await newLead.save();
    
    const logData = {
      endpoint: req.originalUrl,
      statusCode: 200,
      request: JSON.stringify(req.body),
      response: JSON.stringify({ message: "New Lead created successfully", data: savedLead, status: "success" }),
      partnerId: partnerId,
      isActive: true,
      createdBy: createdBy,
      createdOn: new Date(),
    };
    await createActivityLog(logData);

    res.status(200).json({
      message: "New Lead created successfully",
      data: savedLead,
      status: "success",
    });
  } catch (error) {
    // Log the error
    const logData = {
      endpoint: req.originalUrl,
      statusCode: 500,
      request: JSON.stringify(req.body),
      response: JSON.stringify({ status: "failed", message: `Unable to create new lead: ${error.message}` }),
      partnerId: partnerId,
      isActive: true,
      createdBy: createdBy,
      createdOn: new Date(),
    };
    await createActivityLog(logData);

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
      message: "Success! Here is the lead with ID",
      data: existingLead,
      status: "success",
    });
  } catch (error) {
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
    const updatedLead = await leadGenerateModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedLead) {
      return res
        .status(404)
        .json({ status: "failed", message: "Lead not found" });
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
        .json({ status: "failed", message: "Lead not found" });
    }

    // Delete the lead
    await leadGenerateModel.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "Lead deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "failed", message: "Unable to delete the lead" });
  }
};

export { createNewLead, getAllLeads, getLeadById, updateLead, deleteLead };