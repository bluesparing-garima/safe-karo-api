import UserProfileModel from '../../models/adminModels/userProfileSchema.js';
import MotorPolicyModel from '../../models/policyModel/motorpolicySchema.js';
import MotorPolicyPaymentModel from '../../models/policyModel/motorPolicyPaymentSchema.js';
import BookingRequest from '../../models/bookingModel/bookingRequestSchema.js';

// Controller function to get dashboard count
export const getDashboardCount = async (req, res) => {
  try {
    // Count users by role
    const roleCounts = await UserProfileModel.aggregate([
      {
        $project: {
          normalizedRole: {
            $switch: {
              branches: [
                { case: { $eq: ['$role', 'RM'] }, then: 'Relationship Manager' },
              ],
              default: '$role'
            }
          }
        }
      },
      { $group: { _id: '$normalizedRole', count: { $sum: 1 } } },
    ]);

    const formattedRoleCounts = {};
    roleCounts.forEach(role => {
      formattedRoleCounts[role._id] = role.count;
    });

    // Count policies by category
    const policyCounts = await MotorPolicyModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      {
        $group: {
          _id: null,
          totalNetPremium: { $sum: '$netPremium' },
          totalFinalPremium: { $sum: '$finalPremium' },
          categories: { $push: { category: '$_id', count: '$count' } },
        },
      },
      {
        $project: {
          _id: 0,
          totalNetPremium: 1,
          totalFinalPremium: 1,
          categories: 1,
        },
      },
    ]);

    const formattedPolicyCounts = {};
    if (policyCounts.length > 0) {
      policyCounts[0].categories.forEach(policy => {
        formattedPolicyCounts[policy.category] = policy.count;
      });
    }

    // Sum payInCommission and payOutCommission
    const commissionSums = await MotorPolicyPaymentModel.aggregate([
      {
        $group: {
          _id: null,
          totalPayInCommission: { $sum: '$payInCommission' },
          totalPayOutCommission: { $sum: '$payOutCommission' },
        },
      },
      {
        $project: {
          _id: 0,
          totalPayInCommission: 1,
          totalPayOutCommission: 1,
        },
      },
    ]);

    // Count booking requests by status
    const bookingCounts = await BookingRequest.aggregate([
      { $group: { _id: '$bookingStatus', count: { $sum: 1 } } },
    ]);

    const formattedBookingCounts = {};
    let totalBookingRequest = 0;
    // bookingCounts.forEach(booking => {
    //   formattedBookingCounts[booking._id] = booking.count;
    //   totalBookingRequest += booking.count;
    // });

    // Prepare final response data
    const data = {
      message: "Dashboard Count retrieved successfully",
      data: {
        ...formattedRoleCounts,
        ...formattedPolicyCounts,
        totalNetPremium: policyCounts.length > 0 ? policyCounts[0].totalNetPremium : 0,
        totalFinalPremium: policyCounts.length > 0 ? policyCounts[0].totalFinalPremium : 0,
        totalPayInCommission: commissionSums.length > 0 ? commissionSums[0].totalPayInCommission : 0,
        totalPayOutCommission: commissionSums.length > 0 ? commissionSums[0].totalPayOutCommission : 0,
        totalBookingRequest,
       // bookingStatusCounts: formattedBookingCounts,
      },
      status: "success"
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Something went wrong',
      error: error.message,
    });
  }
};
