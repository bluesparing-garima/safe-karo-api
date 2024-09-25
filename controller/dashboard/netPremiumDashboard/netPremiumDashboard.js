import MotorPolicyModel from "../../../models/policyModel/motorpolicySchema.js";
import UserProfile from "../../../models/adminModels/userProfileSchema.js";
import BrokerModel from "../../../models/adminModels/brokerSchema.js";

export const getAllPartnersWithNetPremium = async (req, res) => {
  try {
    const { category } = req.query;

    const partners = await MotorPolicyModel.aggregate([
      { $match: { isActive: true, ...(category && { category }) } },
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
    let totalNetPremiumSum = 0;

    for (const partner of partners) {
      const userProfile = await UserProfile.findOne({
        _id: partner._id,
      }).select("partnerId");
      const policies = await MotorPolicyModel.find({
        partnerId: partner._id,
        isActive: true,
        ...(category && { category }),
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPremium = await MotorPolicyModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers } } },
        {
          $group: {
            _id: null,
            totalNetPremium: { $sum: "$netPremium" },
          },
        },
      ]);

      const partnerNetPremium =
        totalPremium.length > 0 ? totalPremium[0].totalNetPremium : 0;

      if (partnerNetPremium > 0) {
        totalNetPremiumSum += partnerNetPremium;

        partnerSummaries.push({
          partnerId: partner._id,
          partnerName: partner.partnerName,
          partnerCode: userProfile?.partnerId || "N/A",
          netPremium: partnerNetPremium,
        });
      }
    }

    res.status(200).json({
      message: "Partners with net premiums fetched successfully.",
      data: partnerSummaries,
      totalAmount: totalNetPremiumSum,
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

export const getAllPartnersWithNetPremiumAndDateFilter = async (req, res) => {
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
    let totalNetPremiumSum = 0;

    for (const partner of partners) {
      const userProfile = await UserProfile.findOne({
        _id: partner._id,
      }).select("partnerId");
      const policies = await MotorPolicyModel.find({
        partnerId: partner._id,
        isActive: true,
        issueDate: { $gte: start, $lte: end },
        ...(category && { category }),
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPremium = await MotorPolicyModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers } } },
        {
          $group: {
            _id: null,
            totalNetPremium: { $sum: "$netPremium" },
          },
        },
      ]);

      const partnerNetPremium =
        totalPremium.length > 0 ? totalPremium[0].totalNetPremium : 0;

      if (partnerNetPremium > 0) {
        totalNetPremiumSum += partnerNetPremium;

        partnerSummaries.push({
          partnerId: partner._id,
          partnerName: partner.partnerName,
          partnerCode: userProfile?.partnerId || "N/A",
          netPremium: partnerNetPremium,
        });
      }
    }

    res.status(200).json({
      message: `Partner net premiums between ${startDate} and ${endDate}.`,
      data: partnerSummaries,
      totalAmount: totalNetPremiumSum,
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

export const getCompaniesByPartnerIdAndCategory = async (req, res) => {
  try {
    const { partnerId, category } = req.query;

    if (!partnerId || !category) {
      return res.status(400).json({
        message: "Please provide both partnerId and category.",
        success: false,
        status: "error",
      });
    }

    const userProfile = await UserProfile.findOne({ _id: partnerId }).lean();

    if (!userProfile) {
      return res.status(404).json({
        message: "Partner not found.",
        success: false,
        status: "error",
      });
    }

    const { partnerId: partnerCode, fullName: partnerName } = userProfile;

    const result = await MotorPolicyModel.aggregate([
      {
        $match: {
          partnerId,
          category,
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$companyName",
          totalNetPremium: { $sum: "$netPremium" },
        },
      },
      {
        $project: {
          _id: 0,
          companyName: "$_id",
          totalNetPremium: 1,
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(200).json({
        message: `No companies found for partnerId: ${partnerId} and category: ${category}.`,
        partnerCode,
        partnerName,
        data: [],
        totalAmount: 0,
        success: true,
        status: "success",
      });
    }

    const totalNetPremiumSum = result.reduce((sum, company) => sum + company.totalNetPremium, 0);

    res.status(200).json({
      message: "Companies with net premiums fetched successfully.",
      partnerCode,
      partnerName,
      data: result,
      totalAmount: totalNetPremiumSum,
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

export const getCompaniesByPartnerIdCategoryAndDateFilter = async (req, res) => {
  try {
    const { partnerId, category, startDate, endDate } = req.query;

    if (!partnerId || !category || !startDate || !endDate) {
      return res.status(400).json({
        message: "Please provide partnerId, category, startDate, and endDate.",
        success: false,
        status: "error",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); 

    const userProfile = await UserProfile.findOne({ _id: partnerId }).lean();

    if (!userProfile) {
      return res.status(404).json({
        message: "Partner not found.",
        success: false,
        status: "error",
      });
    }

    const { partnerId: partnerCode, fullName: partnerName } = userProfile;

    const result = await MotorPolicyModel.aggregate([
      {
        $match: {
          partnerId,
          category,
          issueDate: { $gte: start, $lte: end },
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$companyName",
          totalNetPremium: { $sum: "$netPremium" },
        },
      },
      {
        $project: {
          _id: 0,
          companyName: "$_id",
          totalNetPremium: 1,
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(200).json({
        message: `No companies found for partnerId: ${partnerId}, category: ${category} between ${startDate} and ${endDate}.`,
        partnerCode,
        partnerName,
        data: [],
        totalAmount: 0,
        success: true,
        status: "success",
      });
    }

    const totalNetPremiumSum = result.reduce((sum, company) => sum + company.totalNetPremium, 0);

    res.status(200).json({
      message: `Companies with net premiums between ${startDate} and ${endDate} fetched successfully.`,
      partnerCode,
      partnerName,
      data: result,
      totalAmount: totalNetPremiumSum,
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

/* ---------------- broker netPremium ------------------------  */

export const getAllBrokersWithNetPremium = async (req, res) => {
  try {
    const { category } = req.query;

    const brokers = await MotorPolicyModel.aggregate([
      { $match: { isActive: true, ...(category && { category }) } },
      { $group: { _id: "$brokerId", brokerName: { $first: "$broker" } } },
    ]);

    if (brokers.length === 0) {
      return res.status(200).json({
        message: `No brokers found.`,
        data: [],
        totalAmount: 0,
        success: true,
        status: "success",
      });
    }

    const brokerSummaries = [];
    let totalNetPremiumSum = 0;

    for (const broker of brokers) {
      const brokerProfile = await BrokerModel.findOne({ _id: broker._id }).lean();
      
      const policies = await MotorPolicyModel.find({
        brokerId: broker._id,
        isActive: true,
        ...(category && { category }),
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPremium = await MotorPolicyModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers } } },
        {
          $group: {
            _id: null,
            totalNetPremium: { $sum: "$netPremium" },
          },
        },
      ]);

      const brokerNetPremium =
        totalPremium.length > 0 ? totalPremium[0].totalNetPremium : 0;

      if (brokerNetPremium > 0) {
        totalNetPremiumSum += brokerNetPremium;

        brokerSummaries.push({
          brokerId: broker._id,
          brokerName: broker.brokerName,
          brokerCode: brokerProfile?.brokerCode || "N/A",
          netPremium: brokerNetPremium,
        });
      }
    }

    res.status(200).json({
      message: "Brokers with net premiums fetched successfully.",
      data: brokerSummaries,
      totalAmount: totalNetPremiumSum,
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

export const getAllBrokersWithNetPremiumAndDateFilter = async (req, res) => {
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

    const brokers = await MotorPolicyModel.aggregate([
      {
        $match: {
          issueDate: { $gte: start, $lte: end },
          isActive: true,
          ...(category && { category }),
        },
      },
      { $group: { _id: "$brokerId", brokerName: { $first: "$broker" } } },
    ]);

    if (brokers.length === 0) {
      return res.status(200).json({
        message: `No brokers found between ${startDate} and ${endDate}.`,
        data: [],
        totalAmount: 0,
        success: true,
        status: "success",
      });
    }

    const brokerSummaries = [];
    let totalNetPremiumSum = 0;

    for (const broker of brokers) {
      const brokerProfile = await BrokerModel.findOne({ _id: broker._id }).lean();

      const policies = await MotorPolicyModel.find({
        brokerId: broker._id,
        isActive: true,
        issueDate: { $gte: start, $lte: end },
        ...(category && { category }),
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPremium = await MotorPolicyModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers } } },
        {
          $group: {
            _id: null,
            totalNetPremium: { $sum: "$netPremium" },
          },
        },
      ]);

      const brokerNetPremium =
        totalPremium.length > 0 ? totalPremium[0].totalNetPremium : 0;

      if (brokerNetPremium > 0) {
        totalNetPremiumSum += brokerNetPremium;

        brokerSummaries.push({
          brokerId: broker._id,
          brokerName: broker.brokerName,
          brokerCode: brokerProfile?.brokerCode || "N/A",
          netPremium: brokerNetPremium,
        });
      }
    }

    res.status(200).json({
      message: `Broker net premiums between ${startDate} and ${endDate}.`,
      data: brokerSummaries,
      totalAmount: totalNetPremiumSum,
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

export const getCompaniesByBrokerIdAndCategory = async (req, res) => {
  try {
    const { brokerId, category } = req.query;

    if (!brokerId || !category) {
      return res.status(400).json({
        message: "Please provide both brokerId and category.",
        success: false,
        status: "error",
      });
    }

    const brokerProfile = await BrokerModel.findOne({ _id: brokerId }).lean();

    if (!brokerProfile) {
      return res.status(404).json({
        message: "Broker not found.",
        success: false,
        status: "error",
      });
    }

    const { brokerCode, brokerName } = brokerProfile;

    const companySummaries = await MotorPolicyModel.aggregate([
      {
        $match: {
          brokerId,
          category,
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$companyName",
          totalNetPremium: { $sum: "$netPremium" },
        },
      },
    ]);

    const totalNetPremiumSum = companySummaries.reduce((sum, company) => sum + company.totalNetPremium, 0);

    res.status(200).json({
      message: "Companies with net premiums fetched successfully.",
      brokerCode,
      brokerName,
      data: companySummaries.map(company => ({
        companyName: company._id,
        netPremium: company.totalNetPremium,
      })),
      totalAmount: totalNetPremiumSum,
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

export const getCompaniesByBrokerIdCategoryAndDateFilter = async (req, res) => {
  try {
    const { brokerId, category, startDate, endDate } = req.query;

    if (!brokerId || !category || !startDate || !endDate) {
      return res.status(400).json({
        message: "Please provide brokerId, category, startDate, and endDate.",
        success: false,
        status: "error",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const brokerProfile = await BrokerModel.findOne({ _id: brokerId }).lean();

    if (!brokerProfile) {
      return res.status(404).json({
        message: "Broker not found.",
        success: false,
        status: "error",
      });
    }

    const { brokerCode, brokerName } = brokerProfile;

    const companySummaries = await MotorPolicyModel.aggregate([
      {
        $match: {
          brokerId,
          category,
          issueDate: { $gte: start, $lte: end },
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$companyName",
          totalNetPremium: { $sum: "$netPremium" },
        },
      },
    ]);

    const totalNetPremiumSum = companySummaries.reduce((sum, company) => sum + company.totalNetPremium, 0);

    res.status(200).json({
      message: `Companies with net premiums between ${startDate} and ${endDate} fetched successfully.`,
      brokerCode,
      brokerName,
      data: companySummaries.map(company => ({
        companyName: company._id,
        netPremium: company.totalNetPremium,
      })),
      totalAmount: totalNetPremiumSum,
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


  