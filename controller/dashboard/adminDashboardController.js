import UserProfileModel from '../../models/userProfileSchema.js';
import MotorPolicyModel from '../../models/motorpolicySchema.js';

// Controller function to count users by role
export const getDashboardCount = async (req, res) => {
  try {
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

    const policyCounts = await MotorPolicyModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const formattedPolicyCounts = {};
    policyCounts.forEach(policy => {
      formattedPolicyCounts[policy._id] = policy.count;
    });

    const data = {
      "message": "Dashboard Count retrieved successfully",
      "data": {
        ...formattedRoleCounts,
        ...formattedPolicyCounts
      },
      "status": "success"
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Something went goes wrong',
      error: error.message,
    });
  }
};
