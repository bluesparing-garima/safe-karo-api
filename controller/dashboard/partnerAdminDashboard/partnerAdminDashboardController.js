import MotorPolicyModel from "../../../models/policyModel/motorpolicySchema.js"
import MotorPolicyPaymentModel from "../../../models/policyModel/motorPolicyPaymentSchema.js"

export const getAllPartnersWithPayOutCommissionAndDateFilter = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
  
      if (!startDate || !endDate) {
        return res.status(400).json({
          message: "Please provide both startDate and endDate.",
          success: false,
          status: "error",
        });
      }
  
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
  
      const partners = await MotorPolicyModel.aggregate([
        { $match: { issueDate: { $gte: start, $lte: end }, isActive: true } },
        { $group: { _id: "$partnerId", partnerName: { $first: "$partnerName" } } }
      ]);
  
      if (partners.length === 0) {
        return res.status(200).json({
          message: `No partners found between ${startDate} and ${endDate}.`,
          data: [],
          success: true,
          status: "success",
        });
      }
  
      const partnerSummaries = [];
  
      for (const partner of partners) {
        const policies = await MotorPolicyModel.find({
          partnerId: partner._id,
          isActive: true,
          issueDate: { $gte: start, $lte: end },
        }).select('policyNumber').lean();
  
        const policyNumbers = policies.map(policy => policy.policyNumber);
  
        const totalCommission = await MotorPolicyPaymentModel.aggregate([
          { $match: { policyNumber: { $in: policyNumbers } } },
          { $group: { _id: null, totalCommission: { $sum: "$payOutCommission" } } }
        ]);
  
        partnerSummaries.push({
          partnerId: partner._id,
          partnerName: partner.partnerName,
          totalPayOutCommission: totalCommission.length > 0 ? totalCommission[0].totalCommission : 0
        });
      }
  
      res.status(200).json({
        message: `Partner payout commissions between ${startDate} and ${endDate}.`,
        data: partnerSummaries,
        success: true,
        status: "success",
      });
  
    } catch (error) {
      res.status(500).json({
        status: "error",
        success: false,
        message: error.message,
      });
    }
  };
  
  export const getAllPartnersWithPayOutCommission = async (req, res) => {
    try {
      const partners = await MotorPolicyModel.aggregate([
        { $group: { _id: "$partnerId", partnerName: { $first: "$partnerName" } } }
      ]);
  
      if (partners.length === 0) {
        return res.status(200).json({
          message: `No partners found.`,
          data: [],
          success: true,
          status: "success",
        });
      }
  
      const partnerSummaries = [];
  
      for (const partner of partners) {
        const policies = await MotorPolicyModel.find({
          partnerId: partner._id,
          isActive: true,
        }).select('policyNumber').lean();
  
        const policyNumbers = policies.map(policy => policy.policyNumber);
  
        const totalCommission = await MotorPolicyPaymentModel.aggregate([
          { $match: { policyNumber: { $in: policyNumbers } } },
          { $group: { _id: null, totalCommission: { $sum: "$payOutCommission" } } }
        ]);
  
        partnerSummaries.push({
          partnerId: partner._id,
          partnerName: partner.partnerName,
          totalPayOutCommission: totalCommission.length > 0 ? totalCommission[0].totalCommission : 0
        });
      }
      res.status(200).json({
        message: "Partners with payout commissions fetched successfully.",
        data: partnerSummaries,
        success: true,
        status: "success",
      });
  
    } catch (error) {
      res.status(500).json({
        status: "error",
        success: false,
        message: error.message,
      });
    }
  };
