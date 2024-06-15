import ExcelDataModel from "../../models/excelDataSchema.js";

const calculateODandTP = async (req, res) => {
  try {
    const {
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
    } = req.query;

    if (
      !subCategory ||
      !engine ||
      !ncb ||
      !rto ||
      !insuredType || !caseType ||
      !make ||
      !model ||
      !companyName ||
      !fuelType ||
      !productType ||
      !vehicleAge ||
      !policyType
    ) {
      return res
        .status(400)
        .json({
          message: "Missing required query parameters",
          status: "Failed",
        });
    }

    // Build the query object based on provided parameters
    const dbQuery = {
      fuelType: fuelType,
      productType: productType,
      subCategory: subCategory,
      engine: engine,
      ncb: ncb,
      policyType: policyType,
      rto: rto,
      insuredType: insuredType,
      caseType: caseType,
      companyName: companyName,
      make: make,
      model: model,
      vechileAge: vehicleAge,
    };

    // Remove undefined/null fields from dbQuery
    Object.keys(dbQuery).forEach((key) =>
      dbQuery[key] === undefined || dbQuery[key] === null
        ? delete dbQuery[key]
        : {}
    );

    // Fetch the relevant record from the database
    const matchedRecord = await ExcelDataModel.findOne(dbQuery).select("*");

    if (!matchedRecord) {
      return res
        .status(404)
        .json({
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
    console.error("Error fetching data:", error);
    res
      .status(500)
      .json({ message: "Error fetching data", error: error.message });
  }
};

export { calculateODandTP };
