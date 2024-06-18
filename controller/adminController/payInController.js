import ExcelDataModel from "../../models/excelDataSchema.js";

const calculateODandTP = async (req, res) => {
  console.log('Received query parameters:', req.query);
  try {
    const {
      rto,
      policyType,
      caseType,
      productType,
      subCategory,
      companyName,
      insuredType,
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
      !subCategory ||
      !companyName ||
      !insuredType ||
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
      subCategory,
      engine,
      ncb,
      policyType,
      rto,
      insuredType,
      caseType,
      companyName,
      make,
      model,
      vehicleAge,
    };

    console.log('Database query object:', dbQuery);

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
    console.log('Extracted fields - od:', od, ', tp:', tp);

    const filteredRecord = { od, tp };

    res.status(200).json({
      message: "Record found",
      data: filteredRecord,
      status: "Success",
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Error fetching data", error: error.message });
  }
};

export { calculateODandTP };
