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

// Get policy count for partner by week, month, year-wise
export const getMotorPolicyCountsByPolicyCompletedBy = async (req, res) => {
  const { policyCompletedBy, timeframe, specifiedYear, specifiedMonth, specifiedWeek } = req.query;

  if (!policyCompletedBy || !timeframe) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Policy Completed By and timeframe are required.",
    });
  }

  let startDate, endDate, groupBy, format, mapFormat;
  
  switch (timeframe) {
    case "week":
      if (specifiedYear && specifiedWeek) {
        startDate = moment().year(specifiedYear).week(specifiedWeek).startOf('week');
        endDate = moment().year(specifiedYear).week(specifiedWeek).endOf('week');
      } else {
        startDate = moment().startOf("week");
        endDate = moment().endOf("week");
      }
      groupBy = { $dayOfWeek: "$issueDate" };
      format = "d";
      mapFormat = (key) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[key - 1];
      };
      break;
    case "month":
      if (specifiedYear && specifiedMonth) {
        startDate = moment().year(specifiedYear).month(specifiedMonth - 1).startOf('month');
        endDate = moment().year(specifiedYear).month(specifiedMonth - 1).endOf('month');
      } else {
        startDate = moment().startOf("month");
        endDate = moment().endOf("month");
      }
      groupBy = { $dateToString: { format: "%m", date: "$issueDate" } };
      format = "MM";
      mapFormat = (key) => moment(key, "MM").format("MMM");
      break;
    case "year":
      // Dynamic range of years
      const minYear = await motorPolicy.aggregate([
        { $group: { _id: null, minYear: { $min: { $year: "$issueDate" } } } }
      ]);
      const maxYear = await motorPolicy.aggregate([
        { $group: { _id: null, maxYear: { $max: { $year: "$issueDate" } } } }
      ]);

      const startYear = minYear[0]?.minYear || moment().year();
      const endYear = maxYear[0]?.maxYear || moment().year();
      
      startDate = moment().year(startYear).startOf('year');
      endDate = moment().year(endYear).endOf('year');
      groupBy = { $dateToString: { format: "%Y", date: "$issueDate" } };
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
          issueDate: {
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

    const policyCounts = await motorPolicy.aggregate(pipeline);

    // Merge results with periods
    const result = periods.map(period => {
      const key = Object.keys(period)[0];
      const item = policyCounts.find((item) => mapFormat(item._id) === key);
      return { [key]: item ? item.count : 0 };
    });

    res.status(200).json({
      message: "Motor policy counts retrieved successfully",
      data: result,
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
