import cron from 'node-cron';
import mongoose from 'mongoose';
import MotorPolicyModel from '../../models/motorpolicySchema.js';
import PolicyTimerManageModel from '../../models/adminModels/policyTimeManagerSchema.js';

const calculateTimeDifference = (createdDate) => {
  const now = new Date();
  const created = new Date(createdDate);

  let years = now.getFullYear() - created.getFullYear();
  let months = now.getMonth() - created.getMonth();
  let days = now.getDate() - created.getDate();
  let hours = now.getHours() - created.getHours();
  let minutes = now.getMinutes() - created.getMinutes();
  let seconds = now.getSeconds() - created.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes--;
  }
  if (minutes < 0) {
    minutes += 60;
    hours--;
  }
  if (hours < 0) {
    hours += 24;
    days--;
  }
  if (days < 0) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonth;
    months--;
  }
  if (months < 0) {
    months += 12;
    years--;
  }

  return `${years}y ${months}m ${days}d ${hours}h ${minutes}m ${seconds}s`;
};

// Schedule the task to run every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  try {
    const policies = await MotorPolicyModel.find();
    for (const policy of policies) {
      const timer = calculateTimeDifference(policy.createdOn);
      const policyTimerManage = await PolicyTimerManageModel.findOne({ policyId: policy._id });

      if (policyTimerManage) {
        policyTimerManage.timer = timer;
        policyTimerManage.updatedOn = new Date();
        await policyTimerManage.save();
      } else {
        const newPolicyTimerManage = new PolicyTimerManageModel({
          policyId: policy._id,
          createdOn: policy.createdOn,
          timer,
        });
        await newPolicyTimerManage.save();
      }
    }
  } catch (error) {
    console.error('Error updating policy timers:', error);
  }
});

export const getPolicyTimers = async (req, res) => {
  try {
    const policyTimers = await PolicyTimerManageModel.find().populate('policyId');
    res.status(200).json({
      message: "All Policy Timers retrieved successfully.",
      data: policyTimers,
      status: "success"
    });
  } catch (error) {
    console.error('Error retrieving policy timers:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
