import accountSchema from "../../models/accountsModels/accountSchema.js";

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
