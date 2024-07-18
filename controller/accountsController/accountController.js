import accountSchema from "../../models/accountsModels/accountSchema.js";

// Create Account
export const createAccount = async (req, res) => {
  try {
    const {
      accountNumber,
      accountHolderName,
      IFSCCode,
      amount,
      bankName,
      createdBy,
    } = req.body;

    // Generate accountCode
    const accountCode = `${accountHolderName.substring(0, 3)}${bankName.substring(0, 3)}${accountNumber.slice(-4)}`;

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
