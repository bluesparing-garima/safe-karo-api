import leadPaymentModel from "../../models/agentModels/leadPaymentSchema.js";
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
      const { leadId, paymentLink, paymentStatus, remarks, createdBy, partnerId } = req.body;
  
      // Check for missing required fields
      const missingFields = [];
      if (!leadId) missingFields.push('leadId');
      if (!paymentLink) missingFields.push('paymentLink');
      if (!paymentStatus) missingFields.push('paymentStatus');
      if (!remarks) missingFields.push('remarks');
      if (!partnerId) missingFields.push('partnerId');
      if (!createdBy) missingFields.push('createdBy');
  
      if (missingFields.length > 0) {
        logData.statusCode = 400;
        logData.response = JSON.stringify({ status: 'failed', message: `Required fields are missing: ${missingFields.join(', ')}` });
        await createActivityLog(logData);
  
        return res.status(400).json({ status: 'failed', message: `Required fields are missing: ${missingFields.join(', ')}` });
      }
  
      const newLeadPayment = new leadPaymentModel({
        leadId,
        paymentLink,
        paymentStatus,
        remarks,
        createdBy,
        partnerId
      });
  
      await newLeadPayment.save();
  
      logData.statusCode = 200;
      logData.response = JSON.stringify({
        message: 'New Lead Payment created successfully',
        data: newLeadPayment,
        status: 'success'
      });
      await createActivityLog(logData);
  
      res.status(200).json({
        message: 'New Lead Payment created successfully',
        data: newLeadPayment,
        status: 'success'
      });
    } catch (error) {
      logData.statusCode = 500;
      logData.response = JSON.stringify({
        status: 'failed',
        message: 'Unable to create new lead payment',
        error: error.message
      });
      await createActivityLog(logData);
  
      res.status(500).json({
        status: 'failed',
        message: 'Unable to create new lead payment',
        error: error.message
      });
    }
  };

// Get all payments
const getAllLeadPayments = async (req, res) => {
  try {
    const payments = await leadPaymentModel.find();
    res.status(200).json({
      message: 'Success! Here are all the payments',
      data: payments,
      status: 'success'
    });
  } catch (error) {
    res.status(500).json({ status: 'failed', message: 'Unable to retrieve payments' });
  }
};

// Get payments by Id
const getLeadPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await leadPaymentModel.findById(id);
    if (!payment) {
      return res.status(404).json({ status: 'failed', message: 'Payment not found' });
    }
    res.status(200).json({
      message: 'Success! Here is the payment',
      data: payment,
      status: 'success'
    });
  } catch (error) {
    res.status(500).json({ status: 'failed', message: 'Unable to retrieve payment' });
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
      createdBy: req.body.createdBy || "", // Ensure createdBy is provided here
      updatedBy: req.body.updatedBy || "", // Capture updatedBy
      createdOn: new Date(),
      updatedOn: new Date(), // Capture updatedOn
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
  try {
    const { id } = req.params;

    // Check if lead payment exists
    const leadPayment = await leadPaymentModel.findById(id);
    if (!leadPayment) {
      return res.status(404).json({ status: 'failed', message: 'Lead payment not found' });
    }

    // Delete the lead payment
    await leadPaymentModel.findByIdAndDelete(id);
    res.status(200).json({
      status: 'success',
      message: 'Lead payment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ status: 'failed', message: 'Unable to delete the lead payment' });
  }
};

export {
  createNewLeadPayment,
  getAllLeadPayments,
  getLeadPaymentById,
  updateLeadPayment,
  deleteLeadPayment,
};
