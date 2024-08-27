import mongoose from "mongoose";
import debits from "../../models/accountsModels/debitsSchema.js";

export const getAllDebits = async (req, res) => {
  // Start a session for transaction
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const allDebitRecords = await debits.find({}).session(session);

    if (!allDebitRecords || allDebitRecords.length === 0) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "No debit records found",
        success: false,
        status: "error",
      });
    }

    await session.commitTransaction();
    res.status(200).json({
      message: "All debit records retrieved successfully",
      data: allDebitRecords,
      success: true,
      status: "success",
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({
      message: "An error occurred while retrieving all debit records",
      error: err.message,
      success: false,
      status: "error",
    });
  } finally {
    session.endSession();
  }
};

export const getDebitsByPartnerId = async (req, res) => {
  const { partnerId } = req.params;

  // Start a session for transaction
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const debitRecords = await debits.find({ partnerId }).session(session);

    if (!debitRecords || debitRecords.length === 0) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "No debit records found for the given partnerId",
        success: false,
        status: "error",
      });
    }

    await session.commitTransaction();
    res.status(200).json({
      message: "Debit records retrieved successfully",
      data: debitRecords,
      success: true,
      status: "success",
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({
      message: "An error occurred while retrieving debit records",
      error: err.message,
      success: false,
      status: "error",
    });
  } finally {
    session.endSession();
  }
};

export const getDebitsByPartnerIdAndDateRange = async (req, res) => {
  const { partnerId } = req.params;
  const { startDate, endDate } = req.query;

  if (!partnerId || !startDate || !endDate) {
    return res.status(400).json({
      message: "Missing required parameters",
      success: false,
      status: "error",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const debitRecords = await debits.find({
      partnerId,
      policyDate: { $gte: start, $lte: end },
    }).session(session);

    if (!debitRecords || debitRecords.length === 0) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "No debit records found for the given partnerId and date range",
        success: false,
        status: "error",
      });
    }

    await session.commitTransaction();
    res.status(200).json({
      message: "Debit records retrieved successfully",
      data: debitRecords,
      success: true,
      status: "success",
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({
      message: "An error occurred while retrieving debit records",
      error: err.message,
      success: false,
      status: "error",
    });
  } finally {
    session.endSession();
  }
};

// get Debit data by TransactionCode and partnerId
export const getDebitDetailsByTransactionCodeAndPartnerId = async (req, res) => {
  const { transactionCode, partnerId } = req.query;

  if (!transactionCode || !partnerId) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Transaction code and partner ID are required.",
    });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const debitDetails = await debits.find({
      transactionCode,
      partnerId,
    }).session(session);

    if (!debitDetails || debitDetails.length === 0) {
      await session.abortTransaction();
      return res.status(404).json({
        status: "error",
        success: false,
        message: "No debit details found for the provided transaction code and partner ID.",
      });
    }

    await session.commitTransaction();
    res.status(200).json({
      status: "success",
      success: true,
      message: "Debit details retrieved successfully.",
      data: debitDetails,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      status: "error",
      success: false,
      message: "Error retrieving debit details.",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};
