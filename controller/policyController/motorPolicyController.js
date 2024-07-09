import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import BookingRequestModel from "../../models/bookingModel/bookingRequestSchema.js";
import MotorPolicyPaymentModel from "../../models/policyModel/motorPolicyPaymentSchema.js";
import multer from "multer";
import upload from "../../middlewares/uploadMiddleware.js";

// Create Motor Policy
export const createMotorPolicy = async (req, res) => {
  // upload.array('rcback', 10)(req, res, (err) => {
  console.log(req.body);
  console.log("out", req.files);
  upload(req, res, async (err) => {
    console.log("::", req.files);
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

    console.log(req.body);
    const fileDetails = Object.keys(req.files).reduce((acc, key) => {
      req.files[key].forEach((file) => {
        acc[file.fieldname] = file.filename;
      });
      return acc;
    }, {});

    console.log(fileDetails);
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
      fileDetails,
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
      console.log(newMotorPolicy);
      const savedMotorPolicy = await newMotorPolicy.save();
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

// Get Motor Policies
export const getMotorPolicies = async (req, res) => {
  // const page = parseInt(req.query.page) || 1;
  // const limit = parseInt(req.query.limit) || 20;
  // const skip = (page - 1) * limit;

  try {
    const forms = await MotorPolicyModel.find();
    // .sort({ createdAt: -1 })
    // .skip(skip)
    // .limit(limit);

    const totalCount = await MotorPolicyModel.countDocuments({
      isActive: true,
    });

    res.status(200).json({
      message: "All Motor Policies.",
      data: forms,
      success: true,
      status: "success",
      // totalCount,
      // totalPages: Math.ceil(totalCount / limit),
      // currentPage: page
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", success: false, message: error.message });
  }
};

// Check Vehicle Number exist or not.
export const validateVehicleNumber = async (req, res) => {
  try {
    const { vehicleNumber } = req.query;
    const vehicleNumberExists = await MotorPolicyModel.exists({
      vehicleNumber,
    });
    if (vehicleNumberExists) {
      return res.status(200).json({
        message: `Vehicle number already exists`,
        exist: true,
        status: "success",
      });
    } else {
      return res.status(200).json({
        message: `Vehicle number does not exist`,
        exist: false,
        status: "success",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error checking policy number",
      error: error.message,
    });
  }
};

// Get motorpolicy by policyId
export const getMotorPolicyByPolicyId = async (req, res) => {
  try {
    const { policyId } = req.params;
    const policies = await MotorPolicyModel.findById({ _id: policyId });

    if (policies.length === 0) {
      return res.status(404).json({
        message: `No Motor Policy for policyId ${policyId}`,
        success: false,
        status: "success",
      });
    }

    res.status(200).json({
      message: "Motor Policies retrieved successfully.",
      data: policies,
      success: true,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving motor policies",
      success: false,
      error: error.message,
    });
  }
};

// Get MotorPolicy by partnerId
export const getMotorPolicyByPartnerId = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const policies = await MotorPolicyModel.find({ partnerId });

    if (policies.length === 0) {
      return res.status(404).json({
        message: `No Motor Policy for partnerId ${partnerId}`,
        success: false,
        status: "success",
      });
    }

    res.status(200).json({
      message: "Motor Policies retrieved successfully.",
      data: policies,
      success: true,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving motor policies",
      success: false,
      error: error.message,
    });
  }
};

// Get Motor Policy with Payment Details
export const getMotorPolicyWithPaymentDetails = async (req, res) => {
  try {
    const { policyId } = req.params;
    // const policyWithPaymentDetails = await MotorPolicyModel.aggregate([
    //   {
    //     $match: { _id: mongoose.Types.ObjectId.policyId },
    //   },
    //   {
    //     $lookup: {
    //       from: 'motorPolicyPayments', // Collection name for MotorPolicyPaymentModel
    //     localField: '_id',
    //   foreignField: 'policyId',
    //   as: 'payments',
    //     },
    //   },
    // ]);
    const motorPolicy = await MotorPolicyModel.findById(policyId);
    if (!motorPolicy) {
      return res
        .status(404)
        .json({ message: `Motor Policy with ID ${policyId} not found` });
    }

    // Find motor policy payments by policyId
    const motorPolicyPayments = await MotorPolicyPaymentModel.findOne({
      policyId,
    });

    // Combine motor policy and payments into a single response
    const combinedData = {
      // motorPolicy,
      // motorPolicyPayments,
      policyType: motorPolicy.policyType,
      caseType: motorPolicy.caseType,
      category: motorPolicy.category,
      subCategory: motorPolicy.subCategory,
      companyName: motorPolicy.companyName,
      broker: motorPolicy.broker,
      vehicleAge: motorPolicy.vehicleAge,
      make: motorPolicy.make,
      model: motorPolicy.model,
      fuelType: motorPolicy.fuelType,
      rto: motorPolicy.rto,
      vehicleNumber: motorPolicy.vehicleNumber,
      seatingCapacity: motorPolicy.seatingCapacity,
      weight: motorPolicy.weight,
      cc: motorPolicy.cc,
      ncb: motorPolicy.ncb,
      policyNumber: motorPolicy.policyNumber,
      fullName: motorPolicy.fullName,
      emailId: motorPolicy.emailId,
      phoneNumber: motorPolicy.phoneNumber,
      mfgYear: motorPolicy.mfgYear,
      tenure: motorPolicy.tenure,
      registrationDate: motorPolicy.registrationDate,
      endDate: motorPolicy.endDate,
      issueDate: motorPolicy.issueDate,
      idv: motorPolicy.idv,
      od: motorPolicy.od,
      tp: motorPolicy.tp,
      policyStatus: motorPolicy.policyStatus,
      netPremium: motorPolicy.netPremium,
      finalPremium: motorPolicy.finalPremium,
      paymentMode: motorPolicy.paymentMode,
      policyCreatedBy: motorPolicy.policyCreatedBy,
      partnerId: motorPolicy.partnerId,
      partnerName: motorPolicy.partnerName,
      relationshipManagerId: motorPolicy.relationshipManagerId,
      relationshipManagerName: motorPolicy.relationshipManagerName,
      paymentDetails: motorPolicy.paymentDetails,
      productType: motorPolicy.productType,
      documents: motorPolicy.documents,
      createdBy: motorPolicy.createdBy,
      createdOn: motorPolicy.createdOn,
      isActive: motorPolicy.isActive,
      updatedBy: motorPolicy.updatedBy,
      updatedOn: motorPolicy.updatedOn,
      // Add fields from MotorPolicyPaymentModel as needed
      paymentId: motorPolicyPayments._id,
      partnerId: motorPolicyPayments.partnerId,
      policyId: motorPolicyPayments.policyId,
      policyNumber: motorPolicyPayments.policyNumber,
      bookingId: motorPolicyPayments.bookingId,
      od: motorPolicyPayments.od,
      tp: motorPolicyPayments.tp,
      payInODPercentage: motorPolicyPayments.payInODPercentage,
      payInTPPercentage: motorPolicyPayments.payInTPPercentage,
      payInODAmount: motorPolicyPayments.payInODAmount,
      payInTPAmount: motorPolicyPayments.payInTPAmount,
      payOutODPercentage: motorPolicyPayments.payOutODPercentage,
      payOutTPPercentage: motorPolicyPayments.payOutTPPercentage,
      payOutODAmount: motorPolicyPayments.payOutODAmount,
      payOutTPAmount: motorPolicyPayments.payOutTPAmount,
      payInCommission: motorPolicyPayments.payInCommission,
      payOutCommission: motorPolicyPayments.payOutCommission,
      createdBy: motorPolicyPayments.createdBy,
      createdOn: motorPolicyPayments.createdOn,
      updatedBy: motorPolicyPayments.updatedBy,
      updatedOn: motorPolicyPayments.updatedOn,
    };

    if (combinedData.length === 0) {
      return res.status(404).json({
        message: `No Motor Policy found for policyId ${policyId}`,
        success: true,
        status: "error",
      });
    }

    res.status(200).json({
      message: "Motor Policy with Payment Details retrieved successfully.",
      data: combinedData,
      success: true,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving motor policy with payment details",
      success: false,
      error: error.message,
    });
  }
};

// Check PolicyNumber exist
export const validatePolicyNumber = async (req, res) => {
  try {
    const { policyNumber } = req.query;
    const policyExists = await MotorPolicyModel.exists({ policyNumber });
    if (policyExists) {
      return res.status(200).json({
        message: `Policy number already exists`,
        exist: true,
        status: "success",
      });
    } else {
      return res.status(200).json({
        message: `Policy number does not exist`,
        exist: false,
        status: "success",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error checking policy number",
      error: error.message,
    });
  }
};

// Update Motor Policy by ID
export const updateMotorPolicy = async (req, res) => {
  const {
    policyStatus,
    partnerId,
    partnerName,
    relationshipManagerId,
    relationshipManagerName,
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
    isActive,
    updatedBy,
  } = req.body;

  const formData = {
    policyStatus,
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
    relationshipManagerId,
    relationshipManagerName,
    paymentDetails,
    isActive: isActive !== undefined ? isActive : true,
    updatedBy: updatedBy || "system",
    updatedOn: new Date(),
  };

  // Check if partnerId and partnerName are provided in the request body
  if (partnerId !== undefined) {
    formData.partnerId = partnerId;
  }
  if (partnerName !== undefined) {
    formData.partnerName = partnerName;
  }

  try {
    const updatedForm = await MotorPolicyModel.findByIdAndUpdate(
      req.params.id,
      formData,
      { new: true, runValidators: true }
    );

    if (!updatedForm) {
      return res
        .status(404)
        .json({ status: "error", message: "Motor Policy not found" });
    }

    res.status(200).json({
      message: `Motor Policy with ID ${req.params.id} updated successfully`,
      data: updatedForm,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating motor policy:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Delete Motor Policy by ID
export const deleteMotorPolicy = async (req, res) => {
  try {
    const deletedForm = await MotorPolicyModel.findByIdAndDelete(req.params.id);
    if (!deletedForm) {
      return res
        .status(404)
        .json({ status: "error", message: "Motor Policy not found" });
    }

    deletedForm.isActive = false;
    await deletedForm.save();

    res.status(200).json({
      status: "success",
      message: "Motor Policy deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
