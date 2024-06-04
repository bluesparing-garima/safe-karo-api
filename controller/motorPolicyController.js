import MotorPolicyModel from '../models/motorPolicy.js';

const createMotorPolicy = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files);

    const {
      policyCategory, policyType, caseType, product, insuranceCompany, broker, make, model,
      fuelType, RTO, seatCapacity, cc, registerDate, ncb, vehicleNumber, policyNumber,
      fullName, emailId, phoneNumber, mfgYear, tenure, issueDate, endDate, idv, od, tp,
      netPremium, finalPremium, paymentMode, madeBy
    } = req.body;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        status: 'failed',
        message: 'No files were uploaded.'
      });
    }

    const newMotorPolicy = new MotorPolicyModel({
      policyCategory, policyType, caseType, product, insuranceCompany, broker, make, model,
      fuelType, RTO, seatCapacity, cc, registerDate, ncb, vehicleNumber, policyNumber,
      fullName, emailId, phoneNumber, mfgYear, tenure, issueDate, endDate, idv, od, tp,
      netPremium, finalPremium, paymentMode, madeBy,
      // rcFront: req.files['rcFront'][0].path,
      // rcBack: req.files['rcBack'][0].path,
      // previousPolicy: req.files['previousPolicy'][0].path,
      // survey: req.files['survey'][0].path,
      // puc: req.files['puc'][0].path,
      // fitness: req.files['fitness'][0].path,
      // proposal: req.files['proposal'][0].path,
      // currentPolicy: req.files['currentPolicy'][0].path,
      // other: req.files['other'][0].path
    });

    await newMotorPolicy.save();

    res.status(201).json({
      status: 'success',
      data: newMotorPolicy,
      message: 'Motor policy created successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'failed',
      message: 'Unable to create motor policy',
      error: error.message
    });
  }
};

export { createMotorPolicy };


// // controllers/motorPolicyController.js
// import MotorPolicyModel from "../models/motorPolicyModel.js";

// // Create a new motor policy
// const createMotorPolicy = async (req, res) => {
//   try {
//     const {
//       policyCategory,
//       policyType,
//       caseType,
//       product,
//       insuranceCompany,
//       broker,
//       make,
//       model,
//       fuelType,
//       RTO,
//       seatCapacity,
//       cc,
//       registerDate,
//       ncb,
//       vehicleNumber,
//       policyNumber,
//       fullName,
//       emailId,
//       phoneNumber,
//       mfgYear,
//       tenure,
//       issueDate,
//       endDate,
//       idv,
//       od,
//       tp,
//       netPremium,
//       finalPremium,
//       paymentMode,
//       madeBy,
//     } = req.body;

//     const imagePaths = {
//       rcFront: req.files["rcFront"][0].path,
//       rcBack: req.files["rcBack"][0].path,
//       previousPolicy: req.files["previousPolicy"][0].path,
//       survey: req.files["survey"][0].path,
//       puc: req.files["puc"][0].path,
//       fitness: req.files["fitness"][0].path,
//       proposal: req.files["proposal"][0].path,
//       currentPolicy: req.files["currentPolicy"][0].path,
//       other: req.files["other"][0].path,
//     };

//     const newMotorPolicy = new MotorPolicyModel({
//       policyCategory,
//       policyType,
//       caseType,
//       product,
//       insuranceCompany,
//       broker,
//       make,
//       model,
//       fuelType,
//       RTO,
//       seatCapacity,
//       cc,
//       registerDate,
//       ncb,
//       vehicleNumber,
//       policyNumber,
//       fullName,
//       emailId,
//       phoneNumber,
//       mfgYear,
//       tenure,
//       issueDate,
//       endDate,
//       idv,
//       od,
//       tp,
//       netPremium,
//       finalPremium,
//       paymentMode,
//       madeBy,
//       ...imagePaths,
//     });

//     await newMotorPolicy.save();
//     res.status(200).json({
//       status: "success",
//       data: newMotorPolicy,
//       message: "New motor policy created successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       status: "failed",
//       message: "Unable to create new motor policy",
//     });
//   }
// };

// // Get all motor policies
// const getAllMotorPolicies = async (req, res) => {
//   try {
//     const motorPolicies = await MotorPolicyModel.find();
//     res.status(200).json({
//       status: "success",
//       data: motorPolicies,
//       message: "Success! Here are all motor policies",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       status: "failed",
//       message: "Unable to retrieve motor policies",
//     });
//   }
// };

// // Get motor policy by ID
// const getMotorPolicyById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const motorPolicy = await MotorPolicyModel.findById(id);
//     if (!motorPolicy) {
//       return res
//         .status(404)
//         .json({ status: "failed", message: "Motor policy not found" });
//     }
//     res.status(200).json({ status: "success", data: motorPolicy });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ status: "failed", message: "Unable to retrieve motor policy" });
//   }
// };

// // Update motor policy by ID
// const updateMotorPolicyById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;
//     const imagePaths = {};

//     if (req.files) {
//       for (const key in req.files) {
//         if (req.files.hasOwnProperty(key)) {
//           imagePaths[key] = req.files[key][0].path;
//         }
//       }
//     }

//     const updatedMotorPolicy = await MotorPolicyModel.findByIdAndUpdate(
//       id,
//       { $set: { ...updateData, ...imagePaths, updatedAt: new Date() } },
//       { new: true }
//     );

//     if (!updatedMotorPolicy) {
//       return res
//         .status(404)
//         .json({ status: "failed", message: "Motor policy not found" });
//     }

//     res.status(200).json({
//       status: "success",
//       data: updatedMotorPolicy,
//       message: "Motor policy updated successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ status: "failed", message: "Unable to update motor policy" });
//   }
// };

// // Delete motor policy by ID
// const deleteMotorPolicyById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedMotorPolicy = await MotorPolicyModel.findByIdAndDelete(id);

//     if (!deletedMotorPolicy) {
//       return res
//         .status(404)
//         .json({ status: "failed", message: "Motor policy not found" });
//     }

//     res.status(200).json({
//       status: "success",
//       message: "Motor policy deleted successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ status: "failed", message: "Unable to delete motor policy" });
//   }
// };

// export {
//   createMotorPolicy,
//   getAllMotorPolicies,
//   getMotorPolicyById,
//   updateMotorPolicyById,
//   deleteMotorPolicyById,
// };
