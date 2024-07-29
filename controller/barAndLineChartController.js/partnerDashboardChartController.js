import motorPolicyPayment from "../../models/policyModel/motorPolicyPaymentSchema.js";
import moment from "moment";

// Helper function to generate all periods
const generatePeriods = (startDate, endDate, timeframe) => {
  const periods = [];
  let currentDate = moment(startDate);
  while (currentDate <= moment(endDate)) {
    const key = currentDate.format(
      {
        week: "ddd",
        month: "MMM",
        year: "YYYY",
      }[timeframe]
    );
    periods.push({ [key]: 0 });
    currentDate.add(
      timeframe === "day" || timeframe === "week"
        ? 1
        : timeframe === "month"
        ? 1
        : 1,
      timeframe === "day" || timeframe === "week"
        ? "day"
        : timeframe === "month"
        ? "month"
        : "year"
    );
  }
  return periods;
};


// Helper function to convert periods object to an array
const convertPeriodsToArray = (periods) => {
  return Object.keys(periods).map(key => ({ [key]: periods[key] }));
};

// Get payOutCommission by partner 
export const getPayOutCommissionByPartner = async (req, res) => {
  const { partnerId, timeframe } = req.query;

  if (!partnerId || !timeframe) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Partner ID and timeframe are required.",
    });
  }

  let startDate, endDate, groupBy, mapFormat;
  switch (timeframe) {
    case "week":
      startDate = moment().startOf("week");
      endDate = moment().endOf("week");
      groupBy = { $dayOfWeek: "$policyDate" };
      mapFormat = (key) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][key - 1];
      break;
    case "month":
      startDate = moment().startOf("year");
      endDate = moment().endOf("year");
      groupBy = { $dateToString: { format: "%m", date: "$policyDate" } };
      mapFormat = (key) => moment(key, "MM").format("MMM");
      break;
    case "year":
      startDate = moment().startOf("year");
      endDate = moment().endOf("year");
      groupBy = { $dateToString: { format: "%Y", date: "$policyDate" } };
      mapFormat = (key) => key;
      break;
    default:
      return res.status(400).json({ message: "Invalid timeframe parameter" });
  }

  try {
    const periods = generatePeriods(startDate, endDate, timeframe);

    const pipeline = [
      {
        $match: {
          partnerId,
          policyDate: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate(),
          },
        },
      },
      {
        $group: {
          _id: groupBy,
          totalPayOutCommission: { $sum: "$payOutCommission" },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const commissionData = await motorPolicyPayment.aggregate(pipeline);

    const result = periods.reduce((acc, period) => {
      const key = Object.keys(period)[0];
      const item = commissionData.find((item) => mapFormat(item._id) === key);
      acc[key] = item ? item.totalPayOutCommission : 0;
      return acc;
    }, {});

    res.status(200).json({
      message: "PayOut commissions retrieved successfully",
      data: convertPeriodsToArray(result),
      success: true,
      status: "success",
    });
  } catch (error) {
    console.error("Error retrieving PayOut commissions:", error.message);
    res.status(500).json({
      message: "Error retrieving PayOut commissions",
      success: false,
      error: error.message,
    });
  }
};

// Get policyCount by partner
export const getMotorPolicyCountsByPartner = async (req, res) => {
  const { partnerId, timeframe } = req.query;

  if (!partnerId || !timeframe) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Partner ID and timeframe are required.",
    });
  }

  let startDate, endDate, groupBy, mapFormat;
  switch (timeframe) {
    case "week":
      startDate = moment().startOf("week");
      endDate = moment().endOf("week");
      groupBy = { $dayOfWeek: "$policyDate" };
      mapFormat = (key) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][key - 1];
      break;
    case "month":
      startDate = moment().startOf("year");
      endDate = moment().endOf("year");
      groupBy = { $dateToString: { format: "%m", date: "$policyDate" } };
      mapFormat = (key) => moment(key, "MM").format("MMM");
      break;
    case "year":
      startDate = moment().startOf("year");
      endDate = moment().endOf("year");
      groupBy = { $dateToString: { format: "%Y", date: "$policyDate" } };
      mapFormat = (key) => key;
      break;
    default:
      return res.status(400).json({ message: "Invalid timeframe parameter" });
  }

  try {
    const periods = generatePeriods(startDate, endDate, timeframe);

    const pipeline = [
      {
        $match: {
          partnerId,
          policyDate: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate(),
          },
        },
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const policyCounts = await motorPolicyPayment.aggregate(pipeline);

    const result = periods.reduce((acc, period) => {
      const key = Object.keys(period)[0];
      const item = policyCounts.find((item) => mapFormat(item._id) === key);
      acc[key] = item ? item.count : 0;
      return acc;
    }, {});

    res.status(200).json({
      message: "Motor policy counts retrieved successfully",
      data: convertPeriodsToArray(result),
      success: true,
      status: "success",
    });
  } catch (error) {
    console.error("Error retrieving motor policy counts:", error.message);
    res.status(500).json({
      message: "Error retrieving motor policy counts",
      success: false,
      error: error.message,
    });
  }
};

