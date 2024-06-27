import PayOutExcelDataModel from "../../models/adminModels/payOutExcelDataSchema.js";

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
      weight,
      ncb,
      vehicleAge,
    } = req.query;

    // Collect missing parameters
    const missingFields = [];
    if (!rto) missingFields.push("rto");
    if (!policyType) missingFields.push("policyType");
    if (!caseType) missingFields.push("caseType");
    if (!productType) missingFields.push("productType");
    if (!companyName) missingFields.push("companyName");
    if (!make) missingFields.push("make");
    if (!model) missingFields.push("model");
    if (!fuelType) missingFields.push("fuelType");
    if (!engine) missingFields.push("engine");
    if (!weight) missingFields.push("weight");
    if (!ncb) missingFields.push("ncb");
    if (!vehicleAge) missingFields.push("vehicleAge");

    // If there are missing fields, return a 400 response
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required query parameters",
        missingFields,
        status: "Failed",
      });
    }

    // Convert all fields to lowercase
    const dbQuery = {
      fuelType: fuelType.toLowerCase(),
      productType: productType.toLowerCase(),
      engine: engine,
      weight: weight,
      ncb: ncb.toLowerCase(),
      policyType: policyType.toLowerCase(),
      rto: rto.toLowerCase(),
      caseType: caseType.toLowerCase(),
      companyName: companyName.toLowerCase(),
      make: make.toLowerCase(),
      model: model.toLowerCase(),
      vehicleAge: vehicleAge.toLowerCase(),
    };

    // Remove undefined or null fields from the query
    Object.keys(dbQuery).forEach((key) =>
      dbQuery[key] === undefined || dbQuery[key] === null ? delete dbQuery[key] : {}
    );

    const matchedRecord = await PayOutExcelDataModel.findOne(dbQuery).select("od tp");

    const filteredNotMatchRecord = { od: 0, tp: 0 };

    if (!matchedRecord) {
      return res.status(200).json({
        message: "No matching record found in the database",
        data: filteredNotMatchRecord,
        status: "Success",
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
    res.status(500).json({
      message: "Error fetching data",
      error: error.message,
    });
  }
};

export { calculateODandTP };
