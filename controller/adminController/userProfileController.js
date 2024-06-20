import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserProfileModel from "../../models/userProfileSchema.js";
import UserModel from "../../models/userSchema.js";

// Function to generate Partner ID
const generatePartnerId = async () => {
  const lastUser = await UserProfileModel.findOne({
    partnerId: { $exists: true },
  })
    .sort({ createdOn: -1 })
    .exec();

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
    } else {
      newLetter = letter;
    }

    newPartnerId = `${prefix}${newLetter}${number}`;
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

    const missingFields = [];

    if (!branchName) missingFields.push("branchName");
    if (!role) missingFields.push("role");
    // if (!headRM) missingFields.push('headRM');
    // if (!headRMId) missingFields.push('headRMId');
    if (!fullName) missingFields.push("fullName");
    if (!phoneNumber) missingFields.push("phoneNumber");
    if (!email) missingFields.push("email");
    if (!dateOfBirth) missingFields.push("dateOfBirth");
    if (!gender) missingFields.push("gender");
    if (!address) missingFields.push("address");
    if (!pincode) missingFields.push("pincode");
    if (!bankName) missingFields.push("bankName");
    if (!IFSC) missingFields.push("IFSC");
    if (!accountHolderName) missingFields.push("accountHolderName");
    if (!accountNumber) missingFields.push("accountNumber");
    if (!salary) missingFields.push("salary");
    // if (!document) missingFields.push('document');
    if (!createdBy) missingFields.push("createdBy");
    if (!password) missingFields.push("password");
    if (isActive === undefined) missingFields.push("isActive");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required fields for user profile creation",
        missingFields,
      });
    }
    const existingUserInUserModel = await UserModel.findOne({ email });
    const existingUserInUserProfileModel = await UserProfileModel.findOne({
      email,
    });

    if (existingUserInUserModel || existingUserInUserProfileModel) {
      return res.status(400).json({
        message: "Email already exists",
      });
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
      password,
      isActive: isActive !== undefined ? isActive : true, 
      partnerId: await generatePartnerId(),
    };

    const userProfile = new UserProfileModel(newUser);
    const newTeam = new UserModel({
      name: fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      isActive: isActive !== undefined ? isActive : true, 
    });

    await userProfile.save();
    await newTeam.save();

    res.status(201).json({
      message: "User profile created successfully",
      data: userProfile,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating user profile",
      error: error.message,
    });
  }
};

// check if an email exists
export const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email parameter is required" });
    }

    const existingUserInUserModel = await UserModel.findOne({ email });
    const existingUserInUserProfileModel = await UserProfileModel.findOne({
      email,
    });

    if (existingUserInUserModel || existingUserInUserProfileModel) {
      return res.status(200).json({
        message: "Email already exists",
        emailExists: true,
      });
    } else {
      return res.status(200).json({
        message: "Email does not exist",
        emailExists: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error checking email",
      error: error.message,
    });
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
    const { role } = req.query;
    if (!role) {
      return res.status(400).json({ message: "Role parameter is required" });
    }

    const searchRoles =
      role === "RM" || role === "Relationship Manager"
        ? ["RM", "Relationship Manager"]
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

    const updatedUser = await UserModel.findOneAndUpdate(
      { email: updatedData.email },
      updatedData,
      { new: true }
    );

    if (!updatedProfile && !updatedUser) {
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
