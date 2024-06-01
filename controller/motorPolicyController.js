import MotorPolicyModel from "../models/motorpolicy.js";

const createMotorPolicy = async (req, res) => {
  console.log("RECEIVED REQ", req);
  try {
    const {
      policyCategory,
      policyType,
      caseType,
      product,
      insureanceComapny,
      broker,
      make,
      model,
      fuelType,
      RTO,
      seatCapacity,
      cc,
      registerDate,
      ncb,
      vechileNumber,
      policyNumber,
      fullName,
      emailId,
      phoneNumber,
      mfgYear,
      tenure,
      issueDate,
      endDate,
      idv,
      od,
      tp,
      netPremium,
      finalPremium,
      paymentMode,
      madeBy,
    } = req.body;

    // Extract file paths from req.files object
    const {
      rcFront,
      currentPolicy,
      rcBack,
      previousPolicy,
      survey,
      puc,
      fitness,
      propsal,
      other,
    } = req.files;

    // Create new motor policy instance
    const motorPolicy = new MotorPolicyModel({
      policyCategory,
      policyType,
      caseType,
      product,
      insureanceComapny,
      broker,
      make,
      model,
      fuelType,
      RTO,
      seatCapacity,
      cc,
      registerDate,
      ncb,
      vechileNumber,
      policyNumber,
      fullName,
      emailId,
      phoneNumber,
      mfgYear,
      tenure,
      issueDate,
      endDate,
      idv,
      od,
      tp,
      netPremium,
      finalPremium,
      paymentMode,
      madeBy,
      rcFront: rcFront ? rcFront[0].path : "", 
      currentPolicy: currentPolicy ? currentPolicy[0].path : "", 
      rcBack: rcBack ? rcBack[0].path : "", 
      previousPolicy: previousPolicy ? previousPolicy[0].path : "", 
      survey: survey ? survey[0].path : "",  
      puc: puc ? puc[0].path : "", 
      fitness: fitness ? fitness[0].path : "", 
      propsal: propsal ? propsal[0].path : "", 
      other: other ? other[0].path : "", 
    });

    await motorPolicy.save();
    res.status(201).json({ message: "Motor policy created successfully" });
  } catch (error) {
    console.error("Error creating motor policy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default createMotorPolicy;
