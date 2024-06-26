import leadQuotationModel from "../../models/agentModels/leadQuotationSchema.js";
import leadGenerateModel from "../../models/agentModels/leadGenerateSchema.js";

// Create a new quotation
const createNewQuotation = async (req, res) => {
  try {
    const { leadId, quotationImage, comments, status, partnerId, partnerName, createdBy } = req.body;

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
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Unable to create new quotation",
      error: error.message,
    });
  }
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
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve quotations" });
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
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve quotation" });
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
  try {
    const { id } = req.params;
    const updateData = req.body;

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
    res
      .status(500)
      .json({ status: "failed", message: "Unable to delete the quotation" });
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