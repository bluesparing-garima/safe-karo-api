import mongoose from "mongoose";
import CreditAndDebit from "../../models/accountsModels/creditAndDebitSchema.js";
import MotorPolicyPayment from "../../models/policyModel/motorPolicyPaymentSchema.js";
import Debit from "../../models/accountsModels/debitsSchema.js";
import moment from "moment";

// Generate a transaction code
const generateTransactionCode = async (startDate, endDate, credit, debit) => {
  try {
    if (!moment(startDate).isValid()) {
      throw new Error("Invalid startDate");
    }
    if (!moment(endDate).isValid()) {
      throw new Error("Invalid endDate");
    }

    const formattedStartDate = moment(startDate).format("DDMMYY");
    const formattedEndDate = moment(endDate).format("DDMMYY");
    const formattedAmount = credit ? String(credit) : debit ? String(debit) : '0000';
    const currentDate = moment().format("DDMMYYYY");
    const currentTime = moment().format("[T]HH:mm:ss");

    const newTransactionCode = `PC${formattedStartDate}${formattedEndDate}AM${formattedAmount}${currentDate}${currentTime}`;
    return newTransactionCode;
  } catch (error) {
    console.error("Error generating transaction code:", error.message);
    throw new Error("Invalid startDate or endDate");
  }
};

// Create a new credit and debit transaction
export const createCreditAndDebit = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      accountType,
      credit,
      debit,
      employeeId,
      employeeName,
      accountId,
      accountCode,
      userName,
      userId,
      partnerId,
      partnerName,
      brokerId,
      brokerName,
      policyNumber,
      startDate,
      endDate,
      distributedDate,
      remarks,
      createdBy,
      createdOn,
      partnerBalance,
    } = req.body;

    // Check for existing motor policy payment, debit, and CutPay transactions
    const existingMotorPolicyPayment = await MotorPolicyPayment.findOne({
      partnerId,
      policyNumber,
      payOutPaymentStatus: "Paid",
    }).session(session);

    const existingDebitEntry = await Debit.findOne({
      partnerId,
      policyNumber,
      payOutPaymentStatus: "Paid",
    }).session(session);

    const existingCreditAndDebit = await CreditAndDebit.findOne({
      partnerId,
      policyNumber,
      debit: { $ne: null },
      accountType: "CutPay",
    }).session(session);

    if (existingMotorPolicyPayment && existingDebitEntry && existingCreditAndDebit) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "The CutPay amount has already been paid for this partner for this policy number.",
      });
    }

    // Generate transaction code
    const transactionCode = await generateTransactionCode(startDate, endDate, credit, debit);

    // Create a new CreditAndDebit entry
    const newCreditAndDebit = new CreditAndDebit({
      accountType,
      credit: credit ? parseFloat(credit) : 0,
      debit: debit ? parseFloat(debit) : 0,
      employeeId,
      employeeName,
      accountId,
      accountCode,
      userName,
      userId,
      partnerId,
      partnerName,
      brokerId,
      brokerName,
      policyNumber,
      startDate,
      endDate,
      distributedDate,
      remarks,
      createdBy,
      createdOn,
      partnerBalance,
      transactionCode,
    });

    await newCreditAndDebit.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Transaction created successfully",
      data: newCreditAndDebit,
      status: "success",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating transaction:", error.message);
    res.status(500).json({
      message: "Error creating transaction",
      error: error.message,
      status: "error",
    });
  }
};

// Get all credit and debit transactions
export const getCreditAndDebit = async (req, res) => {
  try {
    const transactions = await CreditAndDebit.find();
    res.status(200).json({
      message: "Transactions retrieved successfully",
      data: transactions,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving transactions",
      error: error.message,
      status: "error",
    });
  }
};

// Get credit details by date range and broker ID
export const getCreditDetailsByBrokerId = async (req, res) => {
  const { startDate, endDate, brokerId } = req.query;

  if (!startDate || !endDate || !brokerId) {
    return res.status(400).json({
      status: "error",
      message: "Start date, end date, and broker ID are required.",
    });
  }

  try {    
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);

    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    const transactions = await CreditAndDebit.find({
      startDate: { $gte: startDateObj },
      endDate: { $lte: endDateObj },
      brokerId,
    });

    if (transactions.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No credit data found for the specified date range and broker ID.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Credit data retrieved successfully.",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error retrieving credit data.",
      error: error.message,
    });
  }
};

// Get debit details by date range and partner ID
export const getDebitDetailsByPartnerId = async (req, res) => {
  const { startDate, endDate, partnerId } = req.query;

  if (!startDate || !endDate || !partnerId) {
    return res.status(400).json({
      status: "error",
      message: "Start date, end date, and partner ID are required.",
    });
  }

  try { 
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);

    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);
    
    const transactions = await CreditAndDebit.find({
      startDate: { $gte: startDateObj },
      endDate: { $lte: endDateObj },
      partnerId,
    });

    if (transactions.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No debit data found for the specified date range and partner ID.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Debit data retrieved successfully.",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error retrieving debit data.",
      error: error.message,
    });
  }
};

// Get a credit and debit transaction by ID
export const getCreditAndDebitById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await CreditAndDebit.findById(id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
        status: "error",
      });
    }

    res.status(200).json({
      message: "Transaction retrieved successfully",
      data: transaction,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving transaction",
      error: error.message,
      status: "error",
    });
  }
};

// Update a credit and debit transaction by ID with transaction
export const updateCreditAndDebitById = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { credit, debit } = req.body;

    const updatedTransaction = await CreditAndDebit.findByIdAndUpdate(
      id,
      { credit: credit ? parseFloat(credit) : 0, debit: debit ? parseFloat(debit) : 0, ...req.body },
      { new: true, session }
    );

    if (!updatedTransaction) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message: "Transaction not found",
        status: "error",
      });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Transaction updated successfully",
      data: updatedTransaction,
      status: "success",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating transaction:", error.message);
    res.status(500).json({
      message: "Error updating transaction",
      error: error.message,
      status: "error",
    });
  }
};

// Delete a credit and debit transaction by ID
export const deleteCreditAndDebitById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTransaction = await CreditAndDebit.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return res.status(404).json({
        message: "Transaction not found",
        status: "error",
      });
    }

    res.status(200).json({
      message: "Transaction deleted successfully",
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting transaction",
      error: error.message,
      status: "error",
    });
  }
};


// Get credit and debit by date range and broker name
export const getCreditAndDebitByDateRangeAndBrokerName = async (req, res) => {
  const { startDate, endDate, brokerName } = req.query;

  if (!startDate || !endDate || !brokerName) {
    return res.status(400).json({
      status: "error",
      message: "Start date, end date, and broker name are required.",
    });
  }

  try {
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);

    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    const transactions = await CreditAndDebit.find({
      startDate: { $gte: startDateObj },
      endDate: { $lte: endDateObj },
      brokerName,
    });

    if (transactions.length === 0) {
      return res.status(404).json({
        status: "error",
        message:
          "No credit and debit data found within the specified date range and broker name.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Credit and debit data retrieved successfully.",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error retrieving credit and debit data.",
      error: error.message,
    });
  }
};

// Get Total Amount by Date Range and Broker Name
export const getTotalAmountByDateRangeAndBrokerName = async (req, res) => {
  const { startDate, endDate, brokerName } = req.query;

  if (!startDate || !endDate || !brokerName) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Start date, end date, and broker name are required.",
    });
  }

  try {
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);

    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    const creditAndDebits = await CreditAndDebit.find({
      startDate: { $gte: startDateObj },
      endDate: { $lte: endDateObj },
      brokerName,
    });

    if (creditAndDebits.length === 0) {
      return res.status(404).json({
        status: "error",
        success: false,
        message:
          "No credit and debit data found within the specified date range and broker name.",
      });
    }

    const totalAmount = creditAndDebits.reduce(
      (total, record) => total + record.amount,
      0
    );

    res.status(200).json({
      status: "success",
      success: true,
      message: "Total amount calculated successfully.",
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      success: false,
      message: "Error retrieving credit and debit data.",
      error: error.message,
    });
  }
};

// Get Total Payout Commission by Date Range and Partner ID
export const getCreditAndDebitByDateRangeAndPartnerId = async (req, res) => {
  const { startDate, endDate, partnerId } = req.query;

  if (!startDate || !endDate || !partnerId) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Start date, end date, and partner ID are required.",
    });
  }

  try {
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);

    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    const result = await motorPolicyPayment.aggregate([
      {
        $match: {
          policyDate: {
            $gte: startDateObj,
            $lte: endDateObj,
          },
          partnerId: partnerId,
        },
      },
      {
        $group: {
          _id: null,
          totalPayOutCommission: { $sum: "$payOutCommission" },
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(404).json({
        status: "error",
        success: false,
        message:
          "No credit and debit data found within the specified date range and partner ID.",
      });
    }

    const totalPayOutCommission = result[0].totalPayOutCommission;

    res.status(200).json({
      status: "success",
      success: true,
      message: "Credit and Debit data retrieved successfully.",
      totalPayOutCommission,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      success: false,
      message: "Error retrieving credit and debit data.",
      error: error.message,
    });
  }
};

// Get Debit data by Date Range and PartnerId
export const getTotalAmountByDateRangeAndPartnerId = async (req, res) => {
  const { startDate, endDate, partnerId } = req.query;

  if (!startDate || !endDate || !partnerId) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Start date, end date, and partner name are required.",
    });
  }

  try {
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);

    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    const creditAndDebits = await CreditAndDebit.find({
      startDate: { $gte: startDateObj },
      endDate: { $lte: endDateObj },
      partnerId,
    });

    if (creditAndDebits.length === 0) {
      return res.status(404).json({
        status: "error",
        success: false,
        message:
          "No credit and debit data found within the specified date range and partnerId.",
      });
    }

    const totalAmount = creditAndDebits.reduce(
      (total, record) => total + record.amount,
      0
    );

    res.status(200).json({
      status: "success",
      success: true,
      message: "Total amount calculated successfully.",
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      success: false,
      message: "Error retrieving credit and debit data.",
      error: error.message,
    });
  }
};

// get credit and debit data by TransactionCode and partnerId
export const getCreditAndDebitDetailsByTransactionCodeAndPartnerId = async (req, res) => {
  const { transactionCode, partnerId } = req.query;

  if (!transactionCode || !partnerId) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Transaction code and partner ID are required.",
    });
  }

  try {
    const debitDetails = await creditAndDebitSchema.findOne({
      transactionCode,
      partnerId,
    });

    if (!debitDetails) {
      return res.status(404).json({
        status: "error",
        success: false,
        message: "No debit details found for the provided transaction code and partner ID.",
      });
    }

    res.status(200).json({
      status: "success",
      success: true,
      message: "Debit details retrieved successfully.",
      data: debitDetails,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      success: false,
      message: "Error retrieving debit details.",
      error: error.message,
    });
  }
};