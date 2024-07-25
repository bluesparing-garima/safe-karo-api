import creditAndDebit from "../../models/accountsModels/creditAndDebitSchema.js";
import Account from "../../models/accountsModels/accountSchema.js";
import motorPolicyPayment from '../../models/policyModel/motorPolicyPaymentSchema.js';
 
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
      remarks,
      createdBy,
      createdOn,
    } = req.body;

    const lowerCaseType = type.toLowerCase();

    const newCreditAndDebit = new creditAndDebit({
      accountType,
      type: lowerCaseType,
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
      remarks,
      policyNumber,
      startDate,
      endDate,
      createdBy,
      createdOn,
    });
    await newCreditAndDebit.save();

    // Update the account balance
    let account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({
        message: "Account not found",
        status: "error",
      });
    }

    if (lowerCaseType === "credit") {
      account.amount += amount;
    } else if (lowerCaseType === "debit") {
      account.amount -= amount;
    }

    await account.save();

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
    const credits = await creditAndDebit.find();
    res.status(200).json({
      message: "Transactions retrieved successfully",
      data: credits,
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

// Get a credit and debit transaction by ID
export const getCreditAndDebitById = async (req, res) => {
  try {
    const { id } = req.params;
    const credit = await creditAndDebit.findById(id);

    if (!credit) {
      return res.status(404).json({
        message: "Transaction not found",
        status: "error",
      });
    }

    res.status(200).json({
      message: "Transaction retrieved successfully",
      data: credit,
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

    const existingTransaction = await creditAndDebit.findById(id);
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
    const lowerCaseType = type.toLowerCase();
    if (lowerCaseType === "credit") {
      account.amount += amount;
    } else if (lowerCaseType === "debit") {
      account.amount -= amount;
    }

    await account.save();

    const updatedCreditAndDebit = await creditAndDebit.findByIdAndUpdate(
      id,
      { ...req.body, type: lowerCaseType },
      { new: true }
    );

    res.status(200).json({
      message: "Transaction updated successfully",
      data: updatedCreditAndDebit,
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

    const deletedCredit = await creditAndDebit.findByIdAndDelete(id);

    if (!deletedCredit) {
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

// Get Credit And Debit by Date Range and Broker Name
export const getCreditAndDebitByDateRangeAndBrokerName = async (req, res) => {
  const { startDate, endDate, brokerName } = req.query;

  if (!startDate || !endDate || !brokerName) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Start date, end date, and broker name are required.",
    });
  }

  try {
    // Convert startDate to MongoDB date object for the start of the day
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);
    // Convert endDate to MongoDB date object for the end of the day
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);
    // Query to find documents within the date range and broker name
    const creditAndDebits = await creditAndDebit.find({
      startDate: {
        $gte: startDateObj,
      },
      endDate: {
        $lte: endDateObj,
      },
      brokerName: brokerName,
    });

    if (creditAndDebits.length === 0) {
      return res.status(404).json({
        message:
          "No credit and debit data found within the specified date range and broker name.",
        success: false,
        status: "error",
      });
    }

    res.status(200).json({
      message: "Credit and Debit data retrieved successfully.",
      data: creditAndDebits,
      success: true,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving credit and debit data.",
      success: false,
      error: error.message,
    });
  }
};

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
    // Convert startDate to MongoDB date object for the start of the day
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);
    // Convert endDate to MongoDB date object for the end of the day
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    // Query to find documents within the date range and broker name
    const creditAndDebits = await creditAndDebit.find({
      startDate: {
        $gte: startDateObj,
      },
      endDate: {
        $lte: endDateObj,
      },
      brokerName: brokerName,
    });

    if (creditAndDebits.length === 0) {
      return res.status(404).json({
        message:
          "No credit and debit data found within the specified date range and broker name.",
        success: false,
        status: "error",
      });
    }

    // Calculate the total amount
    const totalAmount = creditAndDebits.reduce(
      (total, record) => total + record.amount,
      0
    );

    res.status(200).json({
      message: "Total amount calculated successfully.",
      totalAmount: totalAmount,
      success: true,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving credit and debit data.",
      success: false,
      error: error.message,
    });
  }
};

export const getCreditAndDebitByDateRangeAndPartnerId = async (req, res) => {
  const { startDate, endDate, partnerId } = req.query;

  if (!startDate || !endDate || !partnerId) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Start date, end date, and partner name are required.",
    });
  }

  try {
    // Convert startDate to MongoDB date object for the start of the day
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);
    // Convert endDate to MongoDB date object for the end of the day
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
        message:
          "No credit and debit data found within the specified date range and partner name.",
        success: false,
        status: "error",
      });
    }

    const totalPayOutCommission = result[0].totalPayOutCommission;

    res.status(200).json({
      message: "Credit and Debit data retrieved successfully.",
      totalPayOutCommission: totalPayOutCommission,
      success: true,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving credit and debit data.",
      success: false,
      error: error.message,
    });
  }
};

