import MotorPolicyModel from "../../../models/policyModel/motorpolicySchema.js";
import MotorPolicyPaymentModel from "../../../models/policyModel/motorPolicyPaymentSchema.js";
import UserProfile from "../../../models/adminModels/userProfileSchema.js";

export const getAllPartnersWithPayOutCommissionAndDateFilter = async (
  req,
  res
) => {
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
      {
        $group: { _id: "$partnerId", partnerName: { $first: "$partnerName" } },
      },
    ]);

    if (partners.length === 0) {
      return res.status(200).json({
        message: `No partners found between ${startDate} and ${endDate}.`,
        data: [],
        totalAmount: 0,
        success: true,
        status: "success",
      });
    }

    const partnerSummaries = [];
    let totalPayOutCommissionSum = 0;

    for (const partner of partners) {
      const userProfile = await UserProfile.findOne({
        _id: partner._id,
      }).select("partnerId");

      const policies = await MotorPolicyModel.find({
        partnerId: partner._id,
        isActive: true,
        issueDate: { $gte: start, $lte: end },
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalCommission = await MotorPolicyPaymentModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers } } },
        {
          $group: { _id: null, totalCommission: { $sum: "$payOutCommission" } },
        },
      ]);

      const partnerCommission =
        totalCommission.length > 0 ? totalCommission[0].totalCommission : 0;

      if (partnerCommission > 0) {
        totalPayOutCommissionSum += partnerCommission;

        partnerSummaries.push({
          partnerId: partner._id,
          partnerName: partner.partnerName,
          partnerCode: userProfile?.partnerId || "N/A",
          totalPayOutCommission: partnerCommission,
        });
      }
    }
    res.status(200).json({
      message: `Partner payout commissions between ${startDate} and ${endDate}.`,
      data: partnerSummaries,
      totalAmount: totalPayOutCommissionSum,
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
      { $match: { isActive: true } },
      {
        $group: { _id: "$partnerId", partnerName: { $first: "$partnerName" } },
      },
    ]);

    if (partners.length === 0) {
      return res.status(200).json({
        message: `No partners found.`,
        data: [],
        totalAmount: 0,
        success: true,
        status: "success",
      });
    }

    const partnerSummaries = [];
    let totalPayOutCommissionSum = 0;

    for (const partner of partners) {
      const userProfile = await UserProfile.findOne({
        _id: partner._id,
      }).select("partnerId");

      const policies = await MotorPolicyModel.find({
        partnerId: partner._id,
        isActive: true,
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalCommission = await MotorPolicyPaymentModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers } } },
        {
          $group: { _id: null, totalCommission: { $sum: "$payOutCommission" } },
        },
      ]);

      const partnerCommission =
        totalCommission.length > 0 ? totalCommission[0].totalCommission : 0;

      if (partnerCommission > 0) {
        totalPayOutCommissionSum += partnerCommission;

        partnerSummaries.push({
          partnerId: partner._id,
          partnerName: partner.partnerName,
          partnerCode: userProfile?.partnerId || "N/A",
          totalPayOutCommission: partnerCommission,
        });
      }
    }
    res.status(200).json({
      message: "Partners with payout commissions fetched successfully.",
      data: partnerSummaries,
      totalAmount: totalPayOutCommissionSum,
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

// partner + Companyname filter within date range
export const getPayOutCommissionByCompanyWithDate = async (req, res) => {
  try {
    const { partnerId, startDate, endDate } = req.query;

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

    const partner = await UserProfile.findOne({ _id: partnerId }).select(
      "fullName partnerId"
    );
    if (!partner) {
      return res.status(404).json({
        message: `No partner found for partnerId ${partnerId}.`,
        success: false,
        status: "error",
      });
    }

    const companies = await MotorPolicyModel.aggregate([
      {
        $match: {
          partnerId,
          issueDate: { $gte: start, $lte: end },
          isActive: true,
        },
      },
      { $group: { _id: "$companyName" } },
    ]);

    if (companies.length === 0) {
      return res.status(200).json({
        message: `No policies found for partnerId ${partnerId} between ${startDate} and ${endDate}.`,
        data: [],
        totalAmount: 0,
        partnerName: partner.fullName,
        partnerCode: partner.partnerId,
        success: true,
        status: "success",
      });
    }

    const companySummaries = [];
    let totalAmount = 0;

    for (const company of companies) {
      const policies = await MotorPolicyModel.find({
        partnerId,
        companyName: company._id,
        isActive: true,
        issueDate: { $gte: start, $lte: end },
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPayOutCommission = await MotorPolicyPaymentModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers } } },
        {
          $group: {
            _id: null,
            totalPayOutCommission: { $sum: "$payOutCommission" },
          },
        },
      ]);

      const payOutCommission =
        totalPayOutCommission.length > 0
          ? totalPayOutCommission[0].totalPayOutCommission
          : 0;

      if (payOutCommission > 0) {
        totalAmount += payOutCommission;

        companySummaries.push({
          companyName: company._id,
          totalPayOutCommission: payOutCommission,
        });
      }
    }
    res.status(200).json({
      message: `Payout commissions for partnerId ${partnerId} by company between ${startDate} and ${endDate} fetched successfully.`,
      partnerName: partner.fullName,
      partnerCode: partner.partnerId,
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

// partnerId + companyName without date filter
export const getPayOutCommissionByCompany = async (req, res) => {
  try {
    const { partnerId } = req.query;

    const partner = await UserProfile.findOne({ _id: partnerId }).select(
      "fullName partnerId"
    );
    if (!partner) {
      return res.status(404).json({
        message: `No partner found for partnerId ${partnerId}.`,
        success: false,
        status: "error",
      });
    }

    const companies = await MotorPolicyModel.aggregate([
      { $match: { partnerId, isActive: true } },
      { $group: { _id: "$companyName" } },
    ]);

    if (companies.length === 0) {
      return res.status(200).json({
        message: `No policies found for partnerId ${partnerId}.`,
        data: [],
        totalAmount: 0,
        partnerName: partner.fullName,
        partnerCode: partner.partnerId,
        success: true,
        status: "success",
      });
    }

    const companySummaries = [];
    let totalAmount = 0;

    for (const company of companies) {
      const policies = await MotorPolicyModel.find({
        partnerId,
        companyName: company._id,
        isActive: true,
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPayOutCommission = await MotorPolicyPaymentModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers } } },
        {
          $group: {
            _id: null,
            totalPayOutCommission: { $sum: "$payOutCommission" },
          },
        },
      ]);

      const payOutCommission =
        totalPayOutCommission.length > 0
          ? totalPayOutCommission[0].totalPayOutCommission
          : 0;

      if (payOutCommission > 0) {
        totalAmount += payOutCommission;

        companySummaries.push({
          companyName: company._id,
          totalPayOutCommission: payOutCommission,
        });
      }
    }

    res.status(200).json({
      message: `Total payout commissions for partnerId ${partnerId} by company fetched successfully.`,
      partnerName: partner.fullName,
      partnerCode: partner.partnerId,
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
