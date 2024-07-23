import leadQuotationModel from "../../models/partnerModels/leadQuotationSchema.js";
import leadGenerateModel from "../../models/partnerModels/leadGenerateSchema.js";
import upload from "../../middlewares/uploadMiddleware.js";

// Create a new quotation
const createNewQuotation = async (req, res) => {
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
      if (!partnerId) missingFields.push("partnerId");

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
        createdBy,
      });

      await newQuotation.save();
      if (newQuotation) {
        // Update lead status
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
const getAllQuotation = async (req, res) => {
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
const getQuotationById = async (req, res) => {
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
const getQuotationsByLeadId = async (req, res) => {
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
const updateQuotation = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if the quotation exists
      const existingQuotation = await leadQuotationModel.findById(id);
      if (!existingQuotation) {
        return res
          .status(404)
          .json({ status: "failed", message: "Quotation not found" });
      }

      if (req.files) {
        if (
          updateData.status &&
          updateData.status === existingQuotation.status
        ) {
          existingQuotation.quotationImage = req.files.filename;
        } else {
          // If status is different, keep the previous file
          updateData.quotationImage = existingQuotation.quotationImage;
        }
      }

      // Update the quotation
      const updatedQuotation = await leadQuotationModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!updatedQuotation) {
        return res
          .status(404)
          .json({ status: "failed", message: "Quotation not found" });
      }

      // Update lead status if quotation status has updated
      if (updateData.status) {
        const updatedLead = await leadGenerateModel.findByIdAndUpdate(
          updatedQuotation.leadId,
          { status: updateData.status },
          { new: true }
        );

        if (!updatedLead) {
          return res
            .status(404)
            .json({ status: "failed", message: "Related lead not found" });
        }
      }

      res.status(200).json({
        message: "Quotation updated successfully",
        data: updatedQuotation,
        status: "success",
      });
    } catch (error) {
      res.status(500).json({
        status: "failed",
        message: "Unable to update quotation",
        error: error.message,
      });
    }
  });
};

// Delete quotation by ID
const deleteQuotation = async (req, res) => {
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

export {
  createNewQuotation,
  getAllQuotation,
  getQuotationsByLeadId,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
};
