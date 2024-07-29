import motorPolicyPayment from "../../models/policyModel/motorPolicyPaymentSchema.js";
import moment from "moment";

const generatePeriods = (startDate, endDate, timeframe) => {
  const periods = [];
  let currentDate = moment(startDate);
  while (currentDate <= moment(endDate)) {
    const key = currentDate.format(
      {
        day: "ddd",
        week: "ddd",
        month: "MMM",
        year: "YYYY",
      }[timeframe]
    );

    periods.push({ period: key, value: 0 });

    if (timeframe === "day" || timeframe === "week") {
      currentDate.add(1, "day");
    } else if (timeframe === "month") {
      currentDate.add(1, "month");
    } else if (timeframe === "year") {
      currentDate.add(1, "year");
    }
  }
  return periods;
};

// Get payOut commission for partner by week,month,year wise
export const getPayOutCommissionByPartner = async (req, res) => {
  const { partnerId, timeframe } = req.query;

  if (!partnerId || !timeframe) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Partner ID and timeframe are required.",
    });
  }

  let startDate, endDate, groupBy, format, mapFormat;
  switch (timeframe) {
    case "day":
      startDate = moment().startOf("week");
      endDate = moment().endOf("week");
      groupBy = { $dayOfWeek: "$policyDate" };
      format = "d";
      mapFormat = (key) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[key - 1];
      };
      break;
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
      groupBy = { $dateToString: { format: "%m", date: "$policyDate" } };
      format = "MM";
      mapFormat = (key) => moment(key, "MM").format("MMM");
      break;
    case "year":
      startDate = moment().startOf("year");
      endDate = moment().endOf("year");
      groupBy = { $dateToString: { format: "%Y", date: "$policyDate" } };
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
          partnerId,
          policyDate: {
            $gte: moment().startOf("year").toDate(),
            $lte: moment().endOf("year").toDate(),
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

    // Merge results with periods
    const result = periods.reduce((acc, period) => {
      const item = commissionData.find((item) => mapFormat(item._id) === period.period);
      acc[period.period.toLowerCase()] = item ? item.totalPayOutCommission : 0;
      return acc;
    }, {});

    res.status(200).json({
      message: "PayOut commissions retrieved successfully",
      data: [result],
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

// Get policy count for partner by week,month,year wise
export const getMotorPolicyCountsByPartner = async (req, res) => {
  const { partnerId, timeframe } = req.query;

  if (!partnerId || !timeframe) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Partner ID and timeframe are required.",
    });
  }

  let startDate, endDate, groupBy, format, mapFormat;
  switch (timeframe) {
    case "day":
      startDate = moment().startOf("week");
      endDate = moment().endOf("week");
      groupBy = { $dayOfWeek: "$policyDate" };
      format = "d";
      mapFormat = (key) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[key - 1];
      };
      break;
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
      groupBy = { $dateToString: { format: "%m", date: "$policyDate" } };
      format = "MM";
      mapFormat = (key) => moment(key, "MM").format("MMM");
      break;
    case "year":
      startDate = moment().startOf("year");
      endDate = moment().endOf("year");
      groupBy = { $dateToString: { format: "%Y", date: "$policyDate" } };
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
          partnerId,
          policyDate: {
            $gte: moment().startOf("year").toDate(),
            $lte: moment().endOf("year").toDate(),
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

    // Merge results with periods
    const result = periods.reduce((acc, period) => {
      const item = policyCounts.find((item) => mapFormat(item._id) === period.period);
      acc[period.period.toLowerCase()] = item ? item.count : 0;
      return acc;
    }, {});

    res.status(200).json({
      message: "Motor policy counts retrieved successfully",
      data: [result],
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

