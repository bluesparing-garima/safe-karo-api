import CreditAndDebit from "../../models/accountsModels/creditAndDebitSchema.js";
import Account from "../../models/accountsModels/accountSchema.js";
import MotorPolicyPayment from "../../models/policyModel/motorPolicyPaymentSchema.js";
import Debit from "../../models/accountsModels/debitsSchema.js";
import motorPolicyPayment from "../../models/policyModel/motorPolicyPaymentSchema.js";

// Function to generate transaction code
const generateTransactionCode = async () => {
  const lastTransaction = await CreditAndDebit.findOne({})
    .sort({ createdOn: -1 })
    .exec();

  let newTransactionCode;

  if (lastTransaction && lastTransaction.transactionCode) {
    const lastCode = lastTransaction.transactionCode;
    const numericPart = parseInt(lastCode.slice(5), 10);
    const nextNumber = numericPart + 1;
    newTransactionCode = `SAFEK${String(nextNumber).padStart(3, '0')}`;
  } else {
    newTransactionCode = "SAFEK001";
  }

  return newTransactionCode;
};

// Create a new credit and debit transaction
export const createCreditAndDebit = async (req, res) => {
  try {
    const {
      accountType,
      type,
      employeeId,
      employeeName,
      accountId,
      accountCode,
      amount,
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

    const transactionType = type.toLowerCase();

    // Check if the CutPay amount has already been paid
    const existingMotorPolicyPayment = await MotorPolicyPayment.findOne({
      partnerId,
      policyNumber,
      payOutPaymentStatus: "Paid",
    });

    const existingDebitEntry = await Debit.findOne({
      partnerId,
      policyNumber,
      payOutPaymentStatus: "Paid",
    });

    const existingCreditAndDebit = await CreditAndDebit.findOne({
      partnerId,
      policyNumber,
      type: "debit",
      accountType: "CutPay",
    });

    if (existingMotorPolicyPayment && existingDebitEntry && existingCreditAndDebit) {
      return res.status(400).json({
        status: "error",
        message: "The CutPay amount has already been paid for this partner for this policy number.",
      });
    }

    // Update the account balance and handle CutPay debit transactions
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({
        message: "Account not found",
        status: "error",
      });
    }

    if (accountType === "CutPay" && transactionType === "debit") {
      // Handle CutPay Debit Logic
      const motorPolicy = await MotorPolicyPayment.findOneAndUpdate(
        { partnerId, policyNumber },
        {
          payOutAmount: amount,
          payOutCommission: amount,
          payOutPaymentStatus: "Paid",
          payOutBalance: 0,
        },
        { new: true } // Return the updated document
      );

      if (!motorPolicy) {
        return res.status(404).json({
          status: "error",
          message: "Motor policy payment not found.",
        });
      }

      // Generate a transaction code for the new debit
      const transactionCode = await generateTransactionCode();

      // Create a new Debit entry using the updated motorPolicy data
      const newDebitEntry = new Debit({
        policyNumber,
        partnerId,
        payOutAmount: motorPolicy.payOutAmount,
        payOutCommission: motorPolicy.payOutCommission,
        payOutPaymentStatus: motorPolicy.payOutPaymentStatus,
        payOutBalance: 0,
        policyDate: motorPolicy.policyDate,
        createdBy,
        transactionCode, // Save the transaction code in the Debit entry
      });

      await newDebitEntry.save();

      // Update the account balance
      account.amount -= amount;
      await account.save();

      // Create a new CreditAndDebit entry
      const newCreditAndDebit = new CreditAndDebit({
        accountType,
        type: transactionType,
        employeeId,
        employeeName,
        accountId,
        accountCode,
        amount,
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
        transactionCode, // Save the transaction code in the CreditAndDebit entry
      });

      await newCreditAndDebit.save();

      return res.status(201).json({
        status: "success",
        message: "CutPay debit transaction processed successfully.",
        data: newCreditAndDebit,
      });
    }

    // Handle regular Credit or Debit transactions
    if (transactionType === "credit") {
      account.amount += amount;
    } else if (transactionType === "debit") {
      account.amount -= amount;
    }

    await account.save();

    const transactionCode = await generateTransactionCode();

    const newCreditAndDebit = new CreditAndDebit({
      accountType,
      type: transactionType,
      employeeId,
      employeeName,
      accountId,
      accountCode,
      amount,
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
      transactionCode, // Save the transaction code in the CreditAndDebit entry
    });

    await newCreditAndDebit.save();

    res.status(201).json({
      message: "Transaction created successfully",
      data: newCreditAndDebit,
      status: "success",
    });
  } catch (error) {
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
        message:
          "No credit data found within the specified date range and broker ID.",
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
        message:
          "No debit data found within the specified date range and partner ID.",
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

// Update a credit and debit transaction by ID
export const updateCreditAndDebitById = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, accountId } = req.body;

    const existingTransaction = await CreditAndDebit.findById(id);
    if (!existingTransaction) {
      return res.status(404).json({
        message: "Transaction not found",
        status: "error",
      });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({
        message: "Account not found",
        status: "error",
      });
    }

    // Revert the balance change of the existing transaction
    if (existingTransaction.type === "credit") {
      account.amount -= existingTransaction.amount;
    } else if (existingTransaction.type === "debit") {
      account.amount += existingTransaction.amount;
    }

    // Apply the new balance change
    const transactionType = type.toLowerCase();
    if (transactionType === "credit") {
      account.amount += amount;
    } else if (transactionType === "debit") {
      account.amount -= amount;
    }

    await account.save();

    const updatedTransaction = await CreditAndDebit.findByIdAndUpdate(
      id,
      { ...req.body, type: transactionType },
      { new: true }
    );

    res.status(200).json({
      message: "Transaction updated successfully",
      data: updatedTransaction,
      status: "success",
    });
  } catch (error) {
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
