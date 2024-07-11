import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import MotorPolicyPaymentModel from "../../models/policyModel/motorPolicyPaymentSchema.js";

// Get Policies by Date Range
export const getPoliciesByDateRange = async (req, res) => {
    const { startDate, endDate } = req.query;
  
    if (!startDate || !endDate) {
      return res.status(400).json({
        status: "error",
        success: false,
        message: "Start date and end date are required.",
      });
    }
  
    try {
      const policies = await MotorPolicyModel.find({
        createdOn: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      });
  
      if (policies.length === 0) {
        return res.status(404).json({
          message: "No policies found within the specified date range.",
          success: false,
          status: "error",
        });
      }
  
      const policyIds = policies.map(policy => policy._id);
      const payments = await MotorPolicyPaymentModel.find({
        policyId: { $in: policyIds },
      });
  
      const policyData = policies.map(policy => {
        const payment = payments.find(payment => payment.policyId.toString() === policy._id.toString());
        return {
          policy,
          payment,
        };
      });
  
      res.status(200).json({
        message: "Policies retrieved successfully.",
        data: policyData,
        success: true,
        status: "success",
      });
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving policies.",
        success: false,
        error: error.message,
      });
    }
  };
