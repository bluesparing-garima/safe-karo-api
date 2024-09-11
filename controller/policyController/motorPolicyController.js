import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import moment from "moment";
import upload from "../../middlewares/uploadMiddleware.js";
import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import MotorPolicyPaymentModel from "../../models/policyModel/motorPolicyPaymentSchema.js";
import BookingRequestModel from "../../models/bookingModel/bookingRequestSchema.js";
import leadModel from "../../models/partnerModels/leadGenerateSchema.js";
import UserProfile from "../../models/adminModels/userProfileSchema.js";

const dataFilePath = path.join(process.cwd(), "data", "motorpolicy_data.json");
const hashFilePath = path.join(
  process.cwd(),
  "data",
  "motorpolicy_hashes.json"
);

if (!fs.existsSync(path.join(process.cwd(), "data"))) {
  fs.mkdirSync(path.join(process.cwd(), "data"));
}

const computeHash = (data) => {
  return crypto.createHash("md5").update(data).digest("hex");
};

function excelDateToFormattedDate(serial) {
  const epoch = new Date(Date.UTC(1899, 11, 30));
  const jsDate = new Date(epoch.getTime() + serial * 86400000);
  return moment(jsDate).format("YYYY-MM-DD");
}

// Upload motor policy data
export const uploadMotorPolicy = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No files were uploaded.");
    }

    const file = req.file;
    const fileHash = computeHash(file.buffer);

    let storedHashes = [];
    if (fs.existsSync(hashFilePath)) {
      const rawHashData = fs.readFileSync(hashFilePath);
      storedHashes = JSON.parse(rawHashData);
    }

    if (storedHashes.includes(fileHash)) {
      return res
        .status(400)
        .json({ message: "File has already been uploaded." });
    }

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      raw: true,
    });

    const extractedData = worksheet.map((row) => {
      const registrationDate =
        typeof row.registrationDate === "number"
          ? excelDateToFormattedDate(row.registrationDate)
          : row.registrationDate;
      const endDate =
        typeof row.endDate === "number"
          ? excelDateToFormattedDate(row.endDate)
          : row.endDate;
      const issueDate =
        typeof row.issueDate === "number"
          ? excelDateToFormattedDate(row.issueDate)
          : row.issueDate;

      return {
        policyType: row.policyType || row["Policy Type"] || "",
        caseType: row.caseType || row["Case Type"] || "",
        category: row.category || row["Category"] || "",
        subCategory:
          row.subCategory || row["SubCategory"] || row["Sub Category"] || "",
        companyName: row.companyName || row["Company Name"] || "",
        broker: row.broker || row["Broker"] || "",
        brokerId: row.brokerId || row["Broker ID"] || "",
        vehicleAge: row.vehicleAge || row["Vehicle Age"] || "",
        make: row.make || row["Make"] || "",
        model: row.model || row["Model"] || "",
        fuelType: row.fuelType || row["Fuel Type"] || "",
        rto: row.rto || row["RTO"] || "",
        vehicleNumber: row.vehicleNumber || row["Vehicle Number"] || "",
        seatingCapacity: row.seatingCapacity || row["Seating Capacity"] || "",
        cc: row.cc || row["CC"] || "",
        ncb: row.ncb || row["NCB"] || "",
        policyNumber: row.policyNumber || row["Policy Number"] || "",
        fullName: row.fullName || row["Full Name"] || "",
        emailId: row.emailId || row["Email ID"] || "",
        phoneNumber: row.phoneNumber || row["Phone Number"] || "",
        mfgYear: row.mfgYear || row["Manufacturing Year"] || "",
        tenure: row.tenure || row["Tenure"] || "",
        registrationDate: registrationDate || "",
        endDate: endDate || "",
        issueDate: issueDate || "",
        idv: row.idv || row["IDV"] || 0,
        od: row.od || row["OD"] || 0,
        tp: row.tp || row["TP"] || 0,
        policyStatus: row.policyStatus || row["Policy Status"] || "",
        netPremium: row.netPremium || row["Net Premium"] || "",
        finalPremium: row.finalPremium || row["Final Premium"] || "",
        paymentMode: row.paymentMode || row["Payment Mode"] || "",
        policyCreatedBy: "partner",
        partnerId: row.partnerId || row["Partner ID"] || "",
        partnerName: row.partnerName || row["Partner Name"] || "",
        relationshipManagerId:
          row.relationshipManagerId || row["Relationship Manager ID"] || "",
        relationshipManagerName:
          row.relationshipManagerName || row["Relationship Manager Name"] || "",
        bookingId: row.bookingId || row["Booking ID"] || "",
        policyCompletedBy:
          row.policyCompletedBy || row["Policy Completed By"] || "",
        paymentDetails: row.paymentDetails || row["Payment Details"] || "",
        productType: row.productType || row["Product Type"] || "",
        rcFront: row.rcFront || row["RC Front"] || "",
        rcBack: row.rcBack || row["RC Back"] || "",
        previousPolicy: row.previousPolicy || row["Previous Policy"] || "",
        survey: row.survey || row["Survey"] || "",
        puc: row.puc || row["PUC"] || "",
        fitness: row.fitness || row["Fitness"] || "",
        proposal: row.proposal || row["Proposal"] || "",
        currentPolicy: row.currentPolicy || row["Current Policy"] || "",
        other: row.other || row["Other"] || "",
        createdBy: "partner",
        updatedBy: null,
        updatedOn: null,
        createdOn: Date.now(),
        weight: row.weight || row["Weight"] || 0,
      };
    });

    for (const data of extractedData) {
      const query = { policyNumber: data.policyNumber };

      const existingRecord = await MotorPolicyModel.findOne(query);

      if (existingRecord) {
        existingRecord.policyStatus = data.policyStatus;
        existingRecord.partnerId = data.partnerId;
        existingRecord.partnerName = data.partnerName;
        existingRecord.relationshipManagerId = data.relationshipManagerId;
        existingRecord.relationshipManagerName = data.relationshipManagerName;
        existingRecord.bookingId = data.bookingId;
        existingRecord.policyCompletedBy = data.policyCompletedBy;
        existingRecord.paymentDetails = data.paymentDetails;
        existingRecord.policyType = data.policyType;
        existingRecord.productType = data.productType || " ";
        existingRecord.caseType = data.caseType;
        existingRecord.category = data.category;
        existingRecord.subCategory = data.subCategory;
        existingRecord.companyName = data.companyName;
        existingRecord.broker = data.broker;
        existingRecord.brokerId = data.brokerId;
        existingRecord.vehicleAge = data.vehicleAge;
        existingRecord.make = data.make;
        existingRecord.model = data.model;
        existingRecord.fuelType = data.fuelType;
        existingRecord.rto = data.rto;
        existingRecord.vehicleNumber = data.vehicleNumber;
        existingRecord.weight = data.weight;
        existingRecord.seatingCapacity = data.seatingCapacity;
        existingRecord.cc = data.cc;
        existingRecord.ncb = data.ncb;
        existingRecord.fullName = data.fullName;
        existingRecord.emailId = data.emailId;
        existingRecord.phoneNumber = data.phoneNumber;
        existingRecord.mfgYear = data.mfgYear;
        existingRecord.tenure = data.tenure;
        existingRecord.registrationDate = data.registrationDate;
        existingRecord.endDate = data.endDate;
        existingRecord.issueDate = data.issueDate;
        existingRecord.idv = data.idv;
        existingRecord.od = data.od;
        existingRecord.tp = data.tp;
        existingRecord.netPremium = data.netPremium;
        existingRecord.finalPremium = data.finalPremium;
        existingRecord.paymentMode = data.paymentMode;
        existingRecord.rcFront = data.rcFront;
        existingRecord.rcBack = data.rcBack;
        existingRecord.previousPolicy = data.previousPolicy;
        existingRecord.survey = data.survey;
        existingRecord.puc = data.puc;
        existingRecord.fitness = data.fitness;
        existingRecord.proposal = data.proposal;
        existingRecord.currentPolicy = data.currentPolicy;
        existingRecord.other = data.other;
        existingRecord.createdBy = "partner";
        existingRecord.createdOn = data.createdOn;
        existingRecord.updatedBy = "";
        existingRecord.updatedOn = new Date();

        await existingRecord.save();

        const paymentRecord = await MotorPolicyPaymentModel.findOne({
          policyId: existingRecord._id,
        });

        if (paymentRecord) {
          paymentRecord.brokerId = existingRecord.brokerId;
          paymentRecord.partnerId = existingRecord.partnerId;
          paymentRecord.policyNumber = existingRecord.policyNumber;
          paymentRecord.bookingId = existingRecord.bookingId;
          paymentRecord.od = existingRecord.od;
          paymentRecord.tp = existingRecord.tp;
          paymentRecord.netPremium = existingRecord.netPremium;
          paymentRecord.finalPremium = existingRecord.finalPremium;
          paymentRecord.payInODPercentage = 0;
          paymentRecord.payInTPPercentage = 0;
          paymentRecord.payInODAmount = 0;
          paymentRecord.payInTPAmount = 0;
          paymentRecord.payOutODPercentage = 0;
          paymentRecord.payOutTPPercentage = 0;
          paymentRecord.payOutODAmount = 0;
          paymentRecord.payOutTPAmount = 0;
          paymentRecord.payInCommission = 0;
          paymentRecord.payOutCommission = 0;
          paymentRecord.policyDate = existingRecord.issueDate;
          paymentRecord.createdBy = existingRecord.createdBy;

          await paymentRecord.save();
        }
      } else {
        const newPolicy = await MotorPolicyModel.create(data);

        const newMotorPolicyPayment = new MotorPolicyPaymentModel({
          partnerId: newPolicy.partnerId,
          policyId: newPolicy._id,
          brokerId: newPolicy.brokerId,
          policyNumber: newPolicy.policyNumber,
          bookingId: newPolicy.bookingId,
          od: newPolicy.od,
          tp: newPolicy.tp,
          netPremium: newPolicy.netPremium,
          finalPremium: newPolicy.finalPremium,
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
          payOutPaymentStatus: "UnPaid",
          payInPaymentStatus: "UnPaid",
          policyDate: newPolicy.issueDate,
          createdBy: newPolicy.createdBy,
        });

        await newMotorPolicyPayment.save();
      }
    }

    storedHashes.push(fileHash);
    fs.writeFileSync(hashFilePath, JSON.stringify(storedHashes));
    res.status(200).json({
      message: "File uploaded and data extracted successfully.",
      data: extractedData,
    });
  } catch (error) {
    console.error("Error occurred while uploading file:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Upload motor policy documents
export const updateMotorPolicyDocument = async (req, res) => {
  try {
    const { policyNumber, currentPolicy } = req.body;

    if (!policyNumber) {
      return res.status(400).json({ message: "Policy number is required." });
    }

    const updateFields = {};

    if (currentPolicy) {
      updateFields.currentPolicy = currentPolicy;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No valid fields to update." });
    }

    updateFields.updatedOn = Date.now();
    if (updatedBy) {
      updateFields.updatedBy = updatedBy;
    }

    const updatedPolicy = await MotorPolicy.findOneAndUpdate(
      { policyNumber },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedPolicy) {
      return res.status(404).json({ message: "Policy not found." });
    }

    res.status(200).json({
      message: "Motor policy document updated successfully.",
      data: updatedPolicy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Upload motor policy documents by excel.
export const updateMotorPolicyFromExcel = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      console.log("No file was uploaded.");
      return res.status(400).json({ message: "No file was uploaded." });
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { raw: true });
    console.log(`Parsed data from sheet: ${JSON.stringify(worksheet)}`);

    const updates = worksheet.map(row => ({
      policyNumber: row.policyNumber || row["Policy Number"] || "",
      currentPolicy: row.currentPolicy?.trim() || row["Current Policy"]?.trim() || "",
    }));

    for (const update of updates) {
      const existingRecord = await MotorPolicyModel.findOne({ policyNumber: update.policyNumber });

      if (existingRecord) {
        existingRecord.currentPolicy = update.currentPolicy || existingRecord.currentPolicy;
        await existingRecord.save();
        console.log(`Updated currentPolicy for record: ${existingRecord.policyNumber}`);
      } else {
        console.log(`No record found with policy number: ${update.policyNumber}`);
      }
    }

    return res.status(200).json({ message: "Motor policies updated successfully." });
  } catch (error) {
    console.error("Error occurred while updating motor policies:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// Update motor policy dates
export const updateMotorPolicyDates = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No files were uploaded.");
    }

    const file = req.file;
    const fileHash = computeHash(file.buffer);

    let storedHashes = [];
    if (fs.existsSync(hashFilePath)) {
      const rawHashData = fs.readFileSync(hashFilePath);
      storedHashes = JSON.parse(rawHashData);
    }

    if (storedHashes.includes(fileHash)) {
      return res
        .status(400)
        .json({ message: "File has already been uploaded." });
    }

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      raw: true,
    });
    const extractedData = worksheet.map((row) => {
      const policyDate =
        typeof row.policyDate === "number"
          ? excelDateToFormattedDate(row.policyDate)
          : row.policyDate;
      const bookingDate =
        typeof row.bookingDate === "number"
          ? excelDateToFormattedDate(row.bookingDate)
          : row.bookingDate;

      return {
        policyNumber: row.policyNumber || row["Policy Number"] || "",
        policyDate: policyDate || "",
        bookingDate: bookingDate || "",
      };
    });

    for (const data of extractedData) {
      const query = { policyNumber: data.policyNumber };

      const existingRecord = await MotorPolicyPaymentModel.findOne(query);
      if (existingRecord) {
        existingRecord.policyDate = data.policyDate;
        existingRecord.bookingDate = data.bookingDate;
        await existingRecord.save();
      } else {
        await MotorPolicyPaymentModel.create(data);
      }
    }

    storedHashes.push(fileHash);
    fs.writeFileSync(hashFilePath, JSON.stringify(storedHashes, null, 2));

    res
      .status(200)
      .json({ message: "Motor policy dates updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Create Motor Policy
export const createMotorPolicy = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No files selected!" });
    }

    const {
      policyStatus,
      partnerId,
      partnerName,
      relationshipManagerId,
      relationshipManagerName,
      bookingId,
      policyCompletedBy,
      paymentDetails,
      policyType,
      caseType,
      category,
      subCategory,
      companyName,
      broker,
      brokerId,
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
      productType,
      createdBy,
      isActive,
    } = req.body;

    const fileDetails = {};
    Object.keys(req.files).forEach((key) => {
      const fileArray = req.files[key];
      if (Array.isArray(fileArray)) {
        fileDetails[key] = fileArray.map(file => file.filename).join(',');
      }
    });

    const formattedIssueDate = new Date(issueDate);

    const newMotorPolicy = new MotorPolicyModel({
      policyStatus,
      partnerId: partnerId || "",
      partnerName: partnerName || "",
      relationshipManagerId: relationshipManagerId || "",
      relationshipManagerName: relationshipManagerName || "",
      paymentDetails: paymentDetails || "",
      bookingId: bookingId || "",
      policyCompletedBy: policyCompletedBy || "",
      policyType,
      caseType,
      category,
      subCategory,
      companyName,
      broker,
      brokerId: brokerId || "",
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
      issueDate: formattedIssueDate,
      idv,
      od,
      tp,
      netPremium,
      finalPremium,
      paymentMode,
      policyCreatedBy,
      ...fileDetails, 
      productType,
      createdBy,
      isActive: isActive !== undefined ? isActive : true,
      updatedBy: null,
      updatedOn: null,
    });

    try {
      const existingMotorPolicy = await MotorPolicyModel.findOne({ policyNumber });
      if (existingMotorPolicy) {
        return res.status(400).json({
          status: "error",
          success: false,
          message: `Motor Policy with ${policyNumber} already exists.`,
        });
      }

      const savedMotorPolicy = await newMotorPolicy.save();

      const newMotorPolicyPayment = new MotorPolicyPaymentModel({
        partnerId: savedMotorPolicy.partnerId,
        policyId: savedMotorPolicy._id,
        brokerId: savedMotorPolicy.brokerId,
        policyNumber: savedMotorPolicy.policyNumber,
        bookingId: savedMotorPolicy.bookingId,
        od: savedMotorPolicy.od,
        tp: savedMotorPolicy.tp,
        netPremium: savedMotorPolicy.netPremium,
        finalPremium: savedMotorPolicy.finalPremium,
        payInODPercentage: savedMotorPolicy.payInODPercentage || 0,
        payInTPPercentage: savedMotorPolicy.payInTPPercentage || 0,
        payInODAmount: savedMotorPolicy.payInODAmount || 0,
        payInTPAmount: savedMotorPolicy.payInTPAmount || 0,
        payOutODPercentage: savedMotorPolicy.payOutODPercentage || 0,
        payOutTPPercentage: savedMotorPolicy.payOutTPPercentage || 0,
        payOutODAmount: savedMotorPolicy.payOutODAmount || 0,
        payOutTPAmount: savedMotorPolicy.payOutTPAmount || 0,
        payInCommission: savedMotorPolicy.payInCommission || 0,
        payOutCommission: savedMotorPolicy.payOutCommission || 0,
        payInAmount: savedMotorPolicy.payInAmount || 0,
        payOutAmount: savedMotorPolicy.payOutAmount || 0,
        payInPaymentStatus: savedMotorPolicy.payInPaymentStatus || "UnPaid",
        payOutPaymentStatus: savedMotorPolicy.payOutPaymentStatus || "UnPaid",
        policyDate: formattedIssueDate,
        createdBy: savedMotorPolicy.createdBy,
      });

      await newMotorPolicyPayment.save();

      const existingBookingRequest = await BookingRequestModel.findOne({
        policyNumber,
      });
      if (existingBookingRequest) {
        existingBookingRequest.bookingStatus = "booked";
        await existingBookingRequest.save();
      }

      return res.status(200).json({
        status: "success",
        success: true,
        message: `Policy Number ${policyNumber} created successfully`,
        data: savedMotorPolicy,
      });
    } catch (err) {
      return res.status(400).json({
        status: "error",
        success: false,
        message: err.message,
      });
    }
  });
};

// Get Motor Policies
export const getMotorPolicies = async (req, res) => {
  try {
    const forms = await MotorPolicyModel.find({ isActive: true }).sort({
      createdOn: -1,
    });

    const totalCount = await MotorPolicyModel.countDocuments({
      isActive: true,
    });

    res.status(200).json({
      message: "All Motor Policies.",
      data: forms,
      success: true,
      status: "success",
      totalCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", success: false, message: error.message });
  }
};

// Get motor policies with date filter.
export const getMotorPoliciesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = Infinity } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Please provide both startDate and endDate.",
        success: false,
        status: "error",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch motor policies in the date range
    const policies = await MotorPolicyModel.find({
      isActive: true,
      issueDate: { $gte: start, $lte: end },
    })
      .sort({ createdOn: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    if (policies.length === 0) {
      return res.status(200).json({
        message: `No motor policies found between ${startDate} and ${endDate}.`,
        data: [],
        success: true,
        status: "success",
        totalCount: 0,
      });
    }

    // Extract unique partnerIds and partnerNames from the policies
    const partnerNames = [...new Set(policies.map(policy => policy.partnerName))];
    const partnerIds = [...new Set(policies.map(policy => policy.partnerId))].filter(
      id => id && id.match(/^[0-9a-fA-F]{24}$/) // Ensure valid ObjectId format
    );

    // Fetch corresponding user profiles
    const userProfiles = await UserProfile.find({
      $or: [
        { fullName: { $in: partnerNames } },
        { _id: { $in: partnerIds } }
      ]
    }).lean();

    // Map userProfiles by fullName and _id
    const profileMap = {};
    userProfiles.forEach(profile => {
      profileMap[profile.fullName] = profile;
      profileMap[profile._id] = profile;
    });

    // Fetch related payments and bookings concurrently
    const policyNumbers = policies.map(policy => policy.policyNumber);

    const payments = await MotorPolicyPaymentModel.find({
      policyNumber: { $in: policyNumbers },
    }).lean();

    const bookings = await BookingRequestModel.find({
      policyNumber: { $in: policyNumbers },
    }).lean();

    const paymentMap = {};
    payments.forEach(payment => {
      paymentMap[payment.policyNumber] = payment;
    });

    const bookingMap = {};
    bookings.forEach(booking => {
      bookingMap[booking.policyNumber] = booking;
    });

    const policiesWithDetails = await Promise.all(policies.map(async (policy) => {
      const payment = paymentMap[policy.policyNumber] || {};
      const userProfile = profileMap[policy.partnerName] || profileMap[policy.partnerId] || {};
      const booking = bookingMap[policy.policyNumber] || {};

      // Initialize brokerTimer and leadTimer as empty
      let brokerTimer = booking.timer || "";
      let leadTimer = "";
      let leadDate = "";

      // If there is a leadId, fetch the lead and its timer
      if (booking.leadId) {
        const lead = await leadModel.findById(booking.leadId).lean();
        if (lead) {
          leadTimer = lead.timer || "";
          leadDate = lead.createdOn || "";
        }
      }

      return {
        ...policy,
        partnerCode: userProfile.partnerId,
        paymentId: payment._id || 0,
        partnerId: payment.partnerId || 0,
        bookingId: payment.bookingId || 0,
        od: payment.od || 0,
        tp: payment.tp || 0,
        payInODPercentage: payment.payInODPercentage || 0,
        payInTPPercentage: payment.payInTPPercentage || 0,
        payInODAmount: payment.payInODAmount || 0,
        payInTPAmount: payment.payInTPAmount || 0,
        payOutODPercentage: payment.payOutODPercentage || 0,
        payOutTPPercentage: payment.payOutTPPercentage || 0,
        payOutODAmount: payment.payOutODAmount || 0,
        payOutTPAmount: payment.payOutTPAmount || 0,
        payInCommission: payment.payInCommission || 0,
        payOutCommission: payment.payOutCommission || 0,
        payInAmount: payment.payInAmount || 0,
        payOutAmount: payment.payOutAmount || 0,
        payInPaymentStatus: payment.payInPaymentStatus || "UnPaid",
        payOutPaymentStatus: payment.payOutPaymentStatus || "UnPaid",
        payInBalance: payment.payInBalance || 0,
        payOutBalance: payment.payOutBalance || 0,
        paymentCreatedBy: payment.createdBy || 0,
        paymentCreatedOn: payment.createdOn || 0,
        paymentUpdatedBy: payment.updatedBy || 0,
        paymentUpdatedOn: payment.updatedOn || 0,
        brokerTimer,
        leadTimer,
        leadDate,
      };
    }));

    res.status(200).json({
      message: `Motor Policies from ${startDate} to ${endDate} with payment and timer details.`,
      data: policiesWithDetails,
      success: true,
      status: "success",
      totalCount: policiesWithDetails.length,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      success: false,
      message: error.message,
    });
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

// Get Motor Policy by Policy Number
export const getMotorPolicyByPolicyNumber = async (req, res) => {
  try {
    const { policyNumber } = req.params;
    const motorPolicy = await MotorPolicyModel.findOne({ policyNumber });

    if (!motorPolicy) {
      return res.status(404).json({
        status: "error",
        success: false,
        message: `No Motor Policy found with policy number ${policyNumber}.`,
      });
    }

    return res.status(200).json({
      status: "success",
      success: true,
      message: `Motor Policy details retrieved successfully`,
      data: motorPolicy,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: err.message,
    });
  }
};

// Get Motor Policy by Vehicle Number
export const getMotorPolicyByVehicleNumber = async (req, res) => {
  try {
    const { vehicleNumber } = req.params;
    const motorPolicy = await MotorPolicyModel.findOne({ vehicleNumber });

    if (!motorPolicy) {
      return res.status(404).json({
        status: "error",
        success: false,
        message: `No Motor Policy found with vehicle number ${vehicleNumber}.`,
      });
    }

    return res.status(200).json({
      status: "success",
      success: true,
      message: `Motor Policy details retrieved successfully`,
      data: motorPolicy,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: err.message,
    });
  }
};

// Get motor policy by policyId
export const getMotorPolicyByPolicyId = async (req, res) => {
  try {
    const { policyId } = req.params;

    // Find the motor policy by policyId
    const policy = await MotorPolicyModel.findById(policyId);

    if (!policy) {
      return res.status(404).json({
        message: `No Motor Policy found for policyId ${policyId}`,
        success: false,
        status: "error",
      });
    }

    // Find the corresponding payout details by policyNumber
    const payoutDetails = await MotorPolicyPaymentModel.findOne(
      { policyNumber: policy.policyNumber },
      {
        payOutAmount: 1,
        payOutCommission: 1,
        payOutODPercentage: 1,
        payOutTPPercentage: 1,
        payOutODAmount: 1,
        payOutTPAmount: 1,
        payOutPaymentStatus: 1,
        payOutBalance: 1,
      }
    );

    // Merge policy data with payout details
    const policyWithPayoutDetails = {
      ...policy._doc, // Spread the motor policy data
      ...(payoutDetails?._doc || {}), // Spread the payout details if they exist
      _id: policy._id, // Ensure the _id is from MotorPolicyModel (policyId)
    };

    // Send the response with the correct _id
    res.status(200).json({
      message: "Motor Policy with payout details retrieved successfully.",
      data: policyWithPayoutDetails,
      success: true,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving motor policy",
      success: false,
      error: error.message,
    });
  }
};

// Get MotorPolicy by partnerId
export const getMotorPolicyByPartnerId = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { startDate, endDate, page = 1, limit = Infinity } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Please provide both startDate and endDate.",
        success: false,
        status: "error",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const policies = await MotorPolicyModel.find({
      partnerId,
      isActive: true,
      issueDate: { $gte: start, $lte: end },
    })
      .sort({ createdOn: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    if (policies.length === 0) {
      return res.status(200).json({
        message: `No motor policies found for partner ${partnerId} between ${startDate} and ${endDate}.`,
        data: [],
        success: true,
        status: "success",
        totalCount: 0,
      });
    }

    res.status(200).json({
      message: `Motor Policies from ${startDate} to ${endDate} for partner ${partnerId}.`,
      data: policies,
      success: true,
      status: "success",
      totalCount: policies.length,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      success: false,
      message: error.message,
    });
  }
};



/*export const getMotorPolicyByPartnerId = async (req, res) => {
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
 */
// Get Motor Policy with Payment Details
export const getMotorPolicyWithPaymentDetails = async (req, res) => {
  try {
    const { policyId } = req.params;
    const motorPolicy = await MotorPolicyModel.findById(policyId);
    if (!motorPolicy) {
      return res
        .status(404)
        .json({ message: `Motor Policy with ID ${policyId} not found` });
    }

    const motorPolicyPayments = await MotorPolicyPaymentModel.findOne({
      policyId,
    });

    const combinedData = {
      // motorPolicy,
      // motorPolicyPayments,
      policyType: motorPolicy.policyType,
      caseType: motorPolicy.caseType,
      category: motorPolicy.category,
      subCategory: motorPolicy.subCategory,
      companyName: motorPolicy.companyName,
      broker: motorPolicy.broker,
      brokerId: motorPolicy.brokerId,
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
      rcFront: motorPolicy.rcFront,
      rcBack: motorPolicy.rcBack,
      previousPolicy: motorPolicy.previousPolicy,
      survey: motorPolicy.survey,
      puc: motorPolicy.puc,
      fitness: motorPolicy.fitness,
      proposal: motorPolicy.proposal,
      currentPolicy: motorPolicy.currentPolicy,
      other: motorPolicy.other,
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
      payInAmount: motorPolicyPayments.payInAmount,
      payOutAmount: motorPolicyPayments.payOutAmount,
      payInPaymentStatus: motorPolicyPayments.payInPaymentStatus || " ",
      payOutPaymentStatus: motorPolicyPayments.payOutPaymentStatus || " ",
      payInBalance: motorPolicyPayments.payInBalance,
      payOutBalance: motorPolicyPayments.payOutBalance,
      paymentCreatedBy: motorPolicyPayments.createdBy,
      paymentCreatedOn: motorPolicyPayments.createdOn,
      paymentUpdatedBy: motorPolicyPayments.updatedBy,
      paymentUpdatedOn: motorPolicyPayments.updatedOn,
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

// Get using policyCompletedBy
export const getMotorPolicyByPolicyCompletedBy = async (req, res) => {
  try {
    const { policyCompletedBy } = req.params;
    const { startDate, endDate, page = 1, limit = Infinity } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Please provide both startDate and endDate.",
        success: false,
        status: "error",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const policies = await MotorPolicyModel.find({
      policyCompletedBy,
      isActive: true,
      issueDate: { $gte: start, $lte: end },
    })
      .sort({ createdOn: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    if (policies.length === 0) {
      return res.status(200).json({
        message: `No motor policies found for policyCompletedBy ${policyCompletedBy} between ${startDate} and ${endDate}.`,
        data: [],
        success: true,
        status: "success",
        totalCount: 0,
      });
    }

    res.status(200).json({
      message: `Motor Policies from ${startDate} to ${endDate} for policyCompletedBy ${policyCompletedBy}.`,
      data: policies,
      success: true,
      status: "success",
      totalCount: policies.length,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      success: false,
      message: error.message,
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
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const {
        policyStatus,
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
        brokerId,
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
        productType,
        isActive,
        updatedBy,
      } = req.body;

      let partnerId = req.body.partnerId;

      // If partnerName is provided and partnerId is not, fetch the partnerId based on partnerName
      if (partnerName && !partnerId) {
        const partner = await PartnerModel.findOne({ name: partnerName });
        if (partner) {
          partnerId = partner._id;
        } else {
          return res.status(404).json({
            status: "error",
            message: "Partner not found for the given partnerName",
          });
        }
      }

      const formData = {
        policyStatus,
        partnerId,
        partnerName,
        policyType,
        caseType,
        category,
        subCategory,
        companyName,
        broker,
        brokerId,
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
        relationshipManagerId,
        relationshipManagerName,
        paymentDetails,
        productType,
        isActive: isActive !== undefined ? isActive : true,
        updatedBy: updatedBy || "system",
        updatedOn: new Date(),
      };

      const fileDetails = {};

      if (req.files && Object.keys(req.files).length > 0) {
        Object.keys(req.files).forEach((key) => {
          fileDetails[key] = req.files[key][0].filename;
        });
        Object.assign(formData, fileDetails);
      }

      // Update the MotorPolicyModel with new form data
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

      const {
        policyNumber: updatedPolicyNumber,
        od: updatedOD,
        tp: updatedTP,
        issueDate: updatedIssueDate,
      } = updatedForm;

      const existingPayment = await MotorPolicyPaymentModel.findOne({
        policyNumber: updatedPolicyNumber,
      });

      if (!existingPayment) {
        return res.status(404).json({
          status: "error",
          message: "Motor Policy Payment record not found",
        });
      }

      const {
        payInODPercentage,
        payInTPPercentage,
        payOutODPercentage,
        payOutTPPercentage,
      } = existingPayment;

      // Calculate the dynamic amounts and commissions based on the fetched percentages
      const calculatedPayInODAmount = Math.round(
        (updatedOD * payInODPercentage) / 100
      );
      const calculatedPayInTPAmount = Math.round(
        (updatedTP * payInTPPercentage) / 100
      );
      const payInCommission = Math.round(
        calculatedPayInODAmount + calculatedPayInTPAmount
      );

      const calculatedPayOutODAmount = Math.round(
        (updatedOD * payOutODPercentage) / 100
      );
      const calculatedPayOutTPAmount = Math.round(
        (updatedTP * payOutTPPercentage) / 100
      );
      const payOutCommission = Math.round(
        calculatedPayOutODAmount + calculatedPayOutTPAmount
      );

      // Prepare the updated fields for MotorPolicyPaymentModel
      const updatedPaymentFields = {
        od: updatedOD,
        tp: updatedTP,
        payInODAmount: calculatedPayInODAmount,
        payInTPAmount: calculatedPayInTPAmount,
        payInCommission,
        payOutODAmount: calculatedPayOutODAmount,
        payOutTPAmount: calculatedPayOutTPAmount,
        payOutCommission,
        policyDate: updatedIssueDate,
        partnerId,
        partnerName,
      };
      
      if (typeof isActive !== "undefined") {
        updatedPaymentFields.isActive = isActive;
      }

      const updatedPayment = await MotorPolicyPaymentModel.findOneAndUpdate(
        { policyNumber: updatedPolicyNumber },
        { $set: updatedPaymentFields },
        { new: true }
      );

      if (!updatedPayment) {
        return res.status(404).json({
          status: "error",
          message: "Motor Policy Payment not found for the given policy number",
        });
      }

      res.status(200).json({
        message: `Motor Policy and Payment updated successfully.`,
        updatedForm,
        updatedPayment,
        status: "success",
      });
    } catch (error) {
      console.error("Error updating motor policy:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  });
};

// deactivate Motor Policy by ID
export const deactivateMotorPolicy = async (req, res) => {
  try {
    const policy = await MotorPolicyModel.findById(req.params.id);
    if (!policy) {
      return res
        .status(404)
        .json({ status: "error", message: "Motor Policy not found" });
    }

    const payInPaymentStatus = policy.payInPaymentStatus || "UnPaid";
    const payOutPaymentStatus = policy.payOutPaymentStatus || "UnPaid";

    if (payInPaymentStatus !== "UnPaid" || payOutPaymentStatus !== "UnPaid") {
      return res.status(400).json({
        status: "error",
        message:
          "Cannot deactivate policy: PayIn or PayOut has already been paid.",
      });
    }

    policy.isActive = false;
    await policy.save();

    await MotorPolicyPaymentModel.updateMany(
      { policyId: policy._id },
      { $set: { isActive: false } }
    );

    res.status(200).json({
      status: "success",
      message: "Motor Policy and related payments deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// get inactive policies.
export const getInactiveMotorPolicies = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: "error",
        message: "Start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const inactivePolicies = await MotorPolicyModel.find({
      isActive: false,
      issueDate: { $gte: start, $lte: end },
    });

    if (!inactivePolicies || inactivePolicies.length === 0) {
      return res.status(404).json({
        status: "success",
        message: "No inactive motor policies found in the specified date range",
      });
    }

    res.status(200).json({
      status: "error",
      data: inactivePolicies,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
