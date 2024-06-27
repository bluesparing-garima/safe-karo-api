import leadPaymentModel from "../../models/agentModels/leadPaymentSchema.js";
import leadGenerateModel from "../../models/agentModels/leadGenerateSchema.js";
import { createActivityLog } from '../adminController/activityLogController.js';

// Create a new lead payment
const createNewLeadPayment = async (req, res) => {
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
    const {
      leadId,
      paymentLink,
      status,
      remarks,
      createdBy,
      partnerId,
    } = req.body;

    // Check for missing required fields
    const missingFields = [];
    if (!leadId) missingFields.push("leadId");
    if (!paymentLink) missingFields.push("paymentLink");
    if (!status) missingFields.push("status");
    if (!remarks) missingFields.push("remarks");
    if (!partnerId) missingFields.push("partnerId");
    if (!createdBy) missingFields.push("createdBy");

    if (missingFields.length > 0) {
      logData.statusCode = 400;
      logData.response = JSON.stringify({
        status: "failed",
        message: `Required fields are missing: ${missingFields.join(", ")}`,
      });
      await createActivityLog(logData);

      return res
        .status(400)
        .json({
          status: "failed",
          message: `Required fields are missing: ${missingFields.join(", ")}`,
        });
    }

    const newLeadPayment = new leadPaymentModel({
      leadId,
      paymentLink,
      status,
      remarks,
      createdBy,
      partnerId,
    });

    await newLeadPayment.save();

    logData.statusCode = 200;
    logData.response = JSON.stringify({
      message: "New Lead Payment created successfully",
      data: newLeadPayment,
      status: "success",
    });
    await createActivityLog(logData);

    const updatedLead = await leadGenerateModel.findByIdAndUpdate(
      leadId,
      { status },
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({
        status: "failed",
        message: "Related lead not found",
      });
    }

    res.status(200).json({
      message: "New Lead Payment created successfully",
      data: newLeadPayment,
      status: "success",
    });
  } catch (error) {
    logData.statusCode = 500;
    logData.response = JSON.stringify({
      status: "failed",
      message: "Unable to create new lead payment",
      error: error.message,
    });
    await createActivityLog(logData);

    res.status(500).json({
      status: "failed",
      message: "Unable to create new lead payment",
      error: error.message,
    });
  }
};

// Get all payments
const getAllLeadPayments = async (req, res) => {
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
    const payments = await leadPaymentModel.find();

    logData.statusCode = 200;
    logData.response = JSON.stringify({
      message: "Success! Here are all the payments",
      data: payments,
      status: "success",
    });
    await createActivityLog(logData);

    res.status(200).json({
      message: "Success! Here are all the payments",
      data: payments,
      status: "success",
    });
  } catch (error) {
    logData.statusCode = 500;
    logData.response = JSON.stringify({
      status: "failed",
      message: "Unable to retrieve payments",
      error: error.message,
    });
    await createActivityLog(logData);

    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve payments",
      error: error.message,
    });
  }
};

// Get payments by leadId
const getLeadPaymentsByLeadId = async (req, res) => {
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

    const payments = await leadPaymentModel.find({ leadId });
    if (payments.length === 0) {
      logData.statusCode = 404;
      logData.response = JSON.stringify({
        status: "failed",
        message: "No payments found for the provided leadId",
      });
      await createActivityLog(logData);

      return res.status(404).json({
        status: "failed",
        message: "No payments found for the provided leadId",
      });
    }

    logData.statusCode = 200;
    logData.response = JSON.stringify({
      message: "Success! Here are the payments",
      data: payments,
      status: "success",
    });
    await createActivityLog(logData);

    res.status(200).json({
      message: "Success! Here are the payments",
      data: payments,
      status: "success",
    });
  } catch (error) {
    logData.statusCode = 500;
    logData.response = JSON.stringify({
      status: "failed",
      message: "Unable to retrieve payments",
      error: error.message,
    });
    await createActivityLog(logData);

    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve payments",
      error: error.message,
    });
  }
};

// Get payments by Id
const getLeadPaymentById = async (req, res) => {
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

    const payment = await leadPaymentModel.findById(id);
    if (!payment) {
      logData.statusCode = 404;
      logData.response = JSON.stringify({
        status: "failed",
        message: "Payment not found",
      });
      await createActivityLog(logData);

      return res.status(404).json({ status: "failed", message: "Payment not found" });
    }

    logData.statusCode = 200;
    logData.response = JSON.stringify({
      message: "Success! Here is the payment",
      data: payment,
      status: "success",
    });
    await createActivityLog(logData);

    res.status(200).json({
      message: "Success! Here is the payment",
      data: payment,
      status: "success",
    });
  } catch (error) {
    logData.statusCode = 500;
    logData.response = JSON.stringify({
      status: "failed",
      message: "Unable to retrieve payment",
      error: error.message,
    });
    await createActivityLog(logData);

    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve payment",
      error: error.message,
    });
  }
};

// Update lead payment
const updateLeadPayment = async (req, res) => {
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

    // Check if lead payment exists and update in one step
    const updatedLeadPayment = await leadPaymentModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedLeadPayment) {
      logData.statusCode = 404;
      logData.response = JSON.stringify({ status: 'failed', message: 'Lead payment not found' });
      await createActivityLog(logData);

      return res.status(404).json({ status: 'failed', message: 'Lead payment not found' });
    }

    logData.statusCode = 200;
    logData.response = JSON.stringify({
      message: 'Lead payment updated successfully',
      data: updatedLeadPayment,
      status: 'success'
    });

    await createActivityLog(logData);

    res.status(200).json({
      message: 'Lead payment updated successfully',
      data: updatedLeadPayment,
      status: 'success'
    });
  } catch (error) {
    logData.statusCode = 500;
    logData.response = JSON.stringify({
      status: 'failed',
      message: 'Unable to update lead payment',
      error: error.message
    });
    await createActivityLog(logData);

    res.status(500).json({
      status: 'failed',
      message: 'Unable to update lead payment',
      error: error.message
    });
  }
};

// Delete lead payment
const deleteLeadPayment = async (req, res) => {
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

    // Check if lead payment exists
    const leadPayment = await leadPaymentModel.findById(id);
    if (!leadPayment) {
      logData.statusCode = 404;
      logData.response = JSON.stringify({ status: 'failed', message: 'Lead payment not found' });
      await createActivityLog(logData);

      return res.status(404).json({ status: "failed", message: "Lead payment not found" });
    }

    // Delete the lead payment
    await leadPaymentModel.findByIdAndDelete(id);

    logData.statusCode = 200;
    logData.response = JSON.stringify({
      status: 'success',
      message: 'Lead payment deleted successfully'
    });
    await createActivityLog(logData);

    res.status(200).json({
      status: "success",
      message: "Lead payment deleted successfully",
    });
  } catch (error) {
    logData.statusCode = 500;
    logData.response = JSON.stringify({
      status: 'failed',
      message: 'Unable to delete the lead payment',
      error: error.message
    });
    await createActivityLog(logData);

    res.status(500).json({ status: "failed", message: "Unable to delete the lead payment" });
  }
};

export {
  createNewLeadPayment,
  getAllLeadPayments,
  getLeadPaymentsByLeadId,
  getLeadPaymentById,
  updateLeadPayment,
  deleteLeadPayment,
};
