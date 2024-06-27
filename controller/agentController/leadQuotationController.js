import leadQuotationModel from "../../models/agentModels/leadQuotationSchema.js";
import leadGenerateModel from "../../models/agentModels/leadGenerateSchema.js";
import { createActivityLog } from '../adminController/activityLogController.js';

// Create a new quotation
const createNewQuotation = async (req, res) => {
  const logData = {
    endpoint: req.originalUrl,
    statusCode: null,
    request: JSON.stringify(req.body),
    response: null,
    partnerId: req.body.partnerId || "",
    isActive: true,
    createdBy: req.body.createdBy || "",
    createdOn: new Date(),
  };

  try {
    const { leadId, quotationImage, comments, status, partnerId, partnerName, createdBy } = req.body;

    const missingFields = [];
    if (!leadId) missingFields.push("leadId");
    if (!status) missingFields.push("status");
    if (!partnerId) missingFields.push("partnerId");

    if (missingFields.length > 0) {
      logData.statusCode = 400;
      logData.response = JSON.stringify({
        status: "failed",
        message: `Required fields are missing: ${missingFields.join(", ")}`,
      });
      await createActivityLog(logData);

      return res.status(400).json({
        status: "failed",
        message: `Required fields are missing: ${missingFields.join(", ")}`,
      });
    }

    const newQuotation = new leadQuotationModel({
      leadId,
      quotationImage,
      comments,
      status,
      partnerId,
      partnerName,
      createdBy,
    });

    await newQuotation.save();

    // Update lead status
    const updatedLead = await leadGenerateModel.findByIdAndUpdate(
      leadId,
      { status },
      { new: true }
    );

    if (!updatedLead) {
      logData.statusCode = 404;
      logData.response = JSON.stringify({
        status: "failed",
        message: "Related lead not found",
      });
      await createActivityLog(logData);

      return res.status(404).json({
        status: "failed",
        message: "Related lead not found",
      });
    }

    logData.statusCode = 200;
    logData.response = JSON.stringify({
      message: "New Quotation created successfully",
      data: newQuotation,
      status: "success",
    });
    await createActivityLog(logData);

    res.status(200).json({
      message: "New Quotation created successfully",
      data: newQuotation,
      status: "success",
    });
  } catch (error) {
    logData.statusCode = 500;
    logData.response = JSON.stringify({
      status: "failed",
      message: "Unable to create new quotation",
      error: error.message,
    });
    await createActivityLog(logData);

    res.status(500).json({
      status: "failed",
      message: "Unable to create new quotation",
      error: error.message,
    });
  }
};

// Get all quotations
const getAllQuotation = async (req, res) => {
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
    const quotations = await leadQuotationModel.find();

    logData.statusCode = 200;
    logData.response = JSON.stringify({
      message: "Success! Here are all the quotations",
      data: quotations,
      status: "success",
    });
    await createActivityLog(logData);

    res.status(200).json({
      message: "Success! Here are all the quotations",
      data: quotations,
      status: "success",
    });
  } catch (error) {
    logData.statusCode = 500;
    logData.response = JSON.stringify({
      status: "failed",
      message: "Unable to retrieve quotations",
      error: error.message,
    });
    await createActivityLog(logData);

    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve quotations", error: error.message });
  }
};

// Get quotation by ID
const getQuotationById = async (req, res) => {
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
    const quotation = await leadQuotationModel.findById(id);
    if (!quotation) {
      logData.statusCode = 404;
      logData.response = JSON.stringify({
        status: "failed",
        message: "Quotation not found",
      });
      await createActivityLog(logData);

      return res.status(404).json({ status: "failed", message: "Quotation not found" });
    }

    logData.statusCode = 200;
    logData.response = JSON.stringify({
      message: "Success! Here is the quotation",
      data: quotation,
      status: "success",
    });
    await createActivityLog(logData);

    res.status(200).json({
      message: "Success! Here is the quotation",
      data: quotation,
      status: "success",
    });
  } catch (error) {
    logData.statusCode = 500;
    logData.response = JSON.stringify({
      status: "failed",
      message: "Unable to retrieve quotation",
      error: error.message,
    });
    await createActivityLog(logData);

    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve quotation", error: error.message });
  }
};

// Get quotations by leadId
const getQuotationsByLeadId = async (req, res) => {
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
    const { leadId } = req.query;
    if (!leadId) {
      logData.statusCode = 400;
      logData.response = JSON.stringify({
        status: "failed",
        message: "leadId query parameter is required",
      });
      await createActivityLog(logData);

      return res.status(400).json({
        status: "failed",
        message: "leadId query parameter is required",
      });
    }

    const quotations = await leadQuotationModel.find({ leadId });
    if (quotations.length === 0) {
      logData.statusCode = 404;
      logData.response = JSON.stringify({
        status: "failed",
        message: "No quotations found for the provided leadId",
      });
      await createActivityLog(logData);

      return res.status(404).json({
        status: "failed",
        message: "No quotations found for the provided leadId",
      });
    }

    logData.statusCode = 200;
    logData.response = JSON.stringify({
      message: "Success! Here are the quotations",
      data: quotations,
      status: "success",
    });
    await createActivityLog(logData);

    res.status(200).json({
      message: "Success! Here are the quotations",
      data: quotations,
      status: "success",
    });
  } catch (error) {
    logData.statusCode = 500;
    logData.response = JSON.stringify({
      status: "failed",
      message: "Unable to retrieve quotations",
      error: error.message,
    });
    await createActivityLog(logData);

    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve quotations",
      error: error.message,
    });
  }
};

// Update quotation by ID
const updateQuotation = async (req, res) => {
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

    const updatedQuotation = await leadQuotationModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedQuotation) {
      logData.statusCode = 404;
      logData.response = JSON.stringify({
        status: "failed",
        message: "Quotation not found",
      });
      await createActivityLog(logData);

      return res.status(404).json({ status: "failed", message: "Quotation not found" });
    }

    // Update lead status if quotation status has updated
    if (updateData.status) {
      const updatedLead = await leadGenerateModel.findByIdAndUpdate(
        updatedQuotation.leadId,
        { status: updateData.status },
        { new: true }
      );

      if (!updatedLead) {
        logData.statusCode = 404;
        logData.response = JSON.stringify({
          status: "failed",
          message: "Related lead not found",
        });
        await createActivityLog(logData);

        return res.status(404).json({ status: "failed", message: "Related lead not found" });
      }
    }

    logData.statusCode = 200;
    logData.response = JSON.stringify({
      message: "Quotation updated successfully",
      data: updatedQuotation,
      status: "success",
    });
    await createActivityLog(logData);

    res.status(200).json({
      message: "Quotation updated successfully",
      data: updatedQuotation,
      status: "success",
    });
  } catch (error) {
    logData.statusCode = 500;
    logData.response = JSON.stringify({
      status: "failed",
      message: "Unable to update quotation",
      error: error.message,
    });
    await createActivityLog(logData);

    res.status(500).json({
      status: "failed",
      message: "Unable to update quotation",
      error: error.message,
    });
  }
};

// Delete quotation by ID
const deleteQuotation = async (req, res) => {
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

    const quotation = await leadQuotationModel.findById(id);
    if (!quotation) {
      logData.statusCode = 404;
      logData.response = JSON.stringify({
        status: "failed",
        message: "Quotation not found",
      });
      await createActivityLog(logData);

      return res.status(404).json({ status: "failed", message: "Quotation not found" });
    }

    await leadQuotationModel.findByIdAndDelete(id);

    logData.statusCode = 200;
    logData.response = JSON.stringify({
      status: "success",
      message: "Quotation deleted successfully",
    });
    await createActivityLog(logData);

    res.status(200).json({
      status: "success",
      message: "Quotation deleted successfully",
    });
  } catch (error) {
    logData.statusCode = 500;
    logData.response = JSON.stringify({
      status: "failed",
      message: "Unable to delete the quotation",
      error: error.message,
    });
    await createActivityLog(logData);

    res.status(500).json({ status: "failed", message: "Unable to delete the quotation", error: error.message });
  }
};

export {
  createNewQuotation,
  getAllQuotation,
  getQuotationsByLeadId,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
};
