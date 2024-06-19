import ExcelDataModel from "../../models/excelDataSchema.js";

const calculateODandTP = async (req, res) => {
  try {
    const {
      rto,
      policyType,
      caseType,
      productType,
      companyName,
      make,
      model,
      fuelType,
      engine,
      ncb,
      vehicleAge,
    } = req.query;

    if (
      !rto ||
      !policyType ||
      !caseType ||
      !productType ||
      !companyName ||
      !make ||
      !model ||
      !fuelType ||
      !engine ||
      !ncb ||
      !vehicleAge
    ) {
      return res
        .status(400)
        .json({
          message: "Missing required query parameters",
          status: "Failed",
        });
    }

    const dbQuery = {
      fuelType,
      productType,
      engine,
      ncb,
      policyType,
      rto,
      caseType,
      companyName,
      make,
      model,
      vehicleAge,
    };

    Object.keys(dbQuery).forEach((key) =>
      dbQuery[key] === undefined || dbQuery[key] === null ? delete dbQuery[key] : {}
    );

    const matchedRecord = await ExcelDataModel.findOne(dbQuery).select("od tp");

    if (!matchedRecord) {
      return res.status(404).json({
        message: "No matching record found in the database",
        status: "Failed",
      });
    }

    const { od, tp } = matchedRecord.toObject();

    const filteredRecord = { od, tp };

    res.status(200).json({
      message: "Record found",
      data: filteredRecord,
      status: "Success",
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error: error.message });
  }
};

export { calculateODandTP };
