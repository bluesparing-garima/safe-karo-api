import creditAndDebit from "../../models/accountsModels/creditAndDebitSchema.js";
import account from "../../models/accountsModels/accountSchema.js";
import motorPolicy from "../../models/policyModel/motorpolicySchema.js";
import MotorPolicyPaymentModel from "../../models/policyModel/motorPolicyPaymentSchema.js";

export const getAccountDashboard = async (req, res) => {
  try {
    const totalAccounts = await account.countDocuments();
    const totalAmountData = await account.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    const totalAmount =
      totalAmountData.length > 0
        ? Math.round(totalAmountData[0].totalAmount)
        : 0;

    const accountsData = await account.aggregate([
      {
        $group: {
          _id: "$accountCode",
          totalAmount: { $sum: "$amount" },
          accountId: { $first: "$_id" },
        },
      },
    ]);

    const creditAndDebitData = await creditAndDebit.aggregate([
      {
        $group: {
          _id: "$accountId",
          totalCredits: { $sum: "$credit" },
          totalDebits: { $sum: "$debit" },
        },
      },
    ]);

    const formattedAccounts = {};
    accountsData.forEach((account) => {
      const creditDebit =
        creditAndDebitData.find(
          (cd) => String(cd._id) === String(account.accountId)
        ) || {};

      formattedAccounts[account._id] = {
        amount: Math.round(account.totalAmount),
        accountId: account.accountId,
        totalCredits: creditDebit.totalCredits || 0,
        totalDebits: creditDebit.totalDebits || 0,
      };
    });

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
    const netPremium =
      netPremiums.length > 0 ? Math.round(netPremiums[0].NetPremium) : 0;
    const finalPremium =
      netPremiums.length > 0 ? Math.round(netPremiums[0].FinalPremium) : 0;

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
      commissionSums.length > 0
        ? Math.round(commissionSums[0].totalPayInCommission)
        : 0;
    const totalPayOutCommission =
      commissionSums.length > 0
        ? Math.round(commissionSums[0].totalPayOutCommission)
        : 0;

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

    const data = {
      message: "Account Dashboard data retrieved successfully",
      data: [
        {
          totalAccounts,
          totalAmount,
          accounts: formattedAccounts,
          policyCounts: formattedPolicyCounts,

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
