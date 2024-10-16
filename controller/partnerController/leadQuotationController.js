import leadQuotationModel from "../../models/partnerModels/leadQuotationSchema.js";
import leadGenerateModel from "../../models/partnerModels/leadGenerateSchema.js";
import upload from "../../middlewares/uploadMiddleware.js";
import NotificationModel from '../../models/notificationModel.js';

// Create a new quotation
export const createNewQuotation = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.files) {
      return res.status(400).json({ message: "No file selected!" });
    }

    try {
      const {
        leadId,
        comments,
        quotationImage,
        status,
        partnerId,
        partnerName,
        operationId,
        operationName,
        createdBy,
      } = req.body;

      const fileDetails = Object.keys(req.files).reduce((acc, key) => {
        req.files[key].forEach((file) => {
          acc[file.fieldname] = file.filename;
        });
        return acc;
      }, {});

      const missingFields = [];
      if (!leadId) missingFields.push("leadId");
      if (!status) missingFields.push("status");
      if (!partnerId && !operationId) missingFields.push("partnerId or operationId");

      if (missingFields.length > 0) {
        return res.status(400).json({
          status: "failed",
          message: `Required fields are missing: ${missingFields.join(", ")}`,
        });
      }

      const newQuotation = new leadQuotationModel({
        leadId,
        ...fileDetails,
        comments,
        status,
        partnerId,
        partnerName,
        operationId,
        operationName,
        createdBy,
      });

      await newQuotation.save();

      // Log the saved quotation
      console.log('New Quotation Saved:', newQuotation);

      if (newQuotation) {
        // Fetch lead by leadId
        const leadData = await leadGenerateModel.findById(leadId);

        // Log fetched lead data
        console.log('Lead Data Fetched:', leadData);

        if (!leadData) {
          return res.status(404).json({
            status: "failed",
            message: "Lead not found with the provided leadId",
          });
        }

        await leadGenerateModel.findByIdAndUpdate(
          leadId,
          { status },
          { new: true }
        );

        const { leadCreatedBy, partnerId: leadPartnerId } = leadData;

        let notificationFor;
        let notificationBy;

        if (partnerId === leadCreatedBy) {
          notificationFor = leadPartnerId;
          notificationBy = partnerId;
        } else if (partnerId === leadPartnerId) {
          notificationFor = leadCreatedBy;
          notificationBy = partnerId;
        } else {
          return res.status(400).json({
            status: "failed",
            message: "Partner ID doesn't match with leadCreatedBy or partnerId in the lead",
          });
        }

        const title = `Lead quotation generated:- ${status}`;

        const newNotification = new NotificationModel({
          title,
          type: 'success',
          role: partnerId === leadCreatedBy ? 'operation' : 'partner',
          notificationFor,
          notificationBy,
          createdBy,
        });

        await newNotification.save();

        res.status(200).json({
          message: "New Quotation created successfully",
          data: newQuotation,
          status: "success",
        });
      }
    } catch (error) {
      res.status(500).json({
        status: "failed",
        message: "Unable to create new quotation",
        error: error.message,
      });
    }
  });
};

// Get all quotations
export const getAllQuotation = async (req, res) => {
  try {
    const quotations = await leadQuotationModel.find();
    res.status(200).json({
      message: "Success! Here are all the quotations",
      data: quotations,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve quotations",
      error: error.message,
    });
  }
};

// Get quotation by ID
export const getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await leadQuotationModel.findById(id);
    if (!quotation) {
      return res
        .status(404)
        .json({ status: "failed", message: "Quotation not found" });
    }
    res.status(200).json({
      message: "Success! Here is the quotation",
      data: quotation,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve quotation",
      error: error.message,
    });
  }
};

// Get quotations by leadId
export const getQuotationsByLeadId = async (req, res) => {
  try {
    const { leadId } = req.query;
    if (!leadId) {
      return res.status(400).json({
        status: "failed",
        message: "leadId query parameter is required",
      });
    }

    const quotations = await leadQuotationModel.find({ leadId });
    if (quotations.length === 0) {
      return res.status(404).json({
        status: "failed",
        message: "No quotations found for the provided leadId",
      });
    }
    res.status(200).json({
      message: "Success! Here are the quotations",
      data: quotations,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve quotations",
      error: error.message,
    });
  }
};

// Update quotation by ID
export const updateQuotation = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    try {
      const { id } = req.params;
      const { status, updatedBy, partnerId, partnerName, operationId, operationName } = req.body;

      const existingQuotation = await leadQuotationModel.findById(id);
      if (!existingQuotation) {
        return res
          .status(404)
          .json({ status: "failed", message: "Quotation not found" });
      }

      const fileDetails = Object.keys(req.files || {}).reduce((acc, key) => {
        req.files[key].forEach((file) => {
          acc[file.fieldname] = file.filename;
        });
        return acc;
      }, {});

      const updatedData = {
        ...req.body,
        ...fileDetails,
      };

      const updatedQuotation = await leadQuotationModel.findByIdAndUpdate(
        id,
        updatedData,
        { new: true }
      );

      if (status && status !== existingQuotation.status) {
        const notificationBy = operationId ? operationId : partnerId ? partnerId : updatedBy;
        const notificationFor = operationId ? "operation" : partnerId ? "partner" : "other";

        const newNotification = new NotificationModel({
          title: `Quotation Status changed to ${status}`,
          type: 'success',
          role: operationId ? 'operation' : 'partner',
          notificationFor,
          notificationBy,
          createdBy: updatedBy,
        });

        await newNotification.save();
      }

      res.status(200).json({
        message: "Quotation updated successfully",
        data: updatedQuotation,
        status: "success",
      });
    } catch (error) {
      res.status(500).json({
        status: "failed",
        message: "Unable to update Quotation",
        error: error.message,
      });
    }
  });
};

// Delete quotation by ID
export const deleteQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await leadQuotationModel.findById(id);
    if (!quotation) {
      return res
        .status(404)
        .json({ status: "failed", message: "Quotation not found" });
    }

    await leadQuotationModel.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "Quotation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Unable to delete the quotation",
      error: error.message,
    });
  }
};

