import debits from "../../models/accountsModels/debitsSchema.js";

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
