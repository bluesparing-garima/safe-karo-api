import MotorPolicyPaymentModel from "../../models/policyModel/motorPolicyPaymentSchema.js";
import PayInExcelDataModel from "../../models/adminModels/payInExcelDataSchema.js";
import PayOutExcelDataModel from "../../models/adminModels/payOutExcelDataSchema.js";
import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";

// create a Entry in PayInExcelModel if payIn OD and TP same for PayOut
// export const createPercentageData = async (req, res) => {
//   try {
//     const {
//       policyType,
//       caseType,
//       productType,
//       subCategory,
//       companyName,
//       broker,
//       make,
//       model,
//       fuelType,
//       ncb,
//       vehicleAge,
//       seatingCapacity,
//       rto,
//       cc,
//       payInODPercentage,
//       payInTPPercentage,
//       payOutODPercentage,
//       payOutTPPercentage,
//       startDate,
//       endDate,
//     } = req.body;

//     if (
//       !policyType ||
//       !caseType ||
//       !productType ||
//       !subCategory ||
//       !companyName ||
//       !broker ||
//       !make ||
//       !model ||
//       !fuelType ||
//       !ncb ||
//       !vehicleAge ||
//       !seatingCapacity ||
//       !rto ||
//       !cc ||
//       !startDate ||
//       !endDate
//     ) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // Parse dates
//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     const query = {
//       policyType: policyType.toLowerCase(),
//       caseType: caseType.toLowerCase(),
//       productType: productType.toLowerCase(),
//       subCategory: subCategory.toLowerCase(),
//       companyName: companyName.toLowerCase(),
//       broker: broker.toLowerCase(),
//       make: make.toLowerCase(),
//       model: model.toLowerCase(),
//       fuelType: fuelType.toLowerCase(),
//       ncb: ncb.toLowerCase(),
//       vehicleAge: vehicleAge.toLowerCase(),
//       seatingCapacity: seatingCapacity,
//       rto: rto.toLowerCase(),
//       cc: cc,
//       startDate: start,
//       endDate: end,
//     };

//     const createRecord = async (Model, data) => {
//       try {
//         const newRecord = await Model.create({
//           ...query,
//           od: data.od,
//           tp: data.tp,
//           createdBy: "admin",
//           createdOn: new Date(),
//           updatedBy: null,
//           updatedOn: null,
//         });
//       } catch (err) {
//         console.error(
//           `Error creating record in ${Model.collection.name}:`,
//           err
//         );
//       }
//     };

//     // Check and log if payInODPercentage and payInTPPercentage are defined
//     if (payInODPercentage !== undefined && payInTPPercentage !== undefined) {
//       await createRecord(PayInExcelDataModel, {
//         od: payInODPercentage,
//         tp: payInTPPercentage,
//       });
//     }

//     if (payOutODPercentage !== undefined && payOutTPPercentage !== undefined) {
//       await createRecord(PayOutExcelDataModel, {
//         od: payOutODPercentage,
//         tp: payOutTPPercentage,
//       });
//     }

//     res.status(200).json({
//       message: "Data added successfully to the relevant models",
//       status: "Success",
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error processing request", error: error.message });
//   }
// };

export const createPercentageData = async (req, res) => {
  try {
    const {
      policyType,
      caseType,
      productType,
      subCategory,
      companyName,
      broker,
      make,
      model,
      fuelType,
      ncb,
      vehicleAge,
      seatingCapacity,
      rto,
      cc,
      payInODPercentage,
      payInTPPercentage,
      payOutODPercentage,
      payOutTPPercentage,
      startDate,
      endDate,
    } = req.body;

    if (
      !policyType ||
      !caseType ||
      !productType ||
      !subCategory ||
      !companyName ||
      !broker ||
      !make ||
      !model ||
      !fuelType ||
      !ncb ||
      !vehicleAge ||
      !seatingCapacity ||
      !rto ||
      !cc ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    const query = {
      policyType: policyType.toLowerCase(),
      caseType: caseType.toLowerCase(),
      productType: productType.toLowerCase(),
      subCategory: subCategory.toLowerCase(),
      companyName: companyName.toLowerCase(),
      broker: broker.toLowerCase(),
      make: make.toLowerCase(),
      model: model.toLowerCase(),
      fuelType: fuelType.toLowerCase(),
      ncb: ncb.toLowerCase(),
      vehicleAge: vehicleAge.toLowerCase(),
      seatingCapacity: seatingCapacity,
      rto: rto.toLowerCase(),
      cc: cc,
      startDate: start,
      endDate: end,
    };

    // Function to create records in models
    const createRecord = async (Model, data) => {
      try {
        console.log(`Attempting to create record in ${Model.collection.name} with data:`, data);
        const newRecord = await Model.create({
          ...query,
          od: data.od,
          tp: data.tp,
          createdBy: "admin",
          createdOn: new Date(),
          updatedBy: null,
          updatedOn: null,
        });
        console.log(`Successfully created record in ${Model.collection.name}:`, newRecord);
      } catch (err) {
        console.error(`Error creating record in ${Model.collection.name}:`, err);
      }
    };

    // Check and log if payInODPercentage and payInTPPercentage are defined
    if (payInODPercentage !== undefined && payInTPPercentage !== undefined) {
      await createRecord(PayInExcelDataModel, {
        od: payInODPercentage,
        tp: payInTPPercentage,
      });
    }

    if (payOutODPercentage !== undefined && payOutTPPercentage !== undefined) {
      await createRecord(PayOutExcelDataModel, {
        od: payOutODPercentage,
        tp: payOutTPPercentage,
      });
    }

    // Find matching policies
    const policies = await MotorPolicyModel.find(query).select("policyNumber");

    if (policies.length === 0) {
      return res.status(404).json({ message: "No matching policies found" });
    }

    const policyNumbers = policies.map(policy => policy.policyNumber);

    // Update records in MotorPolicyPaymentModel
    await Promise.all(policyNumbers.map(async policyNumber => {
      try {
        await MotorPolicyPaymentModel.updateOne(
          { policyNumber: policyNumber },
          {
            $set: {
              payInOd: payInODPercentage,
              payInTp: payInTPPercentage,
              payOutOd: payOutODPercentage,
              payOutTp: payOutTPPercentage,
            }
          }
        );
        console.log(`Successfully updated policyNumber ${policyNumber}`);
      } catch (err) {
        console.error(`Error updating policyNumber ${policyNumber}:`, err);
      }
    }));

    res.status(200).json({
      message: "Data added and updated successfully",
      status: "Success",
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Error processing request", error: error.message });
  }
};

