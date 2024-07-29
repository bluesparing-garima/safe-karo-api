import motorPolicy from "../../models/policyModel/motorpolicySchema.js";
import moment from "moment";

// Helper function to generate all periods
const generatePeriods = (startDate, endDate, timeframe) => {
  const periods = {};
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

    periods[key] = 0;

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

// Helper function to convert periods object to an array
const convertPeriodsToArray = (periods) => {
  const result = [];
  for (const key in periods) {
    if (periods.hasOwnProperty(key)) {
      result.push({ [key]: periods[key] });
    }
  }
  return result;
};

// Get policy count for partner by week, month, year-wise
export const getMotorPolicyCountsByPolicyCompletedBy = async (req, res) => {
  const { policyCompletedBy, timeframe } = req.query;

  if (!policyCompletedBy || !timeframe) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Policy Completed By and timeframe are required.",
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
          policyCompletedBy,
          policyDate: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate(),
          },
        },
      }, // Adjust match to include the specified timeframe
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const policyCounts = await motorPolicy.aggregate(pipeline);

    // Merge results with periods
    policyCounts.forEach((item) => {
      const key = item._id;
      const mappedKey = mapFormat(key);
      periods[mappedKey] = item.count;
    });

    const periodsArray = convertPeriodsToArray(periods);

    res.status(200).json({
      message: "Motor policy counts retrieved successfully",
      data: periodsArray,
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
