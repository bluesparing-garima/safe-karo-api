import XLSX from 'xlsx';
import MotorPolicy from '../models/policyModel/motorpolicySchema.js';
import MotorPolicyPayment from '../models/policyModel/motorPolicyPaymentSchema.js';
import UserProfile from "../models/adminModels/userProfileSchema.js";
import Broker from "../models/adminModels/brokerSchema.js"; 
import moment from 'moment';

// excel compare for broker
export const compareBrokerExcel = async (req, res) => {
  try {
    const { startDate, endDate, brokerId } = req.body;

    if (!brokerId) {
      return res.status(400).json({
        message: 'BrokerId is required.',
        status: 'Error'
      });
    }

    const dateQuery = {};
    if (startDate && endDate) {
      dateQuery.createdOn = {
        $gte: moment(startDate).startOf('day').toDate(),
        $lte: moment(endDate).endOf('day').toDate()
      };
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const brokerData = await Broker.findOne({ _id: brokerId }).lean();
    if (!brokerData) {
      return res.status(404).json({
        message: 'Broker not found.',
        status: 'Error'
      });
    }
    const brokerName = brokerData.brokerName || 'Unknown Broker';

    const comparisonResults = [];

    for (const row of worksheet) {
      const { policyNumber, payInCommission } = row;

      const policyData = await MotorPolicy.findOne({
        policyNumber: policyNumber.trim(),
        brokerId: brokerId,
        ...dateQuery
      }).lean();

      if (policyData) {
        const paymentData = await MotorPolicyPayment.findOne({
          policyNumber: policyData.policyNumber
        }).lean();

        if (paymentData) {
          const difference = paymentData.payInCommission - payInCommission;

          const result = {
            policyNumber: policyData.policyNumber,
            db_payInCommission: paymentData.payInCommission,
            excel_payInCommission: payInCommission,
            difference: difference,
            hasDifference: difference !== 0 ? 'Yes' : 'No'
          };

          comparisonResults.push(result);
        }
      }
    }

    res.status(200).json({
      message: 'File uploaded and data processed successfully.',
      brokerName: brokerName,
      data: comparisonResults,
      status: 'Success'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'An error occurred while processing the file.',
      error: error.message,
      status: 'Error'
    });
  }
};


export const comparePartnerExcel = async (req, res) => {
  try {
    const { startDate, endDate, partnerCode } = req.body;

    if (!partnerCode) {
      return res.status(400).json({
        message: 'PartnerCode is required.',
        status: 'Error'
      });
    }

    const dateQuery = {};
    if (startDate && endDate) {
      dateQuery.createdOn = {
        $gte: moment(startDate).startOf('day').toDate(),
        $lte: moment(endDate).endOf('day').toDate()
      };
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const userProfile = await UserProfile.findOne({ partnerId: partnerCode }).lean();
    if (!userProfile) {
      return res.status(404).json({
        message: 'Partner not found.',
        status: 'Error'
      });
    }
    const partnerId = userProfile._id;
    const partnerName = userProfile.fullName || 'Unknown Partner';

    const comparisonResults = [];

    for (const row of worksheet) {
      const { policyNumber, payOutCommission } = row;

      const policyData = await MotorPolicy.findOne({
        policyNumber: policyNumber,
        ...dateQuery
      }).lean();

      if (policyData) {
        const paymentData = await MotorPolicyPayment.findOne({
          policyNumber: policyData.policyNumber
        }).lean();

        if (paymentData) {
          const difference = paymentData.payOutCommission - payOutCommission;

          const result = {
            policyNumber: policyData.policyNumber,
            partnerName: policyData.partnerName,
            db_payOutCommission: paymentData.payOutCommission,
            excel_payOutCommission: payOutCommission,
            difference: difference,
            hasDifference: difference !== 0 ? 'Yes' : 'No'
          };

          comparisonResults.push(result);
        }
      }
    }

    res.status(200).json({
      message: 'File uploaded and data processed successfully.',
      partnerName: partnerName,
      data: comparisonResults,
      status: 'Success'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'An error occurred while processing the file.',
      error: error.message,
      status: 'Error'
    });
  }
};


