import leadPaymentModel from "../../models/partnerModels/leadPaymentSchema.js";
import leadGenerateModel from "../../models/partnerModels/leadGenerateSchema.js";
import NotificationModel from '../../models/notificationModel.js';

// Create a new lead payment
export const createNewLeadPayment = async (req, res) => {
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

    // Create notification for operation person to partner
    const notification = new NotificationModel({
      title: 'Lead Payment Created',
      type: 'success',
      role: 'operation',
      notificationFor: partnerId,
      notificationBy: createdBy,
      createdBy,
    });

    await notification.save();

    res.status(200).json({
      message: "New Lead Payment created successfully",
      data: newLeadPayment,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Unable to create new lead payment",
      error: error.message,
    });
  }
};

// Get all payments
export const getAllLeadPayments = async (req, res) => {
  try {
    const payments = await leadPaymentModel.find();
    res.status(200).json({
      message: "Success! Here are all the payments",
      data: payments,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve payments",
      error: error.message,
    });
  }
};

// Get payments by leadId
export const getLeadPaymentsByLeadId = async (req, res) => {
  try {
    const { leadId } = req.query;
    if (!leadId) {
      return res.status(400).json({
        status: "failed",
        message: "leadId query parameter is required",
      });
    }

    const payments = await leadPaymentModel.find({ leadId });
    if (payments.length === 0) {
      return res.status(404).json({
        status: "failed",
        message: "No payments found for the provided leadId",
      });
    }

    res.status(200).json({
      message: "Success! Here are the payments",
      data: payments,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve payments",
      error: error.message,
    });
  }
};

// Get payments by Id
export const getLeadPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await leadPaymentModel.findById(id);
    if (!payment) {
      return res.status(404).json({ status: "failed", message: "Payment not found" });
    }

    res.status(200).json({
      message: "Success! Here is the payment",
      data: payment,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve payment",
      error: error.message,
    });
  }
};

// Update lead payment
export const updateLeadPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if lead payment exists and update
    const updatedLeadPayment = await leadPaymentModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedLeadPayment) {
      return res.status(404).json({ status: 'failed', message: 'Lead payment not found' });
    }

    // Create notification for update
    const notification = new NotificationModel({
      title: `Lead Payment Updated`,
      type: 'success',
      role: 'operation',
      notificationFor: updatedLeadPayment.partnerId,
      notificationBy: updateData.createdBy,
      createdBy: updateData.createdBy,
    });

    await notification.save();

    res.status(200).json({
      message: 'Lead payment updated successfully',
      data: updatedLeadPayment,
      status: 'success'
    });
  } catch (error) {
    res.status(500).json({
      status: 'failed',
      message: 'Unable to update lead payment',
      error: error.message
    });
  }
};

// Delete lead payment
export const deleteLeadPayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if lead payment exists
    const leadPayment = await leadPaymentModel.findById(id);
    if (!leadPayment) {
      return res.status(404).json({ status: "failed", message: "Lead payment not found" });
    }

    // Delete the lead payment
    await leadPaymentModel.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "Lead payment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "failed", message: "Unable to delete the lead payment" });
  }
};

