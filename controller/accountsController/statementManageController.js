import StatementManage from "../../models/accountsModels/statementManageSchema.js";
import Account from "../../models/accountsModels/accountSchema.js";

// Create a new statement
export const createStatement = async (req, res) => {
  const {
    partnerBalance,
    payOutAmount,
    startDate,
    endDate,
    partnerId,
    accountId,
  } = req.body;

  try {
    const newStatement = new StatementManage({
      partnerBalance,
      payOutAmount,
      startDate,
      endDate,
      partnerId,
      accountId,
    });
    await newStatement.save();
    res.status(201).json({
      message: "Statement created successfully",
      data: newStatement,
      status: "success",
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating statement", error, status: "error" });
  }
};

// Read all statements
export const getAllStatements = async (req, res) => {
  try {
    const statements = await StatementManage.find();
    res.status(200).json({
      message: "Statements retrieved successfully",
      data: statements,
      status: "success",
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error retrieving statements", error, status: "error" });
  }
};

// Read statements by partner ID
export const getStatementsByPartnerId = async (req, res) => {
  const { partnerId } = req.params;

  if (!partnerId) {
    return res.status(400).json({
      message: "Missing required query parameter: partnerId",
      success: false,
      status: "error",
    });
  }

  try {
    const statements = await StatementManage.find({ partnerId });
    if (!statements.length) {
      return res.status(404).json({
        message: "No statements found for the given partnerId",
        success: false,
        status: "error",
      });
    }

    res.status(200).json({
      message: "Statements retrieved successfully",
      data: statements,
      success: true,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving statements",
      error: error.message,
      success: false,
      status: "error",
    });
  }
};

// Read a single statement by ID
export const getStatementById = async (req, res) => {
  try {
    const statement = await StatementManage.findById(req.params.id);
    if (!statement) {
      return res
        .status(404)
        .json({ message: "Statement not found", status: "error" });
    }
    res.status(200).json({
      message: "Statement retrieved successfully",
      data: statement,
      status: "success",
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error retrieving statement", error, status: "error" });
  }
};

// Read statements by partnerId and date range (query parameters) with account details
export const getStatementsByPartnerIdAndDateRangeQuery = async (req, res) => {
  const { partnerId, startDate, endDate } = req.query;

  if (!partnerId || !startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Missing required query parameters", status: "error" });
  }

  try {
    const statements = await StatementManage.find({
      partnerId,
      startDate: { $gte: new Date(startDate) },
      endDate: { $lte: new Date(endDate) },
    }).populate({
      path: "accountId",
      select: "accountCode accountHolderName",
    });

    // Reshape the populated data
    const reshapedStatements = statements.map((statement) => {
      return {
        ...statement.toObject(),
        accountId: statement.accountId._id,
        accountHolderName: statement.accountId.accountHolderName,
        accountCode: statement.accountId.accountCode,
      };
    });

    if (!reshapedStatements.length) {
      return res.status(404).json({
        message: "No statements found for the given criteria",
        status: "error",
      });
    }

    res.status(200).json({
      message: "Statements retrieved successfully",
      data: reshapedStatements,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving statements",
      error: error.message,
      status: "error",
    });
  }
};

// Update a statement by ID
export const updateStatement = async (req, res) => {
  const { partnerBalance, payOutAmount, startDate, endDate, partnerId } =
    req.body;

  if (
    !partnerBalance ||
    !payOutAmount ||
    !startDate ||
    !endDate ||
    !partnerId
  ) {
    return res
      .status(400)
      .json({ message: "All fields are required", status: "error" });
  }

  try {
    const updatedStatement = await StatementManage.findByIdAndUpdate(
      req.params.id,
      {
        partnerBalance,
        payOutAmount,
        startDate,
        endDate,
        partnerId,
      },
      { new: true }
    );

    if (!updatedStatement) {
      return res
        .status(404)
        .json({ message: "Statement not found", status: "error" });
    }
    res.status(200).json({
      message: "Statement updated successfully",
      data: updatedStatement,
      status: "success",
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating statement", error, status: "error" });
  }
};

// Delete a statement by ID
export const deleteStatement = async (req, res) => {
  try {
    const deletedStatement = await StatementManage.findByIdAndDelete(
      req.params.id
    );
    if (!deletedStatement) {
      return res
        .status(404)
        .json({ message: "Statement not found", status: "error" });
    }
    res.status(200).json({
      message: "Statement deleted successfully",
      data: deletedStatement,
      status: "success",
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting statement", error, status: "error" });
  }
};
