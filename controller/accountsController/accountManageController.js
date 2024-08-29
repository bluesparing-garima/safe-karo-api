import AccountManage from "../../models/accountsModels/accountManageSchema.js";
import Account from "../../models/accountsModels/accountSchema.js";
import MotorPolicyPayment from "../../models/policyModel/motorPolicyPaymentSchema.js";
import Debit from "../../models/accountsModels/debitsSchema.js";
import moment from 'moment';

const generateTransactionCode = async (startDate, endDate, type, amount) => {
  try {
    if (!moment(startDate, "YYYY-MM-DD", true).isValid()) {
      throw new Error("Invalid startDate");
    }
    if (!moment(endDate, "YYYY-MM-DD", true).isValid()) {
      throw new Error("Invalid endDate");
    }

    const formattedStartDate = moment(startDate).format("DDMMYY");
    const formattedEndDate = moment(endDate).format("DDMMYY");
    const formattedAmount = amount ? String(amount).padStart(4, '0') : '0000';
    const currentDate = moment().format("DDMMYYYY");
    const currentTime = moment().format("[T]HH:mm:ss");

    return `PC${formattedStartDate}${formattedEndDate}AM${formattedAmount}${currentDate}${currentTime}`;
  } catch (error) {
    throw new Error("Error generating transaction code");
  }
};

// Create a new credit and debit transaction
export const createAccountManage = async (req, res) => {
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
      brokerBalance = 0
    } = req.body;

    const transactionType = type.toLowerCase();

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

    const existingAccountManage = await AccountManage.findOne({
      partnerId,
      policyNumber,
      type: "debit",
      accountType: "CutPay",
    });

    if (existingMotorPolicyPayment && existingDebitEntry && existingAccountManage) {
      return res.status(400).json({
        status: "error",
        message: "The CutPay amount has already been paid for this partner for this policy number.",
      });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({
        message: "Account not found",
        status: "error",
      });
    }

    if (accountType === "CutPay" && transactionType === "debit") {
      const motorPolicy = await MotorPolicyPayment.findOneAndUpdate(
        { partnerId, policyNumber },
        {
          payOutAmount: amount,
          payOutCommission: amount,
          payOutPaymentStatus: "Paid",
          payOutBalance: 0,
        },
        { new: true }
      );

      if (!motorPolicy) {
        return res.status(404).json({
          status: "error",
          message: "Motor policy payment not found.",
        });
      }

      const transactionCode = await generateTransactionCode(startDate, endDate, transactionType, amount);

      const newDebitEntry = new Debit({
        policyNumber,
        partnerId,
        payOutAmount: motorPolicy.payOutAmount,
        payOutCommission: motorPolicy.payOutCommission,
        payOutPaymentStatus: motorPolicy.payOutPaymentStatus,
        payOutBalance: 0,
        policyDate: motorPolicy.policyDate,
        createdBy,
        transactionCode,
      });

      await newDebitEntry.save();

      account.amount -= amount;
      await account.save();

      const newAccountManage = new AccountManage({
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
        brokerBalance,
        transactionCode,
      });

      await newAccountManage.save();

      return res.status(201).json({
        status: "success",
        message: "CutPay debit transaction processed successfully.",
        data: newAccountManage,
      });
    }

    if (transactionType === "credit") {
      account.amount += amount;
    } else if (transactionType === "debit") {
      account.amount -= amount;
    }

    await account.save();

    const transactionCode = await generateTransactionCode(startDate, endDate, transactionType, amount);

    const newAccountManage = new AccountManage({
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
      brokerBalance,
      transactionCode, 
    });

    await newAccountManage.save();

    res.status(201).json({
      message: "Transaction created successfully",
      data: newAccountManage,
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
export const getAccountManage = async (req, res) => {
  try {
    const transactions = await AccountManage.find();
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

// Get all account details bu accoutn Id
export const getAccountDetailsByAccountId = async (req, res) => {
  try {
    const { accountId } = req.params;

    // Find all related transactions for the account using accountId in the AccountManage table
    const transactions = await AccountManage.find({ accountId });

    if (!transactions.length) {
      return res.status(404).json({
        status: "error",
        message: "No transactions found for this account",
      });
    }

    // Return the transactions directly in the response
    res.status(200).json({
      status: "success",
      message: "Account details retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error retrieving account details",
      error: error.message,
    });
  }
};


// Get credit details by date range and broker ID
export const getAccountDetailsByBrokerId = async (req, res) => {
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

    const transactions = await AccountManage.find({
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
export const getAccountDetailsByPartnerId = async (req, res) => {
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

    const transactions = await AccountManage.find({
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
export const getAccountManageById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await AccountManage.findById(id);

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
export const updateAccountManageById = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, accountId } = req.body;

    const existingTransaction = await AccountManage.findById(id);
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
      account.amount += existingTransaction.amount;
    } else if (existingTransaction.type === "debit") {
      account.amount -= existingTransaction.amount;
    }

    // Apply the new balance change
    const transactionType = type.toLowerCase();
    if (transactionType === "credit") {
      account.amount += amount;
    } else if (transactionType === "debit") {
      account.amount -= amount;
    }

    await account.save();

    const updatedTransaction = await AccountManage.findByIdAndUpdate(
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
export const deleteAccountManageById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTransaction = await AccountManage.findByIdAndDelete(id);

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
export const getAccountDetailsByDateRangeAndBrokerName = async (req, res) => {
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

    const transactions = await AccountManage.find({
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

    const AccountManages = await AccountManage.find({
      startDate: { $gte: startDateObj },
      endDate: { $lte: endDateObj },
      brokerName,
    });

    if (AccountManages.length === 0) {
      return res.status(404).json({
        status: "error",
        success: false,
        message:
          "No credit and debit data found within the specified date range and broker name.",
      });
    }

    const totalAmount = AccountManages.reduce(
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
export const getAccountDetailsByDateRangeAndPartnerId = async (req, res) => {
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

    const AccountManages = await AccountManage.find({
      startDate: { $gte: startDateObj },
      endDate: { $lte: endDateObj },
      partnerId,
    });

    if (AccountManages.length === 0) {
      return res.status(404).json({
        status: "error",
        success: false,
        message:
          "No credit and debit data found within the specified date range and partnerId.",
      });
    }

    const totalAmount = AccountManages.reduce(
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