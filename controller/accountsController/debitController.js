import debits from "../../models/accountsModels/debitsSchema.js";

export const getAllDebits = async (req, res) => {
  try {
    const allDebitRecords = await debits.find({});

    if (!allDebitRecords || allDebitRecords.length === 0) {
      return res.status(404).json({
        message: "No debit records found",
        success: false,
        status: "error",
      });
    }

    res.status(200).json({
      message: "All debit records retrieved successfully",
      data: allDebitRecords,
      success: true,
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      message: "An error occurred while retrieving all debit records",
      error: err.message,
      success: false,
      status: "error",
    });
  }
};

export const getDebitsByPartnerId = async (req, res) => {
  const { partnerId } = req.params;

  try {
    const debitRecords = await debits.find({ partnerId });

    if (!debitRecords || debitRecords.length === 0) {
      return res.status(404).json({
        message: "No debit records found for the given partnerId",
        success: false,
        status: "error",
      });
    }

    res.status(200).json({
      message: "Debit records retrieved successfully",
      data: debitRecords,
      success: true,
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      message: "An error occurred while retrieving debit records",
      error: err.message,
      success: false,
      status: "error",
    });
  }
};

export const getDebitsByPartnerIdAndDateRange = async (req, res) => {
  const { partnerId } = req.params;
  const { startDate, endDate } = req.query;

  if (!partnerId || !startDate || !endDate) {
    return res.status(400).json({
      message: "Missing required parameters",
      success: false,
      status: "error",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  try {
    const debitRecords = await debits.find({
      partnerId,
      policyDate: { $gte: start, $lte: end },
    });

    if (!debitRecords || debitRecords.length === 0) {
      return res.status(404).json({
        message: "No debit records found for the given partnerId and date range",
        success: false,
        status: "error",
      });
    }

    res.status(200).json({
      message: "Debit records retrieved successfully",
      data: debitRecords,
      success: true,
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      message: "An error occurred while retrieving debit records",
      error: err.message,
      success: false,
      status: "error",
    });
  }
};