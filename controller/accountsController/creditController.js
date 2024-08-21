import credits from "../../models/accountsModels/creditSchema.js";

export const getAllCredits = async (req, res) => {
  try {
    const allCreditRecords = await credits.find({});

    if (!allCreditRecords || allCreditRecords.length === 0) {
      return res.status(404).json({
        message: "No credit records found",
        success: false,
        status: "error",
      });
    }

    res.status(200).json({
      message: "All credit records retrieved successfully",
      data: allCreditRecords,
      success: true,
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      message: "An error occurred while retrieving all credit records",
      error: err.message,
      success: false,
      status: "error",
    });
  }
};

export const getCreditsByBrokerId = async (req, res) => {
  const { brokerId } = req.params;

  try {
    const creditRecords = await credits.find({ brokerId });

    if (!creditRecords || creditRecords.length === 0) {
      return res.status(404).json({
        message: "No credit records found for the given brokerId",
        success: false,
        status: "error",
      });
    }

    res.status(200).json({
      message: "Credit records retrieved successfully",
      data: creditRecords,
      success: true,
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      message: "An error occurred while retrieving credit records",
      error: err.message,
      success: false,
      status: "error",
    });
  }
};

export const getCreditsByBrokerIdAndDateRange = async (req, res) => {
  const { brokerId } = req.params;
  const { startDate, endDate } = req.query;

  if (!brokerId || !startDate || !endDate) {
    return res.status(400).json({
      message: "Missing required parameters",
      success: false,
      status: "error",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  try {
    const creditRecords = await credits.find({
      brokerId,
      policyDate: { $gte: start, $lte: end },
    });

    if (!creditRecords || creditRecords.length === 0) {
      return res.status(404).json({
        message: "No credit records found for the given brokerId and date range",
        success: false,
        status: "error",
      });
    }

    res.status(200).json({
      message: "Credit records retrieved successfully",
      data: creditRecords,
      success: true,
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      message: "An error occurred while retrieving credit records",
      error: err.message,
      success: false,
      status: "error",
    });
  }
};

// get Credit data by TransactionCode and brokerId
export const getDCreditDetailsByTransactionCodeAndBrokerId = async (req, res) => {
  const { transactionCode, brokerId } = req.query;

  if (!transactionCode || !brokerId) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Transaction code and partner ID are required.",
    });
  }

  try {
    const creditDetails = await credits.findOne({
      transactionCode,
      brokerId,
    });

    if (!creditDetails) {
      return res.status(404).json({
        status: "error",
        success: false,
        message: "No credit details found for the provided transaction code and partner ID.",
      });
    }

    res.status(200).json({
      status: "success",
      success: true,
      message: "Credit details retrieved successfully.",
      data: creditDetails,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      success: false,
      message: "Error retrieving credit details.",
      error: error.message,
    });
  }
};