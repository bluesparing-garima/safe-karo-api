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

  let statusCode;
  const logData = {
    endpoint: req.originalUrl,
    statusCode: null,
    request: JSON.stringify(req.body),
    response: null,
    partnerId: partnerId || "",
    isActive: true,
    createdBy: createdBy || "",
    createdOn: new Date(),
  };

  if (
    !policyType ||
    !category ||
    !companyName ||
    !caseType ||
    !status ||
    !partnerId ||
    !createdBy
  ) {
    statusCode = 400;
    logData.statusCode = statusCode;
    logData.response = JSON.stringify({ status: "failed", message: "Required fields are missing" });
    await createActivityLog(logData);
    return res.status(statusCode).json({ status: "failed", message: "Required fields are missing" });
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
    
    statusCode = 200;
    logData.statusCode = statusCode;
    logData.response = JSON.stringify({
      message: "New Lead created successfully",
      data: savedLead,
      status: "success"
    });
    await createActivityLog(logData);

    res.status(statusCode).json({
      message: "New Lead created successfully",
      data: savedLead,
      status: "success",
    });
  } catch (error) {
    statusCode = 500;
    logData.statusCode = statusCode;
    logData.response = JSON.stringify({
      status: "failed",
      message: `Unable to create new lead: ${error.message}`
    });
    await createActivityLog(logData);

    res.status(statusCode).json({
      status: "failed",
      message: "Unable to create new lead",
      error: error.message,
    });
  }
};

// Get all leads
const getAllLeads = async (req, res) => {
  const logData = {
    endpoint: req.originalUrl,
    statusCode: null,
    request: JSON.stringify(req.query),
    response: null,
    partnerId: req.query.partnerId || "",
    isActive: true,
    createdBy: req.query.createdBy || "",
    createdOn: new Date(),
  };

  try {
    const leads = await leadGenerateModel.find();
    const statusCode = 200;
    logData.statusCode = statusCode;
    logData.response = JSON.stringify({
      message: "Success! Here are all the leads",
      data: leads,
      status: "success",
    });
    await createActivityLog(logData);

    res.status(statusCode).json({
      message: "Success! Here are all the leads",
      data: leads,
      status: "success",
    });
  } catch (error) {
    const statusCode = 500;
    logData.statusCode = statusCode;
    logData.response = JSON.stringify({
      status: "failed",
      message: "Unable to retrieve leads",
      error: error.message,
    });
    await createActivityLog(logData);

    res.status(statusCode).json({
      status: "failed",
      message: "Unable to retrieve leads",
      error: error.message,
    });
  }
};

// Get lead by ID
const getLeadById = async (req, res) => {
  const logData = {
    endpoint: req.originalUrl,
    statusCode: null,
    request: JSON.stringify(req.params),
    response: null,
    partnerId: req.query.partnerId || "",
    isActive: true,
    createdBy: req.query.createdBy || "",
    createdOn: new Date(),
  };

  try {
    const { id } = req.params;

    // Check if lead exists
    const existingLead = await leadGenerateModel.findById(id);
    if (!existingLead) {
      const statusCode = 404;
      logData.statusCode = statusCode;
      logData.response = JSON.stringify({ status: "failed", message: "Lead not found" });
      await createActivityLog(logData);

      return res.status(statusCode).json({ status: "failed", message: "Lead not found" });
    }

    const statusCode = 200;
    logData.statusCode = statusCode;
    logData.response = JSON.stringify({
      message: "Success! Here is the lead with ID",
      data: existingLead,
      status: "success",
    });
    await createActivityLog(logData);

    res.status(statusCode).json({
      message: "Success! Here is the lead with ID",
      data: existingLead,
      status: "success",
    });
  } catch (error) {
    const statusCode = 500;
    logData.statusCode = statusCode;
    logData.response = JSON.stringify({
      status: "failed",
      message: "Unable to retrieve Lead",
      error: error.message,
    });
    await createActivityLog(logData);

    res.status(statusCode).json({
      status: "failed",
      message: "Unable to retrieve Lead",
      error: error.message,
    });
  }
};

// Update Lead
const updateLead = async (req, res) => {
  const logData = {
    endpoint: req.originalUrl,
    statusCode: null,
    request: JSON.stringify(req.body),
    response: null,
    partnerId: req.body.partnerId || "",
    isActive: true,
    createdBy: req.body.createdBy || "",
    updatedBy: req.body.updatedBy || "",
    createdOn: new Date(),
    updatedOn: new Date(),
  };

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
      const statusCode = 404;
      logData.statusCode = statusCode;
      logData.response = JSON.stringify({ status: "failed", message: "Lead not found" });
      await createActivityLog(logData);

      return res.status(statusCode).json({ status: "failed", message: "Lead not found" });
    }

    const statusCode = 200;
    logData.statusCode = statusCode;
    logData.response = JSON.stringify({
      message: "Lead updated successfully",
      data: updatedLead,
      status: "success",
    });
    await createActivityLog(logData);

    res.status(statusCode).json({
      message: "Lead updated successfully",
      data: updatedLead,
      status: "success",
    });
  } catch (error) {
    const statusCode = 500;
    logData.statusCode = statusCode;
    logData.response = JSON.stringify({
      status: "failed",
      message: "Unable to update Lead",
      error: error.message,
    });
    await createActivityLog(logData);

    res.status(statusCode).json({
      status: "failed",
      message: "Unable to update Lead",
      error: error.message,
    });
  }
};

// Delete Lead
const deleteLead = async (req, res) => {
  const logData = {
    endpoint: req.originalUrl,
    statusCode: null,
    request: JSON.stringify(req.params),
    response: null,
    partnerId: req.body.partnerId || "",
    isActive: true,
    createdBy: req.body.createdBy || "",
    createdOn: new Date(),
  };

  try {
    const { id } = req.params;

    // Check if Lead exists
    const existingLead = await leadGenerateModel.findById(id);
    if (!existingLead) {
      const statusCode = 404;
      logData.statusCode = statusCode;
      logData.response = JSON.stringify({ status: "failed", message: "Lead not found" });
      await createActivityLog(logData);

      return res.status(statusCode).json({ status: "failed", message: "Lead not found" });
    }

    // Delete the lead
    await leadGenerateModel.findByIdAndDelete(id);

    const statusCode = 200;
    logData.statusCode = statusCode;
    logData.response = JSON.stringify({
      status: "success",
      message: "Lead deleted successfully",
    });
    await createActivityLog(logData);

    res.status(statusCode).json({
      status: "success",
      message: "Lead deleted successfully",
    });
  } catch (error) {
    const statusCode = 500;
    logData.statusCode = statusCode;
    logData.response = JSON.stringify({
      status: "failed",
      message: "Unable to delete the lead",
      error: error.message,
    });
    await createActivityLog(logData);

    res.status(statusCode).json({
      status: "failed",
      message: "Unable to delete the lead",
      error: error.message,
    });
  }
};

export { createNewLead, getAllLeads, getLeadById, updateLead, deleteLead };
