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
        : 12,
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
  return Object.entries(periods).map(([key, value]) => ({ [key]: value }));
};

// Get pay-in and pay-out commissions by timeframe
export const getPayInPayOutCommissionsByTimeframe = async (req, res) => {
  const { timeframe } = req.query;

  if (!timeframe) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Timeframe is required.",
    });
  }

  let startDate, endDate, groupBy, mapFormat;
  switch (timeframe) {
    case "week":
      startDate = moment().startOf("week");
      endDate = moment().endOf("week");
      groupBy = { $dayOfWeek: "$policyDate" };
      mapFormat = (key) =>
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][key - 1];
      break;
    case "month":
      startDate = moment().startOf("year");
      endDate = moment().endOf("year");
      groupBy = { $month: "$policyDate" };
      mapFormat = (key) => moment(key, "MM").format("MMM");
      break;
    case "year":
      startDate = moment().startOf("year").subtract(5, "years");
      endDate = moment().endOf("year");
      groupBy = { $year: "$policyDate" };
      mapFormat = (key) => key;
      break;
    default:
      return res.status(400).json({ message: "Invalid timeframe parameter" });
  }

  try {
    // Generate all periods for the given timeframe
    const periods = generatePeriods(startDate, endDate, timeframe);

    // Aggregation pipeline for pay-in commissions
    const pipelinePayIn = [
      {
        $match: {
          policyDate: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        },
      },
      {
        $group: {
          _id: groupBy,
          totalPayInCommission: { $sum: "$payInCommission" },
        },
      },
      { $sort: { _id: 1 } },
    ];

    // Aggregation pipeline for pay-out commissions
    const pipelinePayOut = [
      {
        $match: {
          policyDate: { $gte: startDate.toDate(), $lte: endDate.toDate() },
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

    const [payInData, payOutData] = await Promise.all([
      motorPolicyPayment.aggregate(pipelinePayIn),
      motorPolicyPayment.aggregate(pipelinePayOut),
    ]);

    // Merge results with periods for pay-in commissions
    const payInPeriods = periods.reduce((acc, period) => {
      const key = Object.keys(period)[0];
      acc[key] = period[key];
      return acc;
    }, {});
    payInData.forEach((item) => {
      const key = mapFormat(item._id);
      payInPeriods[key] = item.totalPayInCommission;
    });

    // Merge results with periods for pay-out commissions
    const payOutPeriods = periods.reduce((acc, period) => {
      const key = Object.keys(period)[0];
      acc[key] = period[key];
      return acc;
    }, {});
    payOutData.forEach((item) => {
      const key = mapFormat(item._id);
      payOutPeriods[key] = item.totalPayOutCommission;
    });

    res.status(200).json({
      message: "Pay-in and pay-out commissions retrieved successfully",
      data: {
        payIn: convertPeriodsToArray(payInPeriods),
        payOut: convertPeriodsToArray(payOutPeriods),
      },
      success: true,
      status: "success",
    });
  } catch (error) {
    console.error(
      "Error retrieving pay-in and pay-out commissions:",
      error.message
    );
    res.status(500).json({
      message: "Error retrieving pay-in and pay-out commissions",
      success: false,
      error: error.message,
    });
  }
};

// Get all user counts by timeframe
export const getAllUserCountsByTimeframe = async (req, res) => {
  const { timeframe } = req.query;

  if (!timeframe) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Timeframe is required.",
    });
  }

  let startDate, endDate, groupBy, format, mapFormat;
  switch (timeframe) {
    case "week":
      startDate = moment().startOf("week");
      endDate = moment().endOf("week");
      groupBy = { $dayOfWeek: "$policyDate" };
      format = "d";
      mapFormat = (key) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[key - 1];
      };
      break;
    case "month":
      startDate = moment().startOf("year");
      endDate = moment().endOf("year");
      groupBy = { $month: "$policyDate" };
      format = "MM";
      mapFormat = (key) => moment(key, "MM").format("MMM");
      break;
    case "year":
      startDate = moment().startOf("year").subtract(5, "years");
      endDate = moment().endOf("year");
      groupBy = { $year: "$policyDate" };
      format = "YYYY";
      mapFormat = (key) => key;
      break;
    default:
      return res.status(400).json({ message: "Invalid timeframe parameter" });
  }

  try {
    // Generate all periods for the given timeframe
    const periods = generatePeriods(startDate, endDate, timeframe);

    // Aggregation pipeline
    const pipeline = [
      {
        $match: {
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

    const userCounts = await motorPolicyPayment.aggregate(pipeline);

    // Merge results with periods
    const mergedPeriods = {};
    periods.forEach((period) => {
      const key = Object.keys(period)[0];
      mergedPeriods[key] = period[key];
    });
    userCounts.forEach((item) => {
      const key = item._id;
      const mappedKey = mapFormat(key);
      mergedPeriods[mappedKey] = item.count;
    });

    res.status(200).json({
      message: "User counts retrieved successfully",
      data: convertPeriodsToArray(mergedPeriods),
      success: true,
      status: "success",
    });
  } catch (error) {
    console.error("Error retrieving user counts:", error.message);
    res.status(500).json({
      message: "Error retrieving user counts",
      success: false,
      error: error.message,
    });
  }
};
