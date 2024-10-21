import BookingRequest from "../../models/bookingModel/bookingRequestSchema.js";
import leadGenerateModel from "../../models/partnerModels/leadGenerateSchema.js";
export const getOperationDashboardCount = async (req, res) => {
  const { leadCreatedBy } = req.params;

  if (!leadCreatedBy) {
    return res.status(400).json({
      message: "lead Created By is required",
      status: "error",
    });
  }

  const startDate = new Date(req.query.startDate);
  const endDate = new Date(req.query.endDate);
  endDate.setHours(23, 59, 59, 999);

  const dateFilter = {
    $gte: startDate,
    $lte: endDate,
  };

  try {
    // Aggregate lead counts for the specified leadCreatedBy
    const leadCounts = await leadGenerateModel.aggregate([
      { $match: { leadCreatedBy: leadCreatedBy } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    
    const requestedLeads = await leadGenerateModel.aggregate([
      { $match: { status: "Requested" } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    const formattedLeadCounts = {};
    let totalLead = 0;

    leadCounts.forEach((lead) => {
      formattedLeadCounts[lead._id] = lead.count;
      totalLead += lead.count;
    });

    const requestedLeadsCount = requestedLeads.length > 0 ? requestedLeads[0].count : 0;
    totalLead += requestedLeadsCount;

    const leadRequests = {
      "Total Lead": totalLead,
      "Requested Lead": requestedLeadsCount,
    };

    Object.keys(formattedLeadCounts).forEach((key) => {
      leadRequests[`${key.charAt(0).toUpperCase()}${key.slice(1)} Lead`] =
        formattedLeadCounts[key];
    });

    // Aggregate booking requests by status for the specified leadCreatedBy
    const bookingRequestsAggregate = await BookingRequest.aggregate([
      { $match: { bookingCreatedBy: leadCreatedBy } },
      { $group: { _id: "$bookingStatus", count: { $sum: 1 } } },
    ]);

    const totalBookingRequests = bookingRequestsAggregate.reduce(
      (acc, curr) => acc + curr.count,
      0
    );

    const formattedBookingRequests = bookingRequestsAggregate.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      },
      {}
    );

    const data = {
      message: "Operation dashboard counts retrieved successfully",
      data: [
        {
          leadCounts: {
            ...leadRequests,
          },
          bookingRequests: {
            "Total Booking": totalBookingRequests,
            "Accepted Booking": formattedBookingRequests["accepted"] || 0,
            "Requested Booking": formattedBookingRequests["requested"] || 0,
            "Booked Booking": formattedBookingRequests["booked"] || 0,
          },
        },
      ],
      status: "success",
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving operation dashboard counts",
      error: error.message,
    });
  }
};
