import accountSchema from "../../models/accountsModels/accountSchema.js";
import creditAndDebit from "../../models/accountsModels/creditAndDebitSchema.js";

// Create Account
export const createAccount = async (req, res) => {
  try {
    const {
      accountNumber,
      accountHolderName,
      IFSCCode,
      amount,
      accountCode,
      bankName,
      createdBy,
    } = req.body;

    // Create a new account object
    const newAccount = new accountSchema({
      accountNumber,
      accountHolderName,
      IFSCCode,
      amount,
      bankName,
      accountCode,
      createdOn: new Date(),
      createdBy,
      updatedOn: null,
    });

    const existingAccount = await accountSchema.findOne({
      accountNumber,
    });

    if (existingAccount) {
      return res.status(400).json({
        message: "Account already exists",
        success: false,
        status: "error",
      });
    }

    const savedAccount = await newAccount.save();
    return res.status(200).json({
      status: "success",
      success: true,
      message: `AccountNumber ${accountNumber} created successfully`,
      data: savedAccount,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: error.message,
    });
  }
};

// Get All Account details
export const getAllAccountDetails = async (req, res) => {
  try {
    const accounts = await accountSchema.find();
    return res.status(200).json({
      status: "success",
      success: true,
      message: "All Account Details",
      data: accounts,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      success: false,
      message: error.message,
    });
  }
};

// Get credit and debit transactions by accountId
export const getAccountDetailsByAccountId = async (req, res) => {
  try {
    const { accountId } = req.params;

    if (!accountId) {
      return res.status(400).json({
        message: "AccountId is required",
        status: "error",
      });
    }

    const transactions = await creditAndDebit.find({ accountId });

    if (transactions.length === 0) {
      return res.status(404).json({
        message: "No transactions found for the given accountId",
        status: "error",
      });
    }

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

// Get Account by ID
export const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await accountSchema.findById(id);

    if (!account) {
      return res.status(404).json({
        status: "error",
        success: false,
        message: "Account not found",
      });
    }

    return res.status(200).json({
      status: "success",
      success: true,
      message: `Account details for ID ${id}`,
      data: account,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      success: false,
      message: error.message,
    });
  }
};

// Update Account
export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedOn = new Date();

    const updatedAccount = await accountSchema.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedAccount) {
      return res.status(404).json({
        status: "error",
        success: false,
        message: "Account not found",
      });
    }

    return res.status(200).json({
      status: "success",
      success: true,
      message: `Account with ID ${id} updated successfully`,
      data: updatedAccount,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      success: false,
      message: error.message,
    });
  }
};

// Delete Account
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAccount = await accountSchema.findByIdAndDelete(id);

    if (!deletedAccount) {
      return res.status(404).json({
        status: "error",
        success: false,
        message: "Account not found",
      });
    }

    return res.status(200).json({
      status: "success",
      success: true,
      message: `Account with ID ${id} deleted successfully`,
      data: deletedAccount,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      success: false,
      message: error.message,
    });
  }
};
