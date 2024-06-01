import MotorPolicyModel from "../models/motorpolicy.js";
import upload from "../middlewares/multerMiddleware.js";

const createMotorPolicy = (req, res) => {
  upload.fields([
    { name: 'rcFront', maxCount: 1 },
    { name: 'currentPolicy', maxCount: 1 },
    { name: 'rcBack', maxCount: 1 },
    { name: 'previousPolicy', maxCount: 1 },
    { name: 'survey', maxCount: 1 },
    { name: 'puc', maxCount: 1 },
    { name: 'fitness', maxCount: 1 },
    { name: 'propsal', maxCount: 1 },
    { name: 'other', maxCount: 1 },
  ])(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

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

    const newPolicyData = {
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
      rcFront: req.files.rcFront ? req.files.rcFront[0].path : "",
      currentPolicy: req.files.currentPolicy ? req.files.currentPolicy[0].path : "",
      rcBack: req.files.rcBack ? req.files.rcBack[0].path : "",
      previousPolicy: req.files.previousPolicy ? req.files.previousPolicy[0].path : "",
      survey: req.files.survey ? req.files.survey[0].path : "",
      puc: req.files.puc ? req.files.puc[0].path : "",
      fitness: req.files.fitness ? req.files.fitness[0].path : "",
      propsal: req.files.propsal ? req.files.propsal[0].path : "",
      other: req.files.other ? req.files.other[0].path : ""
    };

    try {
      const newPolicy = new MotorPolicyModel(newPolicyData);
      await newPolicy.save();
      res.status(201).json({ message: "Motor policy created successfully", data: newPolicy });
    } catch (error) {
      console.error("Error creating motor policy:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
};

export { createMotorPolicy };
