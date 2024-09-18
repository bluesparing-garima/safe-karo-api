import MotorPolicyModel from "../../../models/policyModel/motorpolicySchema.js"
import MotorPolicyPaymentModel from "../../../models/policyModel/motorPolicyPaymentSchema.js"

export const getAllBrokersWithPayInCommissionAndDateFilter = async (req, res) => {
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
  
      const brokers = await MotorPolicyModel.aggregate([
        { $match: { issueDate: { $gte: start, $lte: end }, isActive: true } },
        { $group: { _id: "$brokerId", brokerName: { $first: "$broker" } } }
      ]);
  
      if (brokers.length === 0) {
        return res.status(200).json({
          message: `No brokers found between ${startDate} and ${endDate}.`,
          data: [],
          success: true,
          status: "success",
        });
      }
  
      const brokerSummaries = [];
  
      for (const broker of brokers) {
        const policies = await MotorPolicyModel.find({
          brokerId: broker._id,
          isActive: true,
          issueDate: { $gte: start, $lte: end },
        }).select('policyNumber').lean();
  
        const policyNumbers = policies.map(policy => policy.policyNumber);
  
        const totalPayInCommission = await MotorPolicyPaymentModel.aggregate([
          { $match: { policyNumber: { $in: policyNumbers } } },
          { $group: { _id: null, totalPayInCommission: { $sum: "$payInCommission" } } }
        ]);
  
        brokerSummaries.push({
          brokerId: broker._id,
          brokerName: broker.brokerName,
          totalPayInCommission: totalPayInCommission.length > 0 ? totalPayInCommission[0].totalPayInCommission : 0
        });
      }
  
      res.status(200).json({
        message: `Brokers with pay-in commissions between ${startDate} and ${endDate} fetched successfully.`,
        data: brokerSummaries,
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
  
export const getAllBrokersWithPayInCommission = async (req, res) => {
    try {
      const brokers = await MotorPolicyModel.aggregate([
        { $group: { _id: "$brokerId", brokerName: { $first: "$broker" } } }
      ]);
  
      if (brokers.length === 0) {
        return res.status(200).json({
          message: "No brokers found.",
          data: [],
          success: true,
          status: "success",
        });
      }
  
      const brokerSummaries = [];
  
      for (const broker of brokers) {
        const policies = await MotorPolicyModel.find({
          brokerId: broker._id,
          isActive: true,
        }).select('policyNumber').lean();
  
        const policyNumbers = policies.map(policy => policy.policyNumber);
  
        const totalPayInCommission = await MotorPolicyPaymentModel.aggregate([
          { $match: { policyNumber: { $in: policyNumbers } } },
          { $group: { _id: null, totalPayInCommission: { $sum: "$payInCommission" } } }
        ]);
  
        brokerSummaries.push({
          brokerId: broker._id,
          brokerName: broker.brokerName,
          totalPayInCommission: totalPayInCommission.length > 0 ? totalPayInCommission[0].totalPayInCommission : 0
        });
      }
  
      res.status(200).json({
        message: "Brokers with total pay-in commissions fetched successfully.",
        data: brokerSummaries,
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
  
  // Get pay-out commission by company for a specific broker with a date filter
export const getPayOutCommissionByBrokerAndCompanyWithDateFilter = async (req, res) => {
    try {
      const { brokerId, startDate, endDate } = req.query;
  
      if (!brokerId || !startDate || !endDate) {
        return res.status(400).json({
          message: "Please provide brokerId, startDate, and endDate.",
          success: false,
          status: "error",
        });
      }
  
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
  
      const companies = await MotorPolicyModel.aggregate([
        { $match: { brokerId, issueDate: { $gte: start, $lte: end }, isActive: true } },
        { $group: { _id: "$companyName" } }
      ]);
  
      if (companies.length === 0) {
        return res.status(200).json({
          message: `No companies found for brokerId ${brokerId} between ${startDate} and ${endDate}.`,
          data: [],
          totalAmount: 0,
          success: true,
          status: "success",
        });
      }
  
      const companySummaries = [];
      let totalAmount = 0;
  
      for (const company of companies) {
        const policies = await MotorPolicyModel.find({
          brokerId,
          companyName: company._id,
          isActive: true,
          issueDate: { $gte: start, $lte: end },
        }).select('policyNumber').lean();
  
        const policyNumbers = policies.map(policy => policy.policyNumber);
  
        const totalPayOutCommission = await MotorPolicyPaymentModel.aggregate([
          { $match: { policyNumber: { $in: policyNumbers } } },
          { $group: { _id: null, totalPayOutCommission: { $sum: "$payOutCommission" } } }
        ]);
  
        const payOutCommission = totalPayOutCommission.length > 0 ? totalPayOutCommission[0].totalPayOutCommission : 0;
        totalAmount += payOutCommission;
  
        companySummaries.push({
          companyName: company._id,
          totalPayOutCommission: payOutCommission,
        });
      }
  
      res.status(200).json({
        message: `Pay-out commissions for brokerId ${brokerId} by company between ${startDate} and ${endDate} fetched successfully.`,
        data: companySummaries,
        totalAmount,
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
  
// Get pay-out commission by company for a specific broker without a date filter
export const getPayOutCommissionByBrokerAndCompany = async (req, res) => {
  try {
    const { brokerId } = req.query;

    if (!brokerId) {
      return res.status(400).json({
        message: "Please provide brokerId.",
        success: false,
        status: "error",
      });
    }

    const companies = await MotorPolicyModel.aggregate([
      { $match: { brokerId, isActive: true } },
      { $group: { _id: "$companyName" } }
    ]);

    if (companies.length === 0) {
      return res.status(200).json({
        message: `No companies found for brokerId ${brokerId}.`,
        data: [],
        totalAmount: 0,
        success: true,
        status: "success",
      });
    }

    const companySummaries = [];
    let totalAmount = 0;

    for (const company of companies) {
      const policies = await MotorPolicyModel.find({
        brokerId,
        companyName: company._id,
        isActive: true,
      }).select('policyNumber').lean();

      const policyNumbers = policies.map(policy => policy.policyNumber);

      const totalPayOutCommission = await MotorPolicyPaymentModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers } } },
        { $group: { _id: null, totalPayOutCommission: { $sum: "$payOutCommission" } } }
      ]);

      const payOutCommission = totalPayOutCommission.length > 0 ? totalPayOutCommission[0].totalPayOutCommission : 0;
      totalAmount += payOutCommission;

      companySummaries.push({
        companyName: company._id,
        totalPayOutCommission: payOutCommission,
      });
    }

    res.status(200).json({
      message: `Pay-out commissions for brokerId ${brokerId} by company fetched successfully.`,
      data: companySummaries,
      totalAmount,
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
