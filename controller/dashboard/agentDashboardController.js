// controllers/agentDashboardController.js
import MotorPolicyModel from '../../models/policyModel/motorpolicySchema.js';

// Controller function to count policies by partnerId and category
export const getAgentDashboardCount = async (req, res) => {
  const { partnerId } = req.params;

  if (!partnerId) {
    return res.status(400).json({
      message: 'Partner Id is required',
      status: 'error',
    });
  }

  try {
    // Aggregate total count of policies for the specified partnerId
    const totalPolicies = await MotorPolicyModel.countDocuments({ partnerId });

    // Aggregate count of policies by category for the specified partnerId
    const policyCounts = await MotorPolicyModel.aggregate([
      { $match: { partnerId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const formattedCounts = policyCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const responseData = {
      totalPolicies,
      categories: formattedCounts
    };

    res.status(200).json({
      message: 'Policy counts by category for the specified partnerId retrieved successfully',
      data: responseData,
      status: 'success',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error counting policies by category for the specified partnerId',
      error: error.message,
    });
  }
};
