import motorPolicyPayment from "../../models/policyModel/motorPolicyPaymentSchema.js";
import motorPolicy from "../../models/policyModel/motorpolicySchema.js";
import moment from "moment";

// Get data by timeframe and broker
export const getDataByTimeframeAndBroker = async (req, res) => {
    const { timeframe, broker } = req.query;
  
    if (!timeframe) {
      return res.status(400).json({
        status: "error",
        success: false,
        message: "Timeframe is required.",
      });
    }
  
    if (!broker) {
      return res.status(400).json({
        status: "error",
        success: false,
        message: "Broker is required.",
      });
    }
  
    let startDate, endDate, groupBy, mapFormat;
    switch (timeframe) {
      case "week":
        startDate = moment().startOf("week");
        endDate = moment().endOf("week");
        groupBy = { $dayOfWeek: "$issueData" };
        mapFormat = (key) => {
          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          return days[key - 1];
        };
        break;
      case "month":
        startDate = moment().startOf("year");
        endDate = moment().endOf("year");
        groupBy = { $month: "$issueData" };
        mapFormat = (key) => moment(key, "MM").format("MMM");
        break;
      case "year":
        startDate = moment().startOf("year").subtract(5, "years");
        endDate = moment().endOf("year");
        groupBy = { $year: "$issueData" };
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
            issueData: {
              $gte: startDate.toDate(),
              $lte: endDate.toDate(),
            },
            broker: broker,
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
  
      const userCounts = await motorPolicy.aggregate(pipeline);
  
      // Merge results with periods
      const mergedPeriods = {};
      periods.forEach(period => {
        const key = Object.keys(period)[0];
        mergedPeriods[key] = period[key];
      });
      userCounts.forEach((item) => {
        const key = item._id;
        const mappedKey = mapFormat(key);
        mergedPeriods[mappedKey] = item.count;
      });
  
      res.status(200).json({
        message: "Data retrieved successfully",
        data: convertPeriodsToArray(mergedPeriods),
        success: true,
        status: "success",
      });
    } catch (error) {
      console.error("Error retrieving data:", error.message);
      res.status(500).json({
        message: "Error retrieving data",
        success: false,
        error: error.message,
      });
    }
  };