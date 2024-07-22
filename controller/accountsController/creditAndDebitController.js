import creditAndDebit from "../../models/accountsModels/creditAndDebitSchema.js";
import Account from "../../models/accountsModels/accountSchema.js";

// Create a new credit and debit transaction
export const createCreditAndDebit = async (req, res) => {
  try {
    const {
      accountType,
      type,
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
      date,
      remarks,
      createdBy,
      createdOn,
    } = req.body;

    const lowerCaseType = type.toLowerCase();

    const newCreditAndDebit = new creditAndDebit({
      accountType,
      type: lowerCaseType,
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
      date,
      createdBy,
      createdOn,
    });
    await newCreditAndDebit.save();

    // Update the account balance
    const account = await Account.findById(accountId);
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
