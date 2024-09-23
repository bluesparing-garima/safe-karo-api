import MotorPolicyModel from "../../../models/policyModel/motorpolicySchema.js";
import MotorPolicyPaymentModel from "../../../models/policyModel/motorPolicyPaymentSchema.js";

// Get pay-in commission by broker with a date filter
export const getAllBrokersWithPayInCommissionAndDateFilter = async (
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

    const brokers = await MotorPolicyModel.aggregate([
      { $match: { issueDate: { $gte: start, $lte: end }, isActive: true } },
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
    let totalAmount = 0;

    for (const broker of brokers) {
      const policies = await MotorPolicyModel.find({
        brokerId: broker._id,
        isActive: true,
        issueDate: { $gte: start, $lte: end },
      })
        .select("policyNumber")
        .lean();
    
      const policyNumbers = policies.map((policy) => policy.policyNumber);
    
      const totalPayInCommission = await MotorPolicyPaymentModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers } } },
        {
          $group: {
            _id: null,
            totalPayInCommission: { $sum: "$payInCommission" },
          },
        },
      ]);
    
      const payInCommission =
        totalPayInCommission.length > 0
          ? totalPayInCommission[0].totalPayInCommission
          : 0;
    
      if (payInCommission > 0) {
        totalAmount += payInCommission;
    
        brokerSummaries.push({
          brokerId: broker._id,
          brokerName: broker.brokerName,
          totalPayInCommission: payInCommission,
        });
      }
    }
    
    res.status(200).json({
      message: `Brokers with pay-in commissions between ${startDate} and ${endDate} fetched successfully.`,
      data: brokerSummaries,
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

// Get pay-in commission by broker without a date filter
export const getAllBrokersWithPayInCommission = async (req, res) => {
  try {
    const brokers = await MotorPolicyModel.aggregate([
      { $group: { _id: "$brokerId", brokerName: { $first: "$broker" } } },
    ]);

    if (brokers.length === 0) {
      return res.status(200).json({
        message: "No brokers found.",
        data: [],
        totalAmount: 0,
        success: true,
        status: "success",
      });
    }

    const brokerSummaries = [];
    let totalAmount = 0;

    for (const broker of brokers) {
      const policies = await MotorPolicyModel.find({
        brokerId: broker._id,
        isActive: true,
      })
        .select("policyNumber")
        .lean();
    
      const policyNumbers = policies.map((policy) => policy.policyNumber);
    
      const totalPayInCommission = await MotorPolicyPaymentModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers } } },
        {
          $group: {
            _id: null,
            totalPayInCommission: { $sum: "$payInCommission" },
          },
        },
      ]);
    
      const payInCommission =
        totalPayInCommission.length > 0
          ? totalPayInCommission[0].totalPayInCommission
          : 0;
    
      if (payInCommission > 0) {
        totalAmount += payInCommission;
    
        brokerSummaries.push({
          brokerId: broker._id,
          brokerName: broker.brokerName,
          totalPayInCommission: payInCommission,
        });
      }
    }
    
    res.status(200).json({
      message: "Brokers with total pay-in commissions fetched successfully.",
      data: brokerSummaries,
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

// Get pay-out commission by company for a specific broker with a date filter
export const getPayInCommissionByBrokerAndCompanyWithDateFilter = async (
  req,
  res
) => {
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

    const broker = await MotorPolicyModel.findOne({ brokerId, isActive: true })
      .select("broker")
      .lean();

    if (!broker) {
      return res.status(200).json({
        message: `No broker found for brokerId ${brokerId}.`,
        data: [],
        totalAmount: 0,
        success: true,
        status: "success",
      });
    }

    const companies = await MotorPolicyModel.aggregate([
      {
        $match: {
          brokerId,
          issueDate: { $gte: start, $lte: end },
          isActive: true,
        },
      },
      { $group: { _id: "$companyName" } },
    ]);

    if (companies.length === 0) {
      return res.status(200).json({
        message: `No companies found for brokerId ${brokerId} between ${startDate} and ${endDate}.`,
        data: [],
        brokerName: broker.broker,
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
      })
        .select("policyNumber")
        .lean();
    
      const policyNumbers = policies.map((policy) => policy.policyNumber);
    
      const totalPayInCommission = await MotorPolicyPaymentModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers } } },
        {
          $group: {
            _id: null,
            totalPayInCommission: { $sum: "$payInCommission" },
          },
        },
      ]);
    
      const payInCommission =
        totalPayInCommission.length > 0
          ? totalPayInCommission[0].totalPayInCommission
          : 0;
    
      if (payInCommission > 0) {
        totalAmount += payInCommission;
    
        companySummaries.push({
          companyName: company._id,
          totalPayInCommission: payInCommission,
        });
      }
    }
    
    res.status(200).json({
      message: `Pay-out commissions for brokerId ${brokerId} by company between ${startDate} and ${endDate} fetched successfully.`,
      data: companySummaries,
      totalAmount,
      brokerName: broker.broker,
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
export const getPayInCommissionByBrokerAndCompany = async (req, res) => {
  try {
    const { brokerId } = req.query;

    if (!brokerId) {
      return res.status(400).json({
        message: "Please provide brokerId.",
        success: false,
        status: "error",
      });
    }

    // Fetch the broker details including brokerName
    const broker = await MotorPolicyModel.findOne({ brokerId, isActive: true })
      .select("broker")
      .lean();

    if (!broker) {
      return res.status(200).json({
        message: `No broker found for brokerId ${brokerId}.`,
        data: [],
        totalAmount: 0,
        success: true,
        status: "success",
      });
    }

    const companies = await MotorPolicyModel.aggregate([
      { $match: { brokerId, isActive: true } },
      { $group: { _id: "$companyName" } },
    ]);

    if (companies.length === 0) {
      return res.status(200).json({
        message: `No companies found for brokerId ${brokerId}.`,
        data: [],
        brokerName: broker.broker,
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
      })
        .select("policyNumber")
        .lean();
    
      const policyNumbers = policies.map((policy) => policy.policyNumber);
    
      const totalPayInCommission = await MotorPolicyPaymentModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers } } },
        {
          $group: {
            _id: null,
            totalPayInCommission: { $sum: "$payInCommission" },
          },
        },
      ]);
    
      const payInCommission =
        totalPayInCommission.length > 0
          ? totalPayInCommission[0].totalPayInCommission
          : 0;
    
      if (payInCommission > 0) {
        totalAmount += payInCommission;
    
        companySummaries.push({
          companyName: company._id,
          totalPayInCommission: payInCommission,
        });
      }
    }
    
    res.status(200).json({
      message: `Pay-out commissions for brokerId ${brokerId} by company fetched successfully.`,
      data: companySummaries,
      totalAmount,
      brokerName: broker.broker,
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

// PayInPaymentStatus "PAID".

export const getAllBrokersWithPayInAmount = async (req, res) => {
  try {
    const brokers = await MotorPolicyModel.aggregate([
      { $group: { _id: "$brokerId", brokerName: { $first: "$broker" } } },
    ]);

    if (brokers.length === 0) {
      return res.status(200).json({
        message: "No brokers found.",
        data: [],
        totalAmount: 0,
        success: true,
        status: "success",
      });
    }

    const brokerSummaries = [];
    let totalAmount = 0;

    for (const broker of brokers) {
      const policies = await MotorPolicyModel.find({
        brokerId: broker._id,
        isActive: true,
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPayInAmount = await MotorPolicyPaymentModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers }, payInPaymentStatus: "Paid" } },
        {
          $group: {
            _id: null,
            totalPayInAmount: { $sum: "$payInAmount" },
          },
        },
      ]);

      const payInAmount =
      totalPayInAmount.length > 0
          ? totalPayInAmount[0].totalPayInAmount
          : 0;

      if (payInAmount > 0) {
        totalAmount += payInAmount;

        brokerSummaries.push({
          brokerId: broker._id,
          brokerName: broker.brokerName,
          totalPayInAmount: payInAmount,
        });
      }
    }

    res.status(200).json({
      message: "Brokers with total pay-in Amount fetched successfully.",
      data: brokerSummaries,
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

export const getAllBrokersWithPayInAmountAndDateFilter = async (req, res) => {
  try {
    const { startDate, endDate, brokerId } = req.query;

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

    const brokerMatch = brokerId ? { brokerId, isActive: true } : { isActive: true };

    const brokers = await MotorPolicyModel.aggregate([
      { $match: { ...brokerMatch, issueDate: { $gte: start, $lte: end } } },
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
    let totalAmount = 0;

    for (const broker of brokers) {
      const policies = await MotorPolicyModel.find({
        brokerId: broker._id,
        isActive: true,
        issueDate: { $gte: start, $lte: end },
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPayInAmount = await MotorPolicyPaymentModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers }, payInPaymentStatus: "Paid" } },
        {
          $group: {
            _id: null,
            totalPayInAmount: { $sum: "$payInAmount" },
          },
        },
      ]);

      const payInAmount =
      totalPayInAmount.length > 0
          ? totalPayInAmount[0].totalPayInAmount
          : 0;

      if (payInAmount > 0) {
        totalAmount += payInAmount;

        brokerSummaries.push({
          brokerId: broker._id,
          brokerName: broker.brokerName,
          totalPayInAmount: payInAmount,
        });
      }
    }

    res.status(200).json({
      message: `Brokers with pay-in Amount between ${startDate} and ${endDate} fetched successfully.`,
      data: brokerSummaries,
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

export const getPayInAmountByBrokerAndCompany = async (req, res) => {
  try {
    const { brokerId } = req.query;

    if (!brokerId) {
      return res.status(400).json({
        message: "Please provide brokerId.",
        success: false,
        status: "error",
      });
    }
    const broker = await MotorPolicyModel.findOne({ brokerId, isActive: true })
      .select("broker")
      .lean();

    if (!broker) {
      return res.status(200).json({
        message: `No broker found for brokerId ${brokerId}.`,
        data: [],
        totalAmount: 0,
        success: true,
        status: "success",
      });
    }

    const companies = await MotorPolicyModel.aggregate([
      { $match: { brokerId, isActive: true } },
      { $group: { _id: "$companyName" } },
    ]);

    if (companies.length === 0) {
      return res.status(200).json({
        message: `No companies found for brokerId ${brokerId}.`,
        data: [],
        brokerName: broker.broker,
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
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPayInAmount = await MotorPolicyPaymentModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers }, payInPaymentStatus: "Paid" } },
        {
          $group: {
            _id: null,
            totalPayInAmount: { $sum: "$payInAmount" },
          },
        },
      ]);

      const payInAmount =
      totalPayInAmount.length > 0
          ? totalPayInAmount[0].totalPayInAmount
          : 0;

      if (payInAmount > 0) {
        totalAmount += payInAmount;

        companySummaries.push({
          companyName: company._id,
          totalPayInAmount: payInAmount,
        });
      }
    }

    res.status(200).json({
      message: `Pay-in Amount for brokerId ${brokerId} by company fetched successfully.`,
      data: companySummaries,
      totalAmount,
      brokerName: broker.broker,
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

export const getPayInAmountByBrokerAndCompanyWithDateFilter = async (req, res) => {
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

    const broker = await MotorPolicyModel.findOne({ brokerId, isActive: true })
      .select("broker")
      .lean();

    if (!broker) {
      return res.status(200).json({
        message: `No broker found for brokerId ${brokerId}.`,
        data: [],
        totalAmount: 0,
        success: true,
        status: "success",
      });
    }

    const companies = await MotorPolicyModel.aggregate([
      {
        $match: {
          brokerId,
          issueDate: { $gte: start, $lte: end },
          isActive: true,
        },
      },
      { $group: { _id: "$companyName" } },
    ]);

    if (companies.length === 0) {
      return res.status(200).json({
        message: `No companies found for brokerId ${brokerId} between ${startDate} and ${endDate}.`,
        data: [],
        brokerName: broker.broker,
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
      })
        .select("policyNumber")
        .lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalPayInAmount = await MotorPolicyPaymentModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers }, payInPaymentStatus: "Paid" } },
        {
          $group: {
            _id: null,
            totalPayInAmount: { $sum: "$payInAmount" },
          },
        },
      ]);

      const payInAmount =
      totalPayInAmount.length > 0
          ? totalPayInAmount[0].totalPayInAmount
          : 0;

      if (payInAmount > 0) {
        totalAmount += payInAmount;

        companySummaries.push({
          companyName: company._id,
          totalPayInAmount: payInAmount,
        });
      }
    }

    res.status(200).json({
      message: `Pay-in Amount for brokerId ${brokerId} by company between ${startDate} and ${endDate} fetched successfully.`,
      data: companySummaries,
      totalAmount,
      brokerName: broker.broker,
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

// payInpaymentstatus: UnPaid or Partial

export const getBrokersWithUnpaidOrPartialPayInAmount = async (req, res) => {
  try {
    const brokers = await MotorPolicyModel.aggregate([
      { $group: { _id: "$brokerId", brokerName: { $first: "$broker" } } },
    ]);

    if (brokers.length === 0) {
      return res.status(200).json({
        message: "No brokers found.",
        data: [],
        totalAmount: 0,
        success: true,
        status: "success",
      });
    }

    const brokerSummaries = [];
    let totalPayInAmountSum = 0;

    for (const broker of brokers) {
      const policies = await MotorPolicyModel.find({
        brokerId: broker._id,
        isActive: true,
      }).select("policyNumber").lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalAmount = await MotorPolicyPaymentModel.aggregate([
        {
          $match: {
            policyNumber: { $in: policyNumbers },
            payInPaymentStatus: { $in: ["UnPaid", "Partial"] }
          }
        },
        {
          $group: {
            _id: null,
            totalUnpaidAmount: {
              $sum: {
                $cond: [{ $eq: ["$payInPaymentStatus", "UnPaid"] }, "$payInCommission", 0]
              }
            },
            totalPartialBalance: {
              $sum: {
                $cond: [{ $eq: ["$payInPaymentStatus", "Partial"] }, "$payInBalance", 0]
              }
            }
          }
        }
      ]);

      const brokerPayInAmount =
        totalAmount.length > 0
          ? totalAmount[0].totalUnpaidAmount + totalAmount[0].totalPartialBalance
          : 0;

      if (brokerPayInAmount > 0) {
        totalPayInAmountSum += brokerPayInAmount;

        brokerSummaries.push({
          brokerId: broker._id,
          brokerName: broker.brokerName,
          totalPayInAmount: brokerPayInAmount,
        });
      }
    }
    res.status(200).json({
      message: "Brokers with unpaid or partial pay-in amounts fetched successfully.",
      data: brokerSummaries,
      totalAmount: totalPayInAmountSum,
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

export const getBrokersWithUnpaidOrPartialPayInAmountAndDateFilter = async (req, res) => {
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
    let totalPayInAmountSum = 0;

    for (const broker of brokers) {
      const policies = await MotorPolicyModel.find({
        brokerId: broker._id,
        isActive: true,
        issueDate: { $gte: start, $lte: end },
      }).select("policyNumber").lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const totalAmount = await MotorPolicyPaymentModel.aggregate([
        {
          $match: {
            policyNumber: { $in: policyNumbers },
            payInPaymentStatus: { $in: ["UnPaid", "Partial"] }
          }
        },
        {
          $group: {
            _id: null,
            totalUnpaidAmount: {
              $sum: {
                $cond: [{ $eq: ["$payInPaymentStatus", "UnPaid"] }, "$payInCommission", 0]
              }
            },
            totalPartialBalance: {
              $sum: {
                $cond: [{ $eq: ["$payInPaymentStatus", "Partial"] }, "$payInBalance", 0]
              }
            }
          }
        }
      ]);

      const brokerPayInAmount =
        totalAmount.length > 0
          ? totalAmount[0].totalUnpaidAmount + totalAmount[0].totalPartialBalance
          : 0;

      if (brokerPayInAmount > 0) {
        totalPayInAmountSum += brokerPayInAmount;

        brokerSummaries.push({
          brokerId: broker._id,
          brokerName: broker.brokerName,
          totalPayInAmount: brokerPayInAmount,
        });
      }
    }
    res.status(200).json({
      message: `Brokers with unpaid or partial pay-in amounts between ${startDate} and ${endDate} fetched successfully.`,
      data: brokerSummaries,
      totalAmount: totalPayInAmountSum,
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

export const getUnpaidAndPartialPayInAmountByCompanyWithDate = async (req, res) => {
  try {
    const { brokerId, startDate, endDate } = req.query;

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

    const broker = await MotorPolicyModel.findOne({ brokerId, isActive: true }).select("broker").lean();
    if (!broker) {
      return res.status(404).json({
        message: `No broker found for brokerId ${brokerId}.`,
        success: false,
        status: "error",
      });
    }

    const companies = await MotorPolicyModel.aggregate([
      {
        $match: {
          brokerId,
          issueDate: { $gte: start, $lte: end },
          isActive: true,
        },
      },
      { $group: { _id: "$companyName" } },
    ]);

    if (companies.length === 0) {
      return res.status(200).json({
        message: `No companies found for brokerId ${brokerId} between ${startDate} and ${endDate}.`,
        data: [],
        totalAmount: 0,
        brokerName: broker.broker,
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
      }).select("policyNumber").lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const payInData = await MotorPolicyPaymentModel.aggregate([
        {
          $match: {
            policyNumber: { $in: policyNumbers },
            payInPaymentStatus: { $in: ["UnPaid", "Partial"] },
          },
        },
        {
          $group: {
            _id: null,
            totalUnpaidCommission: {
              $sum: {
                $cond: [{ $eq: ["$payInPaymentStatus", "UnPaid"] }, "$payInCommission", 0],
              },
            },
            totalPartialBalance: {
              $sum: {
                $cond: [{ $eq: ["$payInPaymentStatus", "Partial"] }, "$payInBalance", 0],
              },
            },
          },
        },
      ]);

      const payInAmount =
        payInData.length > 0
          ? payInData[0].totalUnpaidCommission + payInData[0].totalPartialBalance
          : 0;

      if (payInAmount > 0) {
        totalAmount += payInAmount;
        companySummaries.push({
          companyName: company._id,
          totalPayInAmount: payInAmount,
        });
      }
    }

    res.status(200).json({
      message: `Pay-in Amount for brokerId ${brokerId} by company between ${startDate} and ${endDate} fetched successfully.`,
      brokerName: broker.broker,
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

export const getUnpaidAndPartialPayInAmountByCompany = async (req, res) => {
  try {
    const { brokerId } = req.query;

    const broker = await MotorPolicyModel.findOne({ brokerId, isActive: true }).select("broker").lean();
    if (!broker) {
      return res.status(404).json({
        message: `No broker found for brokerId ${brokerId}.`,
        success: false,
        status: "error",
      });
    }

    const companies = await MotorPolicyModel.aggregate([
      { $match: { brokerId, isActive: true } },
      { $group: { _id: "$companyName" } },
    ]);

    if (companies.length === 0) {
      return res.status(200).json({
        message: `No companies found for brokerId ${brokerId}.`,
        data: [],
        totalAmount: 0,
        brokerName: broker.broker,
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
      }).select("policyNumber").lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const payInData = await MotorPolicyPaymentModel.aggregate([
        {
          $match: {
            policyNumber: { $in: policyNumbers },
            payInPaymentStatus: { $in: ["UnPaid", "Partial"] },
          },
        },
        {
          $group: {
            _id: null,
            totalUnpaidCommission: {
              $sum: {
                $cond: [{ $eq: ["$payInPaymentStatus", "UnPaid"] }, "$payInCommission", 0],
              },
            },
            totalPartialBalance: {
              $sum: {
                $cond: [{ $eq: ["$payInPaymentStatus", "Partial"] }, "$payInBalance", 0],
              },
            },
          },
        },
      ]);

      const payInAmount =
        payInData.length > 0
          ? payInData[0].totalUnpaidCommission + payInData[0].totalPartialBalance
          : 0;

      if (payInAmount > 0) {
        totalAmount += payInAmount;
        companySummaries.push({
          companyName: company._id,
          totalPayInAmount: payInAmount,
        });
      }
    }

    res.status(200).json({
      message: `Pay-in Amount for brokerId ${brokerId} by company fetched successfully.`,
      brokerName: broker.broker,
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


// brokerBalance

export const getBrokerBalanceForAllBrokers = async (req, res) => {
  try {
    const brokers = await MotorPolicyModel.aggregate([
      { $group: { _id: "$brokerId", brokerName: { $first: "$broker" } } },
    ]);

    if (brokers.length === 0) {
      return res.status(200).json({
        message: "No brokers found.",
        data: [],
        totalBalance: 0,
        success: true,
        status: "success",
      });
    }

    const brokerSummaries = [];
    let totalBalance = 0;

    for (const broker of brokers) {
      const policies = await MotorPolicyModel.find({
        brokerId: broker._id,
        isActive: true,
      }).select("policyNumber").lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const balanceData = await MotorPolicyPaymentModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers } } },
        {
          $group: {
            _id: null,
            totalBalance: { $sum: "$brokerBalance" },
          },
        },
      ]);

      const brokerBalance = balanceData.length > 0 ? balanceData[0].totalBalance : 0;

      if (brokerBalance > 0) {
        totalBalance += brokerBalance;
        brokerSummaries.push({
          brokerId: broker._id,
          brokerName: broker.brokerName,
          brokerBalance,
        });
      }
    }

    res.status(200).json({
      message: "Broker balances fetched successfully.",
      data: brokerSummaries,
      totalBalance,
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

export const getBrokerBalanceWithDateFilter = async (req, res) => {
  try {
    const { startDate, endDate, brokerId } = req.query;

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

    const brokerMatch = brokerId ? { brokerId, isActive: true } : { isActive: true };

    const brokers = await MotorPolicyModel.aggregate([
      { $match: { ...brokerMatch, issueDate: { $gte: start, $lte: end } } },
      { $group: { _id: "$brokerId", brokerName: { $first: "$broker" } } },
    ]);

    if (brokers.length === 0) {
      return res.status(200).json({
        message: `No brokers found between ${startDate} and ${endDate}.`,
        data: [],
        totalBalance: 0,
        success: true,
        status: "success",
      });
    }

    const brokerSummaries = [];
    let totalBalance = 0;

    for (const broker of brokers) {
      const policies = await MotorPolicyModel.find({
        brokerId: broker._id,
        isActive: true,
        issueDate: { $gte: start, $lte: end },
      }).select("policyNumber").lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const balanceData = await MotorPolicyPaymentModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers } } },
        {
          $group: {
            _id: null,
            totalBalance: { $sum: "$brokerBalance" },
          },
        },
      ]);

      const brokerBalance = balanceData.length > 0 ? balanceData[0].totalBalance : 0;

      if (brokerBalance > 0) {
        totalBalance += brokerBalance;
        brokerSummaries.push({
          brokerId: broker._id,
          brokerName: broker.brokerName,
          brokerBalance,
        });
      }
    }

    res.status(200).json({
      message: `Broker balances between ${startDate} and ${endDate} fetched successfully.`,
      data: brokerSummaries,
      totalBalance,
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

export const getBrokerBalanceByBrokerAndCompany = async (req, res) => {
  try {
    const { brokerId } = req.query;

    if (!brokerId) {
      return res.status(400).json({
        message: "Please provide brokerId.",
        success: false,
        status: "error",
      });
    }

    const broker = await MotorPolicyModel.findOne({ brokerId, isActive: true }).select("broker").lean();

    if (!broker) {
      return res.status(200).json({
        message: `No broker found for brokerId ${brokerId}.`,
        data: [],
        totalBalance: 0,
        success: true,
        status: "success",
      });
    }

    const companies = await MotorPolicyModel.aggregate([
      { $match: { brokerId, isActive: true } },
      { $group: { _id: "$companyName" } },
    ]);

    if (companies.length === 0) {
      return res.status(200).json({
        message: `No companies found for brokerId ${brokerId}.`,
        data: [],
        totalBalance: 0,
        success: true,
        status: "success",
      });
    }

    const companySummaries = [];
    let totalBalance = 0;

    for (const company of companies) {
      const policies = await MotorPolicyModel.find({
        brokerId,
        companyName: company._id,
        isActive: true,
      }).select("policyNumber").lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const balanceData = await MotorPolicyPaymentModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers } } },
        {
          $group: {
            _id: null,
            totalBalance: { $sum: "$brokerBalance" },
          },
        },
      ]);

      const brokerBalance = balanceData.length > 0 ? balanceData[0].totalBalance : 0;

      if (brokerBalance > 0) {
        totalBalance += brokerBalance;
        companySummaries.push({
          companyName: company._id,
          brokerBalance,
        });
      }
    }

    res.status(200).json({
      message: `Broker balances for brokerId ${brokerId} by company fetched successfully.`,
      data: companySummaries,
      totalBalance,
      brokerName: broker.broker,
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

export const getBrokerBalanceByBrokerAndCompanyWithDateFilter = async (req, res) => {
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

    const broker = await MotorPolicyModel.findOne({ brokerId, isActive: true }).select("broker").lean();

    if (!broker) {
      return res.status(200).json({
        message: `No broker found for brokerId ${brokerId}.`,
        data: [],
        totalBalance: 0,
        success: true,
        status: "success",
      });
    }

    const companies = await MotorPolicyModel.aggregate([
      {
        $match: {
          brokerId,
          issueDate: { $gte: start, $lte: end },
          isActive: true,
        },
      },
      { $group: { _id: "$companyName" } },
    ]);

    if (companies.length === 0) {
      return res.status(200).json({
        message: `No companies found for brokerId ${brokerId} between ${startDate} and ${endDate}.`,
        data: [],
        brokerName: broker.broker,
        totalBalance: 0,
        success: true,
        status: "success",
      });
    }

    const companySummaries = [];
    let totalBalance = 0;

    for (const company of companies) {
      const policies = await MotorPolicyModel.find({
        brokerId,
        companyName: company._id,
        isActive: true,
        issueDate: { $gte: start, $lte: end },
      }).select("policyNumber").lean();

      const policyNumbers = policies.map((policy) => policy.policyNumber);

      const balanceData = await MotorPolicyPaymentModel.aggregate([
        { $match: { policyNumber: { $in: policyNumbers } } },
        {
          $group: {
            _id: null,
            totalBalance: { $sum: "$brokerBalance" },
          },
        },
      ]);

      const brokerBalance = balanceData.length > 0 ? balanceData[0].totalBalance : 0;

      if (brokerBalance > 0) {
        totalBalance += brokerBalance;
        companySummaries.push({
          companyName: company._id,
          brokerBalance,
        });
      }
    }

    res.status(200).json({
      message: `Broker balances for brokerId ${brokerId} by company between ${startDate} and ${endDate} fetched successfully.`,
      data: companySummaries,
      totalBalance,
      brokerName: broker.broker,
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
