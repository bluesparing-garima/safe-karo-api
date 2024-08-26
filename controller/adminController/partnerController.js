import mongoose from 'mongoose';
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import moment from "moment";
import bcrypt from "bcryptjs";
import UserProfileModel from "../../models/adminModels/userProfileSchema.js";
import UserModel from "../../models/userSchema.js";

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Helper function to generate Partner ID
const generatePartnerId = async () => {
  const lastUser = await UserProfileModel.findOne().sort({ _id: -1 }).exec();
  let newPartnerId = "8717A1";
  if (lastUser && lastUser.partnerId) {
    const lastPartnerId = lastUser.partnerId;
    const prefix = lastPartnerId.slice(0, 4);
    const suffix = lastPartnerId.slice(4);
    const letter = suffix[0];
    let number = parseInt(suffix.slice(1), 10);
    let newLetter = letter;
    number++;
    if (number > 999) {
      number = 1;
      newLetter = String.fromCharCode(letter.charCodeAt(0) + 1);
    }
    newPartnerId = `${prefix}${newLetter}${number}`;
  }
  return newPartnerId;
};

const requiredFields = ["fullName", "email", "password"];
const dataFilePath = path.join(process.cwd(), "data", "partner_data.json");
const hashFilePath = path.join(process.cwd(), "data", "partner_hashes.json");

// Ensure the data directory exists
if (!fs.existsSync(path.join(process.cwd(), "data"))) {
  fs.mkdirSync(path.join(process.cwd(), "data"));
}

// Function to compute hash of file data
const computeHash = (data) => {
  return crypto.createHash("md5").update(data).digest("hex");
};

// Upload Partner Excel Data
export const uploadPartnerExcel = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
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

    // Check if the file has already been uploaded
    if (storedHashes.includes(fileHash)) {
      return res.status(400).json({ message: "File has already been uploaded." });
    }

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: true });

    const extractedData = worksheet.map((row) => ({
      role: row.role || "",
      branchName: row.branchName || "",
      fullName: row.fullName || row["Full Name"] || "",
      phoneNumber: row.phoneNumber || "",
      email: row.email || "",
      password: row.password || "",
      headRM: row.headRM || "",
      headRMId: row.headRMId || "",
      dateOfBirth: row.dateOfBirth || "0",
      gender: row.gender || "",
      address: row.address || " ",
      pincode: row.pincode || "",
      bankName: row.bankName || row["Bank Name"] || " ",
      IFSC: row.IFSC || "",
      accountHolderName: row.accountHolderName || "",
      accountNumber: row.accountNumber || "",
      salary: row.salary || "",
      partnerId: row.partnerId || row["Partner Id"] || "",
    }));

    const missingFields = [];

    for (const record of extractedData) {
      const missing = requiredFields.filter((field) => !record[field]);

      if (missing.length > 0) {
        missingFields.push({ record, missing });
      } else {
        const hashedPassword = await hashPassword(record.password);

        const userProfile = new UserProfileModel({
          role: record.role,
          branchName: record.branchName,
          fullName: record.fullName,
          phoneNumber: record.phoneNumber,
          email: record.email,
          password: hashedPassword,
          originalPassword: record.password,
          dateOfBirth: record.dateOfBirth,
          gender: record.gender,
          headRM: record.headRM,
          headRMId: record.headRMId,
          address: record.address || "",
          pincode: record.pincode || "",
          bankName: record.bankName || "",
          IFSC: record.IFSC || "",
          accountHolderName: record.accountHolderName || "",
          accountNumber: record.accountNumber || "",
          salary: record.salary,
          document: record.document || [],
          createdBy: record.createdBy,
          isActive: record.isActive !== undefined ? record.isActive : true,
          partnerId: record.partnerId || (await generatePartnerId()),
        });

        const newUser = new UserModel({
          name: record.fullName,
          email: record.email,
          password: hashedPassword,
          originalPassword: record.password,
          phoneNumber: record.phoneNumber,
          role: record.role,
          isActive: record.isActive !== undefined ? record.isActive : true,
          partnerId: userProfile._id,
          partnerCode: record.partnerId || (await generatePartnerId()),
        });

        await userProfile.save({ session });
        await newUser.save({ session });
      }
    }

    // Save hashes to avoid re-uploading the same file
    storedHashes.push(fileHash);
    fs.writeFileSync(hashFilePath, JSON.stringify(storedHashes, null, 2));

    if (missingFields.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Some records have missing fields",
        missingFields,
        status: "error",
      });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Partners created successfully from Excel",
      status: "success",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ message: "Error processing Excel file", error: error.message });
  }
};

// Create a new partner
export const createPartner = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      fullName,
      phoneNumber,
      email,
      password,
      dateOfBirth = "",
      gender,
      address = "",
      pincode = "",
      bankName = "",
      IFSC = "",
      accountHolderName = "",
      accountNumber = "",
      wallet,
      joiningDate = "",
      document = "",
      role = "Partner",
      createdBy = "Admin",
      isActive = true,
    } = req.body;

    if (!password || !fullName || !phoneNumber || !email || !gender || !wallet) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Missing required fields for partner creation" });
    }

    const formattedDateOfBirth = moment(dateOfBirth, "DD MM YYYY").toDate();
    const formattedJoiningDate = moment(joiningDate, "DD MMM YYYY").toDate();

    const hashedPassword = await hashPassword(password);

    const userProfile = new UserProfileModel({
      fullName,
      phoneNumber,
      email,
      password: hashedPassword,
      dateOfBirth: formattedDateOfBirth,
      gender,
      address,
      pincode,
      bankName,
      IFSC,
      accountHolderName,
      accountNumber,
      document,
      joiningDate: formattedJoiningDate,
      createdBy,
      isActive: isActive !== undefined ? isActive : true,
      partnerId: await generatePartnerId(),
      originalPassword: password,
      role,
    });

    const newUser = new UserModel({
      name: fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      isActive: isActive !== undefined ? isActive : true,
      partnerId: userProfile._id,
      partnerCode: userProfile.partnerId,
    });

    await userProfile.save({ session });
    await newUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Partner created successfully",
      data: userProfile,
      status: "success",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Error creating partner", error: error.message });
  }
};

// Get all partners
export const getAllPartners = async (req, res) => {
  try {
    const partners = await UserModel.find({ partnerId: { $exists: true } });
    res.status(200).json({
      message: "Partners retrieved successfully.",
      data: partners,
      status: "Success",
    });
  } catch (error) {
    console.error("Error retrieving partners:", error);
    res
      .status(500)
      .json({ message: "Error retrieving partners", error: error.message });
  }
};

// Get a partner by ID
export const getPartnerById = async (req, res) => {
  try {
    const partner = await UserModel.findById(req.params.id);
    if (!partner || !partner.partnerId) {
      return res.status(404).json({ message: "Partner not found" });
    }
    res.status(200).json({
      message: "Partner retrieved successfully",
      data: partner,
      status: "success",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving partner", error: error.message });
  }
};

// Update a partner by ID
export const updatePartner = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const updateData = req.body;

    // Fetch the current partner document
    const currentPartner = await UserModel.findById(id).session(session);
    if (!currentPartner) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Partner not found" });
    }

    // Update the partner document
    const updatedPartner = await UserModel.findByIdAndUpdate(id, updateData, { new: true, session });
    if (!updatedPartner) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Partner update failed" });
    }

    // Optionally, update related documents if needed
    // Example:
    // const updatedProfile = await UserProfileModel.findOneAndUpdate(
    //   { partnerId: updatedPartner.partnerId },
    //   { $set: updateData },
    //   { new: true, session }
    // );

    // If any update fails, abort the transaction
    // Uncomment the lines above and ensure that related document updates are handled similarly

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Partner updated successfully",
      data: updatedPartner,
      status: "success",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating partner:", error);
    res.status(500).json({
      message: "Error updating partner",
      error: error.message,
    });
  }
};

// Delete (deactivate) a partner by ID
export const deletePartner = async (req, res) => {
  try {
    const deletedPartner = await UserModel.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!deletedPartner || !deletedPartner.partnerId) {
      return res.status(404).json({ message: "Partner not found" });
    }
    res.status(200).json({
      message: "Partner deactivated successfully",
      data: deletedPartner,
      status: "success",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deactivating partner", error: error.message });
  }
};
