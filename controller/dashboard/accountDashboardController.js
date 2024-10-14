import creditAndDebit from "../../models/accountsModels/creditAndDebitSchema.js";
import account from "../../models/accountsModels/accountSchema.js";
import motorPolicy from "../../models/policyModel/motorpolicySchema.js";
import MotorPolicyPaymentModel from "../../models/policyModel/motorPolicyPaymentSchema.js";

export const getAccountDashboard = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        message: "Start and end dates are required",
        status: "error",
      });
    }

    const totalAccounts = await account.countDocuments();

    const totalAmountData = await account.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalAmount = totalAmountData.length > 0 ? Math.round(totalAmountData[0].totalAmount) : 0;

    const accounts = await account.find({}, "accountCode amount");

    const totalCreditCountData = await creditAndDebit.aggregate([
      { $match: { type: "credit" } },
      {
        $group: {
          _id: null,
          totalCreditCount: { $sum: 1 },
        },
      },
    ]);
    const totalCreditCount = totalCreditCountData.length > 0
      ? totalCreditCountData[0].totalCreditCount
      : 0;

    const totalDebitCountData = await creditAndDebit.aggregate([
      { $match: { type: "debit" } },
      {
        $group: {
          _id: null,
          totalDebitCount: { $sum: 1 },
        },
      },
    ]);
    const totalDebitCount = totalDebitCountData.length > 0
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
    const netPremium = netPremiums.length > 0 ? Math.round(netPremiums[0].NetPremium) : 0;
    const finalPremium = netPremiums.length > 0 ? Math.round(netPremiums[0].FinalPremium) : 0;

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

    const totalPayInCommission = commissionSums.length > 0
      ? Math.round(commissionSums[0].totalPayInCommission)
      : 0;
    const totalPayOutCommission = commissionSums.length > 0
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
          accounts: accounts.map((acc) => ({
            accountCode: acc.accountCode,
            amount: Math.round(acc.amount),
          })),
          policyCounts: formattedPolicyCounts,
          transactions: {
            Credit: totalCreditCount,
            Debit: totalDebitCount,
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
