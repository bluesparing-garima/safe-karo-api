import upload from "../middlewares/uploadMiddleware.js";
import MotorPolicyModel from "../models/policyModel/motorpolicySchema.js";
import BookingRequestModel from "../models/bookingModel/bookingRequestSchema.js";
import MotorPolicyPaymentModel from "../models/policyModel/motorPolicyPaymentSchema.js";

export const createMotorPolicy = async (req, res) => {
  // upload.array('rcback', 10)(req, res, (err) => {

  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files selected!" });
    }

    const {
      policyStatus,
      partnerId,
      partnerName,
      relationshipManagerId,
      relationshipManagerName,
      bookingId,
      paymentDetails,
      policyType,
      caseType,
      category,
      subCategory,
      companyName,
      broker,
      vehicleAge,
      make,
      model,
      fuelType,
      rto,
      vehicleNumber,
      weight,
      seatingCapacity,
      cc,
      ncb,
      policyNumber,
      fullName,
      emailId,
      phoneNumber,
      mfgYear,
      tenure,
      registrationDate,
      endDate,
      issueDate,
      idv,
      od,
      tp,
      netPremium,
      finalPremium,
      paymentMode,
      policyCreatedBy,
      rcFront,
      rcBack,
      survey,
      previosPolicy,
      puc,
      fitness,
      proposal,
      currentPolicy,
      other,
      productType,
      createdBy,
      isActive,
    } = req.body;

    const fileDetails = Object.keys(req.files).reduce((acc, key) => {
      req.files[key].forEach((file) => {
        acc[file.fieldname] = file.filename;
      });
      return acc;
    }, {});

    const newMotorPolicy = new MotorPolicyModel({
      policyStatus,
      partnerId: partnerId || "",
      partnerName: partnerName || "",
      relationshipManagerId: relationshipManagerId || "",
      relationshipManagerName: relationshipManagerName || "",
      paymentDetails: paymentDetails || "",
      bookingId: bookingId || "",
      policyType,
      caseType,
      category,
      subCategory,
      companyName,
      broker,
      vehicleAge,
      make,
      model,
      fuelType,
      rto,
      vehicleNumber,
      seatingCapacity,
      weight,
      cc,
      ncb,
      policyNumber,
      fullName,
      emailId,
      phoneNumber,
      mfgYear,
      tenure,
      registrationDate,
      endDate,
      issueDate,
      idv,
      od,
      tp,
      netPremium,
      finalPremium,
      paymentMode,
      policyCreatedBy,
      ...fileDetails,
      // rcFront,
      // rcBack,
      // survey,
      // previosPolicy,
      // puc,
      // fitness,
      // proposal,
      // currentPolicy,
      // other,
      productType,
      createdBy,
      isActive: isActive !== undefined ? isActive : true, // Set default to true if not provided
      updatedBy: null, // Explicitly set updatedBy to null
      updatedOn: null, // Explicitly set updatedOn to null
    });
    // Check if the policyNumber already exists in MotorPolicy
    const existingMotorPolicy = await MotorPolicyModel.findOne({
      policyNumber,
    });
    if (existingMotorPolicy) {
      return res.status(400).json({
        status: "error",
        success: false,
        message: `Motor Policy with ${policyNumber} already exists.`,
      });
    } else {
      const savedMotorPolicy = await newMotorPolicy.save();

      const newMotorPolicyPayment = new MotorPolicyPaymentModel({
        partnerId: savedMotorPolicy.partnerId,
        policyId: savedMotorPolicy._id,
        policyNumber: savedMotorPolicy.policyNumber,
        bookingId: savedMotorPolicy.bookingId,
        od: savedMotorPolicy.od,
        tp: savedMotorPolicy.tp,
        netPremium: savedMotorPolicy.netPremium,
        finalPremium: savedMotorPolicy.finalPremium,
        payInODPercentage: 0,
        payInTPPercentage: 0,
        payInODAmount: 0,
        payInTPAmount: 0,
        payOutODPercentage: 0,
        payOutTPPercentage: 0,
        payOutODAmount: 0,
        payOutTPAmount: 0,
        payInCommission: 0,
        payOutCommission: 0,
        createdBy: savedMotorPolicy.createdBy,
      });
      //console.log("newMotorPolicyPayment", newMotorPolicyPayment);
      const savedMotorPolicyPayment = await newMotorPolicyPayment.save();
      //console.log("savedMotorPolicyPayment", savedMotorPolicyPayment);
      if (savedMotorPolicy) {
        const existingBookingRequest = await BookingRequestModel.findOne({
          policyNumber,
        });
        if (existingBookingRequest) {
          existingBookingRequest.bookingStatus = "booked";
          await existingBookingRequest.save();

          return res.status(200).json({
            status: "success",
            success: true,
            message: `Policy Number ${policyNumber} booked successfully`,
          });
        } else {
          return res.status(200).json({
            status: "success",
            message: `Policy Number created successfully`,
            data: savedMotorPolicy,
          });
        }
      } else {
        return res.status(400).json({
          status: "error",
          success: true,
          message: `Something went wrong`,
        });
      }
    }
  });
};

export const uploadFilesAndData = (req, res) => {
  // upload.array('rcback', 10)(req, res, (err) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files selected!" });
    }

    const { rcBack, fullName, partnerId, rcFront, email } = req.body;
    if (!fullName || !email || !partnerId) {
      return res.status(400).json({ message: "Name and email are required!" });
    }

    // const fileDetails = Object.keys(req.files).map(key => {
    //     return req.files[key].map(file => ({
    //       fieldname: file.fieldname,
    //       filename: file.filename,
    //       path: file.path
    //     }));
    //   }).flat();

    const fileDetails = Object.keys(req.files).reduce((acc, key) => {
      req.files[key].forEach((file) => {
        acc[file.fieldname] = file.filename;
      });
      return acc;
    }, {});

    res.status(200).json({
      message: "Files and data uploaded successfully!",
      data: {
        fullName,
        email,
        files: fileDetails,
      },
    });
  });
};
