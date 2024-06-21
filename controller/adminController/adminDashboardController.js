import UserProfileModel from '../../models/userProfileSchema.js';
import MotorPolicyModel from '../../models/motorpolicySchema.js';

// Controller function to count users by role
export const countUsersByRole = async (req, res) => {
  try {
    // Aggregate user counts by role
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

    // Format user counts
    const formattedRoleCounts = {};
    roleCounts.forEach(role => {
      formattedRoleCounts[role._id] = role.count;
    });

    // Aggregate policy counts by category
    const policyCounts = await MotorPolicyModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    // Format policy counts
    const formattedPolicyCounts = {};
    policyCounts.forEach(policy => {
      formattedPolicyCounts[policy._id] = policy.count;
    });

    // Combine results
    const data = {
      userCounts: formattedRoleCounts,
      policyCounts: formattedPolicyCounts,
    };

    res.status(200).json({
      message: 'User counts by role and policy counts by category retrieved successfully',
      data,
      status: 'success',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error counting users by role and policies',
      error: error.message,
    });
  }
};
