import * as XLSX from "xlsx";
import moment from "moment";
import UserProfileModel from "../../models/adminModels/userProfileSchema.js";
import UserModel from "../../models/userSchema.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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
    const prefix = lastPartnerId.slice(0, 4); // "8717"
    const suffix = lastPartnerId.slice(4); // "A1", "A2", ..., "A999", "B1", ...
    const letter = suffix[0]; // "A", "B", ...
    let number = parseInt(suffix.slice(1), 10); // 1, 2, ..., 999

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

// Upload
export const uploadPartnerExcel = async (req, res) => {
  try {
    if (!req.files || !req.files.excel) {
      return res.status(400).send("No files were uploaded.");
    }

    const file = req.files.excel;

    const workbook = XLSX.read(file.data, { type: "buffer" });
    // const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const extractedData = worksheet.map((row) => ({
      role: row.role || "",
      fullName: row.fullName || row["Full Name"] || "",
      phoneNumber: row.phoneNumber || "",
      email: row.email || "", // engine = cc
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
        missingFields.push({
          record,
          missing,
        });
      } else {
        // const formattedJoiningDate = moment(record.joiningDate, 'DD MMM YYYY').toDate();
        //  const formattedDateOfBirth = moment(record.dateOfBirth, 'DD MMM YYYY').toDate();
        const hashedPassword = await hashPassword(record.password);

        const userProfile = new UserProfileModel({
          role: record.role,
          fullName: record.fullName,
          phoneNumber: record.phoneNumber,
          email: record.email,
          password: hashedPassword,
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
          originalPassword: record.password,
        });

        const newUser = new UserModel({
          name: record.fullName,
          email: record.email,
          password: hashedPassword,
          phoneNumber: record.phoneNumber,
          role: record.role,
          isActive: record.isActive !== undefined ? record.isActive : true,
          partnerId: record.partnerId || (await generatePartnerId()),
        });

        await userProfile.save();
        await newUser.save();
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Some records have missing fields",
        missingFields,
        status: "error",
      });
    }

    res.status(201).json({
      message: "Partners created successfully from Excel",
      status: "success",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing Excel file", error: error.message });
  }
};

// Create a new partner
export const createPartner = async (req, res) => {
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

    if (
      !password ||
      !fullName ||
      !phoneNumber ||
      !email ||
      !gender ||
      !wallet
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields for partner creation" });
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
    });

    await userProfile.save();
    await newUser.save();

    res.status(201).json({
      message: "Partner created successfully",
      data: userProfile,
      status: "success",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating partner", error: error.message });
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
  try {
    const updatedPartner = await UserModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedPartner || !updatedPartner.partnerId) {
      return res.status(404).json({ message: "Partner not found" });
    }
    res.status(200).json({
      message: "Partner updated successfully",
      data: updatedPartner,
      status: "success",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating partner", error: error.message });
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
