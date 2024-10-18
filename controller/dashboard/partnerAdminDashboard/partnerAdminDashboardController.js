import MotorPolicyModel from "../../../models/policyModel/motorpolicySchema.js";
import MotorPolicyPaymentModel from "../../../models/policyModel/motorPolicyPaymentSchema.js";
import UserProfile from "../../../models/adminModels/userProfileSchema.js";
import creditAndDebitSchema from "../../../models/accountsModels/creditAndDebitSchema.js";

export const getAllPartnersWithPayOutCommissionAndDateFilter = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

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

    const matchCriteria = {
      issueDate: { $gte: start, $lte: end },
      isActive: true,
    };
    
    if (category) {
      matchCriteria.category = category; // Include category in the match criteria
    }

    const partners = await MotorPolicyModel.aggregate([
      { $match: matchCriteria },
      { $group: { _id: "$partnerId", partnerName: { $first: "$partnerName" } } },
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
      const userProfile = await UserProfile.findOne({ _id: partner._id }).select("partnerId");

      const policies = await MotorPolicyModel.find({
        partnerId: partner._id,
        isActive: true,
        issueDate: { $gte: start, $lte: end },
      }).select("policyNumber").lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalCommission = await MotorPolicyPaymentModel.aggregate([
        { 
          $match: { 
            policyNumber: { $in: policyNumbers }, 
            ...(category && { category }),
            isActive: true
          } 
        }, 
        {
          $group: { _id: null, totalCommission: { $sum: "$payOutCommission" } },
        },
      ]);

      const partnerCommission = totalCommission.length > 0 ? totalCommission[0].totalCommission : 0;

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
    const { category } = req.query;

    const matchConditions = { isActive: true };
    if (category) {
      matchConditions.category = category; // Add category filter if present
    }

    const partners = await MotorPolicyModel.aggregate([
      { $match: matchConditions },
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
        ...(category && { category }), // Add category filter if present
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalCommission = await MotorPolicyPaymentModel.aggregate([
        { 
          $match: { 
            policyNumber: { $in: policyNumbers }, 
            isActive: true
          } 
        },
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

export const getPayOutCommissionByCompanyWithDate = async (req, res) => {
  try {
    const { partnerId, startDate, endDate, category } = req.query;

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

    const partner = await UserProfile.findOne({ _id: partnerId }).select("fullName partnerId");
    if (!partner) {
      return res.status(404).json({
        message: `No partner found for partnerId ${partnerId}.`,
        success: false,
        status: "error",
      });
    }

    const matchCriteria = {
      partnerId,
      issueDate: { $gte: start, $lte: end },
      isActive: true,
    };

    const companies = await MotorPolicyModel.aggregate([
      { $match: matchCriteria },
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
      }).select("policyNumber").lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPayOutCommission = await MotorPolicyPaymentModel.aggregate([
        { 
          $match: { 
            policyNumber: { $in: policyNumbers }, 
            ...(category && { category }),
            isActive: true, 
          } 
        },
        {
          $group: {
            _id: null,
            totalPayOutCommission: { $sum: "$payOutCommission" },
          },
        },
      ]);

      const payOutCommission = totalPayOutCommission.length > 0
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

export const getPayOutCommissionByCompany = async (req, res) => {
  try {
    const { partnerId, category } = req.query;

    const partner = await UserProfile.findOne({ _id: partnerId }).select("fullName partnerId");
    if (!partner) {
      return res.status(404).json({
        message: `No partner found for partnerId ${partnerId}.`,
        success: false,
        status: "error",
      });
    }

    const matchConditions = { partnerId, isActive: true }; // Added isActive condition here
    if (category) {
      matchConditions.category = category; // Add category filter if present
    }

    const companies = await MotorPolicyModel.aggregate([
      { $match: matchConditions },
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
        ...(category && { category }), // Add category filter if present
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPayOutCommission = await MotorPolicyPaymentModel.aggregate([
        { 
          $match: { 
            policyNumber: { $in: policyNumbers }, 
            isActive: true,
          } 
        },
        {
          $group: {
            _id: null,
            totalPayOutCommission: { $sum: "$payOutCommission" },
          },
        },
      ]);

      const payOutCommission = totalPayOutCommission.length > 0
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

// payOutAmount paid

export const getAllPartnersWithPayOutAmountAndDateFilter = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

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

    const matchCriteria = {
      issueDate: { $gte: start, $lte: end },
      isActive: true,
    };
    if (category) matchCriteria.category = category;

    const partners = await MotorPolicyModel.aggregate([
      { $match: matchCriteria },
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
    let totalPayOutAmountSum = 0;

    for (const partner of partners) {
      const userProfile = await UserProfile.findOne({ _id: partner._id }).select("partnerId");

      const totalPaidAmountAggregate = await MotorPolicyPaymentModel.aggregate([
        {
          $match: {
            partnerId: partner._id,
            isActive: true,
            payOutPaymentStatus: "Paid",
            policyDate: { $gte: start, $lte: end }, 
            ...(category && { category }),
          },
        },
        {
          $group: { _id: null, totalPayOutAmount: { $sum: "$payOutAmount" } },
        },
      ]);

      const partnerPayOutAmount =
        totalPaidAmountAggregate.length > 0
          ? Math.round(totalPaidAmountAggregate[0].totalPayOutAmount)
          : 0;

      if (partnerPayOutAmount > 0) {
        totalPayOutAmountSum += partnerPayOutAmount;

        partnerSummaries.push({
          partnerId: partner._id,
          partnerName: partner.partnerName,
          partnerCode: userProfile?.partnerId || "N/A",
          totalPayOutAmount: partnerPayOutAmount,
        });
      }
    }

    res.status(200).json({
      message: `Partner payout amounts between ${startDate} and ${endDate}.`,
      data: partnerSummaries,
      totalAmount: Math.round(totalPayOutAmountSum),
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

export const getAllPartnersWithPayOutAmount = async (req, res) => { 
  try {
    const { category } = req.query;

    const matchCriteria = { isActive: true };
    if (category) {
      matchCriteria.category = category;
    }

    const partners = await MotorPolicyModel.aggregate([
      { $match: matchCriteria },
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
    let totalPayOutAmountSum = 0;

    for (const partner of partners) {
      const userProfile = await UserProfile.findOne({
        _id: partner._id,
      }).select("partnerId");

      const totalPaidAmountAggregate = await MotorPolicyPaymentModel.aggregate([
        {
          $match: {
            partnerId: partner._id,
            isActive: true,
            payOutPaymentStatus: "Paid",
            ...(category && { category }),
          },
        },
        {
          $group: { _id: null, totalPayOutAmount: { $sum: "$payOutAmount" } },
        },
      ]);

      const partnerPayOutAmount =
        totalPaidAmountAggregate.length > 0
          ? Math.round(totalPaidAmountAggregate[0].totalPayOutAmount)
          : 0;

      if (partnerPayOutAmount > 0) {
        totalPayOutAmountSum += partnerPayOutAmount;

        partnerSummaries.push({
          partnerId: partner._id,
          partnerName: partner.partnerName,
          partnerCode: userProfile?.partnerId || "N/A",
          totalPayOutAmount: partnerPayOutAmount,
        });
      }
    }

    // Return the response with the total payout amount and summaries
    res.status(200).json({
      message: "Partners with payout amounts fetched successfully.",
      data: partnerSummaries,
      totalAmount: Math.round(totalPayOutAmountSum),
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

export const getPayOutAmountByCompanyWithDate = async (req, res) => {
  try {
    const { partnerId, startDate, endDate, category } = req.query;

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
          ...(category && { category }), // Adding category filter if present
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
        ...(category && { category }), // Adding category filter if present
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPayOutAmount = await MotorPolicyPaymentModel.aggregate([
        { 
          $match: { 
            policyNumber: { $in: policyNumbers },
            payOutPaymentStatus: { $in: ["Paid", "paid"] },
            ...(category && { category }), // Assuming 'category' exists in MotorPolicyPaymentModel
          } 
        },
        {
          $group: {
            _id: null,
            totalPayOutAmount: { $sum: "$payOutCommission" },
          },
        },
      ]);

      const payOutAmount =
        totalPayOutAmount.length > 0
          ? totalPayOutAmount[0].totalPayOutAmount
          : 0;

      if (payOutAmount > 0) {
        totalAmount += payOutAmount;

        companySummaries.push({
          companyName: company._id,
          totalPayOutAmount: payOutAmount,
        });
      }
    }
    res.status(200).json({
      message: `Payout amounts for partnerId ${partnerId} by company between ${startDate} and ${endDate} fetched successfully.`,
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

export const getPayOutAmountByCompany = async (req, res) => {
  try {
    const { partnerId, category } = req.query;

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
          isActive: true, 
          ...(category && { category }) // Adding category filter if present
        } 
      },
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
        ...(category && { category }) // Adding category filter if present
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPayOutAmount = await MotorPolicyPaymentModel.aggregate([
        { 
          $match: { 
            policyNumber: { $in: policyNumbers },
            payOutPaymentStatus: { $in: ["Paid", "paid"] },
            ...(category && { category }), // Assuming 'category' exists in MotorPolicyPaymentModel
          } 
        },
        {
          $group: {
            _id: null,
            totalPayOutAmount: { $sum: "$payOutCommission" },
          },
        },
      ]);

      const payOutAmount =
        totalPayOutAmount.length > 0
          ? totalPayOutAmount[0].totalPayOutAmount
          : 0;

      if (payOutAmount > 0) {
        totalAmount += payOutAmount;

        companySummaries.push({
          companyName: company._id,
          totalPayOutAmount: payOutAmount,
        });
      }
    }

    res.status(200).json({
      message: `Total payout amounts for partnerId ${partnerId} by company fetched successfully.`,
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

// payOutAmount partial or unpaid

export const getAllPartnersWithUnpaidAndPartialPayOutAmount = async (req, res) => {
  try {
    const { category } = req.query; // Extract category from query

    const partners = await MotorPolicyModel.aggregate([
      { $match: { isActive: true, ...(category && { category }) } }, // Include category in match
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
    let totalPayOutAmountSum = 0;

    for (const partner of partners) {
      const userProfile = await UserProfile.findOne({
        _id: partner._id,
      }).select("partnerId");

      const policies = await MotorPolicyModel.find({
        partnerId: partner._id,
        isActive: true,
        ...(category && { category }), // Include category filter
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalAmount = await MotorPolicyPaymentModel.aggregate([
        {
          $match: {
            policyNumber: { $in: policyNumbers },
            payOutPaymentStatus: { $in: ["UnPaid", "unPaid", "Partial"] },
            ...(category && { category }), // Include category filter
          }
        },
        {
          $group: {
            _id: null,
            totalUnpaidCommission: {
              $sum: {
                $cond: [{ $eq: ["$payOutPaymentStatus", "UnPaid"] }, "$payOutCommission", 0]
              }
            },
            totalPartialBalance: {
              $sum: {
                $cond: [{ $eq: ["$payOutPaymentStatus", "Partial"] }, "$payOutBalance", 0]
              }
            }
          }
        }
      ]);
      
      const partnerPayOutAmount =
        totalAmount.length > 0
          ? totalAmount[0].totalUnpaidCommission + totalAmount[0].totalPartialBalance
          : 0;      

      if (partnerPayOutAmount > 0) {
        totalPayOutAmountSum += partnerPayOutAmount;

        partnerSummaries.push({
          partnerId: partner._id,
          partnerName: partner.partnerName,
          partnerCode: userProfile?.partnerId || "N/A",
          totalPayOutAmount: partnerPayOutAmount,
        });
      }
    }
    res.status(200).json({
      message: "Partners with payout amounts fetched successfully.",
      data: partnerSummaries,
      totalAmount: totalPayOutAmountSum,
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

export const getAllPartnersWithUnpaidAndPartialPayOutAmountAndDateFilter = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query; // Include category

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
      { $match: { issueDate: { $gte: start, $lte: end }, isActive: true, ...(category && { category }) } }, // Include category
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
    let totalPayOutAmountSum = 0;

    for (const partner of partners) {
      const userProfile = await UserProfile.findOne({
        _id: partner._id,
      }).select("partnerId");

      const policies = await MotorPolicyModel.find({
        partnerId: partner._id,
        isActive: true,
        issueDate: { $gte: start, $lte: end },
        ...(category && { category }) // Include category filter
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalAmount = await MotorPolicyPaymentModel.aggregate([
        {
          $match: {
            policyNumber: { $in: policyNumbers },
            payOutPaymentStatus: { $in: ["UnPaid", "unPaid", "Partial"] },
            ...(category && { category }), // Include category filter
          }
        },
        {
          $group: {
            _id: null,
            totalUnpaidCommission: {
              $sum: {
                $cond: [{ $eq: ["$payOutPaymentStatus", "UnPaid"] }, "$payOutCommission", 0]
              }
            },
            totalPartialBalance: {
              $sum: {
                $cond: [{ $eq: ["$payOutPaymentStatus", "Partial"] }, "$payOutBalance", 0]
              }
            }
          }
        }
      ]);
      
      const partnerPayOutAmount =
        totalAmount.length > 0
          ? totalAmount[0].totalUnpaidCommission + totalAmount[0].totalPartialBalance
          : 0;      

      if (partnerPayOutAmount > 0) {
        totalPayOutAmountSum += partnerPayOutAmount;

        partnerSummaries.push({
          partnerId: partner._id,
          partnerName: partner.partnerName,
          partnerCode: userProfile?.partnerId || "N/A",
          totalPayOutAmount: partnerPayOutAmount,
        });
      }
    }
    res.status(200).json({
      message: `Partner payout amounts between ${startDate} and ${endDate}.`,
      data: partnerSummaries,
      totalAmount: totalPayOutAmountSum,
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

export const getUnpaidAndPartialPayOutAmountByCompanyWithDate = async (req, res) => {
  try {
    const { partnerId, startDate, endDate, category } = req.query; // Include category

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
          ...(category && { category }), // Include category filter
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
        ...(category && { category }), // Include category filter
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPayOutAmount = await MotorPolicyPaymentModel.aggregate([
        {
          $match: {
            policyNumber: { $in: policyNumbers },
            payOutPaymentStatus: { $in: ["UnPaid", "unPaid", "Partial"] },
            ...(category && { category }), // Include category filter
          }
        },
        {
          $group: {
            _id: null,
            totalUnpaidCommission: {
              $sum: {
                $cond: [{ $eq: ["$payOutPaymentStatus", "UnPaid"] }, "$payOutCommission", 0]
              }
            },
            totalPartialBalance: {
              $sum: {
                $cond: [{ $eq: ["$payOutPaymentStatus", "Partial"] }, "$payOutBalance", 0]
              }
            }
          }
        }
      ]);

      const companyPayOutAmount =
        totalPayOutAmount.length > 0
          ? totalPayOutAmount[0].totalUnpaidCommission + totalPayOutAmount[0].totalPartialBalance
          : 0;

      if (companyPayOutAmount > 0) {
        totalAmount += companyPayOutAmount;

        companySummaries.push({
          companyName: company._id,
          totalPayOutAmount: companyPayOutAmount,
        });
      }
    }
    res.status(200).json({
      message: `Payout amounts for ${partner.fullName} between ${startDate} and ${endDate}.`,
      data: companySummaries,
      totalAmount,
      partnerName: partner.fullName,
      partnerCode: partner.partnerId,
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

export const getUnpaidAndPartialPayOutAmountByCompany = async (req, res) => {
  try {
    const { partnerId, category } = req.query; // Extract category from query

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
          isActive: true,
          ...(category && { category }), // Include category filter
        }
      },
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
        ...(category && { category }), // Include category filter
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPayOutAmount = await MotorPolicyPaymentModel.aggregate([
        {
          $match: {
            policyNumber: { $in: policyNumbers },
            payOutPaymentStatus: { $in: ["UnPaid", "unPaid", "Partial"] },
            ...(category && { category }), // Include category filter
          }
        },
        {
          $group: {
            _id: null,
            totalUnpaidCommission: {
              $sum: {
                $cond: [{ $eq: ["$payOutPaymentStatus", "UnPaid"] }, "$payOutCommission", 0]
              }
            },
            totalPartialBalance: {
              $sum: {
                $cond: [{ $eq: ["$payOutPaymentStatus", "Partial"] }, "$payOutBalance", 0]
              }
            }
          }
        }
      ]);

      const payOutAmount =
        totalPayOutAmount.length > 0
          ? totalPayOutAmount[0].totalUnpaidCommission + totalPayOutAmount[0].totalPartialBalance
          : 0;      

      if (payOutAmount > 0) {
        totalAmount += payOutAmount;

        companySummaries.push({
          companyName: company._id,
          totalPayOutAmount: payOutAmount,
        });
      }
    }

    res.status(200).json({
      message: `Unpaid and partial payout amounts for partnerId ${partnerId} by company fetched successfully.`,
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

// partnerBalance

export const getAllPartnersWithPartnerBalanceAndDateFilter = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

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
      {
        $match: {
          issueDate: { $gte: start, $lte: end },
          isActive: true,
          ...(category && { category }),
        },
      },
      {
        $group: {
          _id: "$partnerId",
          partnerName: { $first: "$partnerName" },
        },
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
    let totalPartnerBalanceSum = 0;

    for (const partner of partners) {
      const lastBalanceEntry = await creditAndDebitSchema.findOne(
        {
          partnerId: partner._id,
          createdOn: { $gte: start, $lte: end },
        },
        { partnerBalance: 1 },
        { sort: { createdOn: -1 } }
      );

      const partnerBalance = lastBalanceEntry ? lastBalanceEntry.partnerBalance : 0;

      if (partnerBalance !== 0) {
        totalPartnerBalanceSum += partnerBalance;

        partnerSummaries.push({
          partnerId: partner._id,
          partnerName: partner.partnerName,
          totalPartnerBalance: partnerBalance,
        });
      }
    }

    res.status(200).json({
      message: `Partner balance between ${startDate} and ${endDate} fetched successfully.`,
      data: partnerSummaries,
      totalAmount: totalPartnerBalanceSum,
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

export const getAllPartnersWithPartnerBalance = async (req, res) => {
  try {
    const { category } = req.query;

    const partners = await MotorPolicyModel.aggregate([
      {
        $match: {
          isActive: true,
          ...(category && { category }),
        },
      },
      {
        $group: {
          _id: "$partnerId",
          partnerName: { $first: "$partnerName" },
        },
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
    let totalPartnerBalanceSum = 0;

    for (const partner of partners) {
      const lastBalanceEntry = await creditAndDebitSchema.findOne(
        { partnerId: partner._id },
        { partnerBalance: 1 },
        { sort: { createdOn: -1 } }
      );

      const partnerBalance = lastBalanceEntry ? lastBalanceEntry.partnerBalance : 0;

      if (partnerBalance !== 0) {
        totalPartnerBalanceSum += partnerBalance;

        partnerSummaries.push({
          partnerId: partner._id,
          partnerName: partner.partnerName,
          totalPartnerBalance: partnerBalance,
        });
      }
    }

    res.status(200).json({
      message: "Partners with partner balance fetched successfully.",
      data: partnerSummaries,
      totalAmount: totalPartnerBalanceSum,
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

export const getPartnerBalanceByCompanyWithDate = async (req, res) => {
  try {
    const { partnerId, startDate, endDate, category } = req.query;

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
          ...(category && { category }),
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
        ...(category && { category }),
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPartnerBalance = await MotorPolicyPaymentModel.aggregate([
        {
          $match: {
            policyNumber: { $in: policyNumbers },
            ...(category && { category }),
          }
        },
        {
          $group: {
            _id: null,
            totalPartnerBalance: { $sum: "$partnerBalance" },
          },
        },
      ]);

      const partnerBalance =
        totalPartnerBalance.length > 0
          ? totalPartnerBalance[0].totalPartnerBalance
          : 0;

      if (partnerBalance > 0) {
        totalAmount += partnerBalance;

        companySummaries.push({
          companyName: company._id,
          totalPartnerBalance: partnerBalance,
        });
      }
    }
    res.status(200).json({
      message: `Partner balance for partnerId ${partnerId} by company between ${startDate} and ${endDate} fetched successfully.`,
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

export const getPartnerBalanceByCompany = async (req, res) => {
  try {
    const { partnerId, category } = req.query;

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
          isActive: true,
          ...(category && { category }),
        },
      },
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
        ...(category && { category }),
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPartnerBalance = await MotorPolicyPaymentModel.aggregate([
        {
          $match: {
            policyNumber: { $in: policyNumbers },
            ...(category && { category }),
          }
        },
        {
          $group: {
            _id: null,
            totalPartnerBalance: { $sum: "$partnerBalance" },
          },
        },
      ]);

      const partnerBalance =
        totalPartnerBalance.length > 0
          ? totalPartnerBalance[0].totalPartnerBalance
          : 0;

      if (partnerBalance > 0) {
        totalAmount += partnerBalance;

        companySummaries.push({
          companyName: company._id,
          totalPartnerBalance: partnerBalance,
        });
      }
    }

    res.status(200).json({
      message: `Partner balance for partnerId ${partnerId} by company fetched successfully.`,
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

