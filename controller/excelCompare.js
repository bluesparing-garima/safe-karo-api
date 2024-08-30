import XLSX from 'xlsx';
import MotorPolicy from '../models/policyModel/motorpolicySchema.js';
import MotorPolicyPayment from '../models/policyModel/motorPolicyPaymentSchema.js';
import UserProfile from "../models/adminModels/userProfileSchema.js";
import moment from 'moment';

// excel compare for broker
export const compareBrokerExcel = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        // Set up date filtering if provided
        const dateQuery = {};
        if (startDate && endDate) {
            dateQuery.createdOn = {
                $gte: moment(startDate).startOf('day').toDate(),
                $lte: moment(endDate).endOf('day').toDate()
            };
        }

        // Parse the uploaded Excel file
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Extract broker name from the first row of the Excel sheet
        const brokerName = worksheet[0]?.broker?.trim() || 'Unknown Broker';

        const comparisonResults = [];

        // Iterate over each row in the Excel file
        for (const row of worksheet) {
            const { policyNumber, payInCommission, broker } = row;

            const policyData = await MotorPolicy.findOne({
                policyNumber: policyNumber.trim(),
                broker: broker.trim(),
                ...dateQuery
            }).lean();

            if (policyData) {
                const paymentData = await MotorPolicyPayment.findOne({
                    policyNumber: policyData.policyNumber
                }).lean();

                if (paymentData) {
                    const result = {
                        policyNumber: policyData.policyNumber,
                        db_payInCommission: paymentData.payInCommission,
                        excel_payInCommission: payInCommission
                    };

                    comparisonResults.push(result);
                }
            }
        }

        // Include the broker's name in the response
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
    const { startDate, endDate } = req.body;

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

    const partnerCode = worksheet[0]?.partnerCode?.trim() || 'Unknown Partner';
    console.log('Extracted partnerCode:', partnerCode);

    const userProfile = await UserProfile.findOne({ partnerId: partnerCode }).lean();
    if (!userProfile) {
      return res.status(404).json({
        message: 'Partner not found.',
        status: 'Error'
      });
    }

    const partnerId = userProfile._id;
    console.log('Retrieved partnerId (ObjectId):', partnerId);

    const comparisonResults = [];

    for (const row of worksheet) {
      const { policyNumber, payOutCommission } = row;

      const policyData = await MotorPolicy.findOne({
        policyNumber: policyNumber.trim(),
        partnerId: partnerId,
        ...dateQuery
      }).lean();

      if (policyData) {
        const paymentData = await MotorPolicyPayment.findOne({
          policyNumber: policyData.policyNumber
        }).lean();

        if (paymentData) {
          const result = {
            policyNumber: policyData.policyNumber,
            partnerName: policyData.partnerName,
            db_payOutCommission: paymentData.payOutCommission,
            excel_payOutCommission: payOutCommission
          };

          comparisonResults.push(result);
        }
      }
    }

    res.status(200).json({
      message: 'File uploaded and data processed successfully.',
      partnerName: comparisonResults[0]?.partnerName || 'Unknown Partner',
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

