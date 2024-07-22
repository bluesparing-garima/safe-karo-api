import creditAndDebit from "../../models/accountsModels/creditAndDebitSchema.js";
import account from "../../models/accountsModels/accountSchema.js";
import motorPolicy from "../../models/policyModel/motorpolicySchema.js";
import MotorPolicyPaymentModel from "../../models/policyModel/motorPolicyPaymentSchema.js";

// Controller function to get account dashboard data
export const getAccountDashboard = async (req, res) => {
  try {
    // Count the number of accounts
    const totalAccounts = await account.countDocuments();

    // Sum the total amount across all accounts
    const totalAmountData = await account.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalAmount =
      totalAmountData.length > 0 ? totalAmountData[0].totalAmount : 0;

    // Get individual accounts and their amounts
    const accounts = await account.find({}, "accountCode amount");

    // Count and sum credit transactions
    const totalCreditCountData = await creditAndDebit.aggregate([
      { $match: { type: "credit" } },
      {
        $group: {
          _id: null,
          totalCreditCount: { $sum: 1 },
        },
      },
    ]);
    const totalCreditCount =
      totalCreditCountData.length > 0
        ? totalCreditCountData[0].totalCreditCount
        : 0;

    // Count and sum debit transactions
    const totalDebitCountData = await creditAndDebit.aggregate([
      { $match: { type: "debit" } },
      {
        $group: {
          _id: null,
          totalDebitCount: { $sum: 1 },
        },
      },
    ]);
    const totalDebitCount =
      totalDebitCountData.length > 0
        ? totalDebitCountData[0].totalDebitCount
        : 0;
    const netPremiums = await motorPolicy.aggregate([
      {
        $group: {
          _id: null,
          NetPremium: { $sum: "$netPremium" },
          FinalPremium: { $sum: "$finalPremium" },
        },
      },
      {
        $project: {
          _id: 0,
          NetPremium: 1,
          FinalPremium: 1,
        },
      },
    ]);
    const netPremium = netPremiums.length > 0 ? netPremiums[0].NetPremium : 0;
    const finalPremium =
      netPremiums.length > 0 ? netPremiums[0].FinalPremium : 0;

    // Sum payInCommission and payOutCommission
    const commissionSums = await MotorPolicyPaymentModel.aggregate([
      {
        $group: {
          _id: null,
          totalPayInCommission: { $sum: "$payInCommission" },
          totalPayOutCommission: { $sum: "$payOutCommission" },
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

    const totalPayInCommission =
      commissionSums.length > 0 ? commissionSums[0].totalPayInCommission : 0;
    const totalPayOutCommission =
      commissionSums.length > 0 ? commissionSums[0].totalPayOutCommission : 0;

       // Count policies by category and calculate net and final premiums
       const policyCounts = await motorPolicy.aggregate([
        {
          $group: {
            _id: {
              $toLower: "$category",
            },
            count: { $sum: 1 },
          },
        },
      ]);
      const formattedPolicyCounts = {};
      policyCounts.forEach((policy) => {
        formattedPolicyCounts[policy._id] = policy.count;
      });

    // Prepare final response data
    const data = {
      message: "Account Dashboard data retrieved successfully",
      data: [
        {
          totalAccounts,
          totalAmount,
          accounts: accounts.map((acc) => ({
            accountCode: acc.accountCode,
            amount: acc.amount,
          })),
          policyCounts: formattedPolicyCounts,
          transactions:{
            "Credit":totalCreditCount,
            "Debit":totalDebitCount,
          },
          premiums: {
            "Net Premium": netPremium,
            "Final Premium": finalPremium,
          },
          commissions: {
            "PayIn Commission": totalPayInCommission,
            "PayOut Commission": totalPayOutCommission,
          },
        },
      ],
      status: "success",
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
      status: "error",
    });
  }
};
