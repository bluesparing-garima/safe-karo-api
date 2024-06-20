import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserProfileModel from "../../models/userProfileSchema.js";
import UserModel from "../../models/userSchema.js";

// Function to generate Partner ID
const generatePartnerId = async () => {
  const lastUser = await UserProfileModel.findOne({ partnerId: { $exists: true } })
    .sort({ createdOn: -1 })
    .exec();
  let newPartnerId = "SAFE001";

  if (lastUser && lastUser.partnerId) {
    const lastPartnerId = parseInt(lastUser.partnerId.replace("SAFE", ""), 10);
    const newPartnerIdNumber = lastPartnerId + 1;
    newPartnerId = `SAFE${String(newPartnerIdNumber).padStart(3, "0")}`;
  }
  return newPartnerId;
};

// Function to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Create a new user profile
export const createUserProfile = async (req, res) => {
  try {
    const {
      branchName,
      role,
      headRM,
      headRMId,
      fullName,
      phoneNumber,
      email,
      dateOfBirth,
      gender,
      address,
      pincode,
      bankName,
      IFSC,
      accountHolderName,
      accountNumber,
      salary,
      document,
      createdBy,
      password,
      isActive,
    } = req.body;

    if (
      !branchName ||
      !role ||
      headRMId ||
      headRM ||
      !fullName ||
      !phoneNumber ||
      !email ||
      !dateOfBirth ||
      !gender ||
      !address ||
      !pincode ||
      !bankName ||
      !IFSC ||
      !accountHolderName ||
      !accountNumber ||
      !salary ||
      document ||
      !createdBy ||
      !password ||
    !isActive
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields for user profile creation" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = {
      branchName,
      role,
      headRM,
      headRMId,
      fullName,
      phoneNumber,
      email,
      dateOfBirth,
      gender,
      address,
      pincode,
      bankName,
      IFSC,
      accountHolderName,
      accountNumber,
      salary,
      document,
      createdBy,
      password: hashedPassword,
      isActive: isActive !== undefined ? isActive : true, // Set default value if isActive is not provided
      partnerId: await generatePartnerId(),
    };

    const userProfile = new UserProfileModel(newUser);
    const newTeam = new UserModel({
      name: fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      isActive: isActive !== undefined ? isActive : true, // Set default value true if isActive is not provided
    });

    await userProfile.save();
    await newTeam.save();

    res.status(201).json({
      message: "User profile created successfully",
      data: userProfile,
      status: "success",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user profile", error: error.message });
  }
};

// Get all user profiles
export const getAllUserProfiles = async (req, res) => {
  try {
    const userProfiles = await UserProfileModel.find();
    res.status(200).json({
      message: "User profiles retrieved successfully",
      data: userProfiles,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving user profiles",
      error: error.message,
    });
  }
};

// Get user profiles by role
export const getUserProfilesByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const searchRoles =
      role === "RM" || role === "relationShipManager"
        ? ["RM", "relationShipManager"]
        : [role];
    const userProfiles = await UserProfileModel.find({
      role: { $in: searchRoles },
    });
    res.status(200).json({
      message: "User profiles retrieved successfully",
      data: userProfiles,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving user profiles",
      error: error.message,
    });
  }
};


// Get a user profile by ID
export const getUserProfileById = async (req, res) => {
  try {
    const userProfile = await UserProfileModel.findById(req.params.id);
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }
    res.status(200).json({
      message: "User profile retrieved successfully",
      data: userProfile,
      status: "success",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving user profile", error: error.message });
  }
};

// Update a user profile by ID
export const updateUserProfile = async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    let updatedData = { ...rest };

    if (password) {
      const hashedPassword = await hashPassword(password);
      updatedData.password = hashedPassword;
    }

    const updatedProfile = await UserProfileModel.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }
    res.status(200).json({
      message: "User profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user profile", error: error.message });
  }
};

// Delete (deactivate) a user profile by ID
export const deleteUserProfile = async (req, res) => {
  try {
    const deletedProfile = await UserProfileModel.findByIdAndDelete(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!deletedProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }
    res.status(200).json({
      message: "User profile deactivated successfully",
      data: deletedProfile,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deactivating user profile",
      error: error.message,
    });
  }
};
