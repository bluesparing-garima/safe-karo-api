import motorPolicyPayment from "../../models/policyModel/motorPolicyPaymentSchema.js";
import motorPolicy from "../../models/policyModel/motorpolicySchema.js";
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

// Get payOutCommission by broker
export const getPayOutCommissionByBroker = async (req, res) => {
  const { broker, timeframe, specifiedYear, specifiedMonth, specifiedWeek } = req.query;

  if (!broker || !timeframe) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Broker and timeframe are required.",
    });
  }

  let startDate, endDate, groupBy, mapFormat;
  
  switch (timeframe) {
    case "week":
      if (specifiedYear && specifiedWeek) {
        startDate = moment().year(specifiedYear).week(specifiedWeek).startOf('week');
        endDate = moment().year(specifiedYear).week(specifiedWeek).endOf('week');
      } else {
        startDate = moment().startOf("week");
        endDate = moment().endOf("week");
      }
      groupBy = { $dayOfWeek: "$paymentInfo.policyDate" };
      mapFormat = (key) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][key - 1];
      break;
    case "month":
      if (specifiedYear && specifiedMonth) {
        startDate = moment().year(specifiedYear).month(specifiedMonth - 1).startOf('month');
        endDate = moment().year(specifiedYear).month(specifiedMonth - 1).endOf('month');
      } else {
        startDate = moment().startOf("year").subtract(5, 'years'); // Adjust to start from 5 years before the current year
        endDate = moment().endOf("year");
      }
      groupBy = { $dateToString: { format: "%m", date: "$paymentInfo.policyDate" } };
      mapFormat = (key) => moment(key, "MM").format("MMM");
      break;
    case "year":
      if (specifiedYear) {
        startDate = moment().year(specifiedYear).startOf('year');
        endDate = moment().year(specifiedYear).endOf('year');
      } else {
        startDate = moment().subtract(5, 'years').startOf('year');
        endDate = moment().endOf('year');
      }
      groupBy = { $dateToString: { format: "%Y", date: "$paymentInfo.policyDate" } };
      mapFormat = (key) => key;
      break;
    default:
      return res.status(400).json({ message: "Invalid timeframe parameter" });
  }

  try {
    // Generate all periods for the given timeframe
    const periods = generatePeriods(startDate, endDate, timeframe);

    // Aggregation pipeline with $lookup to join motorPolicy and motorPolicyPayment
    const pipeline = [
      {
        $lookup: {
          from: "motorpolicypayments",
          localField: "policyNumber",
          foreignField: "policyNumber",
          as: "paymentInfo",
        },
      },
      {
        $unwind: "$paymentInfo",
      },
      {
        $match: {
          broker,
          "paymentInfo.policyDate": {
            $gte: startDate.toDate(),
            $lte: endDate.toDate(),
          },
        },
      },
      {
        $group: {
          _id: groupBy,
          totalPayOutCommission: { $sum: "$paymentInfo.payOutCommission" },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const commissionData = await motorPolicy.aggregate(pipeline);

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
