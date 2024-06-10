// // controllers/motorPolicyController.js
// import MotorPolicyModel from "../../models/motorPolicy.js";
// import { v4 as uuidv4 } from "uuid";

// const createMotorPolicy = async (req, res) => {
//   console.log("REQUEST BODY", req.body);
//   console.log("REQUEST FILE", req.files);
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

//     const rcFront = req.files?.rcFront ? req.files.rcFront[0].path : null;
//     const rcBack = req.files?.rcBack ? req.files.rcBack[0].path : null;
//     const previousPolicy = req.files?.previousPolicy
//       ? req.files.previousPolicy[0].path
//       : null;
//     const survey = req.files?.survey ? req.files.survey[0].path : null;
//     const puc = req.files?.puc ? req.files.puc[0].path : null;
//     const fitness = req.files?.fitness ? req.files.fitness[0].path : null;
//     const propsal = req.files?.propsal ? req.files.propsal[0].path : null;
//     const currentPolicy = req.files?.currentPolicy
//       ? req.files.currentPolicy[0].path
//       : null;
//     const other = req.files?.other ? req.files.other[0].path : null;

//     const newMotorPolicy = new MotorPolicyModel({
//       uuid: uuidv4(),
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
//       rcFront,
//       rcBack,
//       previousPolicy,
//       survey,
//       puc,
//       fitness,
//       propsal,
//       currentPolicy,
//       other,
//     });

//     await newMotorPolicy.save();

//     res.status(201).json({
//       status: "success",
//       data: newMotorPolicy,
//       message: "Motor policy created successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       status: "failed",
//       message: "Unable to create motor policy",
//       error: error.message,
//     });
//   }
// };

// const getMotorPolicies = async (req, res) => {
//   try {
//     const { page = 1, limit = 10 } = req.query;

//     const pageNumber = parseInt(page, 10);
//     const limitNumber = parseInt(limit, 10);

//     const policies = await MotorPolicyModel.find()
//       .sort({ createdOn: -1 }) // Sort by createdOn field in descending order
//       .skip((pageNumber - 1) * limitNumber)
//       .limit(limitNumber);

//     const totalPolicies = await MotorPolicyModel.countDocuments();

//     res.status(200).json({
//       status: "success",
//       data: {
//         policies,
//         currentPage: pageNumber,
//         totalPages: Math.ceil(totalPolicies / limitNumber),
//         totalPolicies,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       status: "failed",
//       message: "Unable to retrieve motor policies",
//       error: error.message,
//     });
//   }
// };

// const deleteMotorPolicyById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedPolicy = await MotorPolicyModel.findByIdAndDelete(id);

//     if (!deletedPolicy) {
//       return res.status(404).json({
//         status: "failed",
//         message: "Motor policy not found",
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       message: "Motor policy deleted successfully",
//       deletedPolicy,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       status: "failed",
//       message: "Unable to delete motor policy",
//       error: error.message,
//     });
//   }
// };

// const getMotorPolicyById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const policy = await MotorPolicyModel.findById(id);

//     if (!policy) {
//       return res.status(404).json({
//         status: "failed",
//         message: "Motor policy not found",
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       data: policy,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       status: "failed",
//       message: "Unable to retrieve motor policy",
//       error: error.message,
//     });
//   }
// };

// const updateMotorPolicyById = async (req, res) => {
//   console.log("REQUEST BODY", req.body);
//   console.log("REQUEST FILE", req.files);
//   try {
//     const { id } = req.params;
//     const { updatedBy } = req.body; // Extract updatedBy from req.body
//     const updateData = req.body; // Assign the entire req.body to updateData
//     // const files = req.files; // Get the files from req.files

//     // If files are uploaded, add their paths to the updateData object
//     // if (files) {
//     //   for (const key in files) {
//     //     if (files.hasOwnProperty(key)) {
//     //       updateData[key] = files[key][0].path;
//     //     }
//     //   }
//     // }

//     // Add updatedBy and updatedOn to the updateData object
//     updateData.updatedBy = updatedBy;
//     updateData.updatedOn = new Date();

//     // Update the motor policy
//     const updatedPolicy = await MotorPolicyModel.findByIdAndUpdate(
//       id,
//       { $set: updateData }, // Use $set to update specific fields
//       { new: true }
//     );

//     if (!updatedPolicy) {
//       return res.status(404).json({
//         status: "failed",
//         message: "Motor policy not found",
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       data: updatedPolicy,
//       message: "Motor policy updated successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       status: "failed",
//       message: "Unable to update motor policy",
//       error: error.message,
//     });
//   }
// };

// export {
//   createMotorPolicy,
//   getMotorPolicies,
//   deleteMotorPolicyById,
//   getMotorPolicyById,
//   updateMotorPolicyById
// };

// controllers/formController.js
// import DynamicFormModel from '../models/dynamicFormModel.js';
import MotorPolicyModel from "../../models/motorPolicy.js";

export const createMotorPolicy = async (req, res) => {
    console.log("REQUEST BODY", req.body);
    console.log("REQUEST FILES", req.files)
    const {  formData } = req.body;
    const files = {};

    if (req.files) {
        req.files.forEach((file) => {
            // Extracting key from fieldname, which is expected to be like "key_filename"
            const [key] = file.fieldname.split('_');
            if (!files[key]) {
                files[key] = [];
            }
            files[key].push(file.path);
        });
    }

    const newForm = new MotorPolicyModel({  formData, files });

    try {
        const savedForm = await newForm.save();
        res.status(201).json(savedForm);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMotorPolicies = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
  const limit = parseInt(req.query.limit) || 20; // Default limit to 20 entries per page
  const skip = (page - 1) * limit; // Calculate skip value for pagination

  try {
      // Fetch motor policies with pagination and sorting
      const forms = await MotorPolicyModel.find()
          .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
          .skip(skip)
          .limit(limit);

      // Count total number of documents
      const totalCount = await MotorPolicyModel.countDocuments();

      res.status(200).json({
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          data: forms
      });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};


