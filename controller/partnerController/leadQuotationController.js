import mongoose from 'mongoose';
import leadQuotationModel from "../../models/partnerModels/leadQuotationSchema.js";
import leadGenerateModel from "../../models/partnerModels/leadGenerateSchema.js";
import upload from "../../middlewares/uploadMiddleware.js";

// Create a new quotation
export const createNewQuotation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    upload(req, res, async (err) => {
      if (err) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: err.message });
      }
      if (!req.files) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "No file selected!" });
      }

      const {
        leadId,
        comments,
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
        await session.abortTransaction();
        session.endSession();
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

      await newQuotation.save({ session });

      const updatedLead = await leadGenerateModel.findByIdAndUpdate(
        leadId,
        { status },
        { new: true, session }
      );

      if (!updatedLead) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          status: "failed",
          message: "Related lead not found",
        });
      }

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        message: "New Quotation created successfully",
        data: newQuotation,
        status: "success",
      });
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      status: "failed",
      message: "Unable to create new quotation",
      error: error.message,
    });
  }
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    upload(req, res, async (err) => {
      if (err) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: err.message });
      }

      const { id } = req.params;
      const updateData = req.body;

      const existingQuotation = await leadQuotationModel.findById(id);
      if (!existingQuotation) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          status: "failed",
          message: "Quotation not found",
        });
      }

      if (req.files) {
        if (updateData.status && updateData.status === existingQuotation.status) {
          updateData.quotationImage = req.files.filename;
        } else {
          // If status is different, keep the previous file
          updateData.quotationImage = existingQuotation.quotationImage;
        }
      }

      const updatedQuotation = await leadQuotationModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, session }
      );

      if (!updatedQuotation) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          status: "failed",
          message: "Quotation not found",
        });
      }

      // Update lead status if quotation status has been updated
      if (updateData.status) {
        const updatedLead = await leadGenerateModel.findByIdAndUpdate(
          updatedQuotation.leadId,
          { status: updateData.status },
          { new: true, session }
        );

        if (!updatedLead) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({
            status: "failed",
            message: "Related lead not found",
          });
        }
      }

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        message: "Quotation updated successfully",
        data: updatedQuotation,
        status: "success",
      });
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      status: "failed",
      message: "Unable to update quotation",
      error: error.message,
    });
  }
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

