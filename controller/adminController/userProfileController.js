import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserProfileModel from "../../models/adminModels/userProfileSchema.js";
import UserModel from "../../models/userSchema.js";
import upload from "../../middlewares/uploadMiddleware.js";

// Function to generate Partner ID
const generatePartnerId = async (role) => {
  let prefix;

  switch (role) {
    case "Relationship Manager":
    case "RM":
      prefix = "717RM";
      break;
    case "account":
    case "Account":
      prefix = "717A";
      break;
    case "Booking":
    case "booking":
      prefix = "717B";
      break;
    case "Operation":
    case "operation":
      prefix = "717O";
      break;
    case "HR":
      prefix = "717H";
      break;
    case "partner":
    case "Partner":
      prefix = "8717A";
      break;
      case "sale":
      case "Sale":
        prefix = "717S";
        break;
    case "IT":
    case "it":
      prefix = "IT";
      break;
    default:
      throw new Error("Invalid role");
  }

  const lastUser = await UserProfileModel.findOne({
    partnerId: { $regex: `^${prefix}` },
  })
    .sort({ createdOn: -1 })
    .exec();

  let newPartnerId;

  if (lastUser && lastUser.partnerId) {
    const lastPartnerId = lastUser.partnerId;
    const suffix = lastPartnerId.slice(prefix.length);
    let number = parseInt(suffix, 10);

    number++;
    newPartnerId = `${prefix}${number}`;
  } else {
    newPartnerId = `${prefix}1`;
  }

  return newPartnerId;
};

// Function to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Create a new user profile
export const createUserProfile = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No files selected!" });
    }
    try {
      const {
        branchName,
        role,
        headRM,
        headRMId,
        fullName,
        phoneNumber,
        email,
        password,
        dateOfBirth,
        gender,
        address,
        pincode,
        bankName,
        IFSC,
        accountHolderName,
        accountNumber,
        salary,
        joiningDate,
        createdBy,
        isActive,
      } = req.body;

      const fileDetails = Object.keys(req.files).reduce((acc, key) => {
        req.files[key].forEach((file) => {
          acc[file.fieldname] = file.filename;
        });
        return acc;
      }, {});

      const missingFields = [];
      if (!branchName) missingFields.push("branchName");
      if (!role) missingFields.push("role");

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
        return res.status(400).json({ message: "Email already exists" });
      }

      // Generate partner ID based on role
      const partnerId = await generatePartnerId(role);

      const hashedPassword = await hashPassword(password);

      const userProfile = new UserProfileModel({
        branchName,
        role,
        headRM,
        headRMId,
        fullName,
        phoneNumber,
        email,
        password: hashedPassword,
        dateOfBirth,
        gender,
        address,
        pincode,
        bankName,
        IFSC,
        accountHolderName,
        accountNumber,
        salary,
        profileImage: fileDetails.profileImage,
        joiningDate,
        createdBy,
        isActive: isActive !== undefined ? isActive : true,
        partnerId,
        originalPassword: password,
      });

      const newUser = new UserModel({
        name: fullName,
        email,
        password: hashedPassword,
        partnerCode: userProfile.partnerId,
        phoneNumber,
        role,
        isActive: isActive !== undefined ? isActive : true,
        partnerId: userProfile._id,
      });

      await userProfile.save();
      await newUser.save();

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
  });
};

// Check email existence
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
        status: "success",
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
    const userProfile = await UserProfileModel.find();
    res.status(200).json({
      message: "User profiles retrieved successfully",
      data: userProfile,
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

    // Create case-insensitive regular expressions for each role
    const regexRoles = searchRoles.map((r) => new RegExp(`^${r}$`, "i"));

    const userProfile = await UserProfileModel.find({
      role: { $in: regexRoles },
    });

    const transformedUserProfile = userProfile.map((profile) => ({
      ...profile.toObject(),
      role: profile.role.toLowerCase(),
    }));

    res.status(200).json({
      message: "User profiles retrieved successfully",
      data: transformedUserProfile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving user profiles",
      error: error.message,
    });
  }
};

export const getAllUserProfilesByHeadRMId = async (req, res) => {
  try {
    const { headRMId } = req.query;

    if (!headRMId) {
      return res.status(400).json({
        message: "Please provide headRMId in the query.",
        status: "error",
      });
    }

    const userProfiles = await UserProfileModel.find({ headRMId });

    if (userProfiles.length === 0) {
      return res.status(404).json({
        message: `No user profiles found for headRMId ${headRMId}.`,
        data: [],
        status: "success",
      });
    }

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

// Function to get user profiles except roles Partner or Agent
export const getUserProfilesExcludingRoles = async (req, res) => {
  try {
    const excludedRoles = ["partner", "agent"];

    // Create case-insensitive regular expressions for each excluded role
    const regexRoles = excludedRoles.map(
      (role) => new RegExp(`^${role}$`, "i")
    );

    const userProfiles = await UserProfileModel.find({
      role: { $nin: regexRoles },
    }).select("-password -originalPassword"); // Exclude password and originalPassword fields

    const transformedUserProfiles = userProfiles.map((profile) => ({
      teamId: profile._id,
      teamName: profile.fullName,
      ...profile.toObject(),
    }));

    res.status(200).json({
      message: "User profiles retrieved successfully",
      data: transformedUserProfiles,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving user profiles",
      error: error.message,
    });
  }
};

// get user profile by ID
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
    res.status(500).json({
      message: "Error retrieving user profile",
      error: error.message,
    });
  }
};

// Update user profile
export const updateUserProfile = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { password, ...rest } = req.body;
      let updatedData = { ...rest };

      if (password) {
        const hashedPassword = await hashPassword(password);
        updatedData.password = hashedPassword;
        updatedData.originalPassword = password;
      } else {
        const existingProfile = await UserProfileModel.findById(req.params.id);
        if (existingProfile) {
          updatedData.originalPassword = existingProfile.originalPassword;
        }
      }

      let fileDetails = {};
      if (req.files && Object.keys(req.files).length > 0) {
        fileDetails = Object.keys(req.files).reduce((acc, key) => {
          req.files[key].forEach((file) => {
            acc[file.fieldname] = file.filename;
          });
          return acc;
        }, {});
      }

      const updateData = {
        ...updatedData,
        ...fileDetails,
      };

      const updatedProfile = await UserProfileModel.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!updatedProfile) {
        return res.status(404).json({ message: "User profile not found" });
      }

      const userUpdateData = {};
      if (updateData.email) userUpdateData.email = updateData.email;
      if (updateData.phoneNumber)
        userUpdateData.phoneNumber = updateData.phoneNumber;
      if (updateData.password) userUpdateData.password = updateData.password;

      if (Object.keys(userUpdateData).length > 0) {
        const updatedUser = await UserModel.findOneAndUpdate(
          { partnerId: updatedProfile._id },
          userUpdateData,
          { new: true }
        );

        if (!updatedUser) {
          return res
            .status(404)
            .json({ message: "User not found in UserModel" });
        }
      }

      res.status(200).json({
        message: "User profile updated successfully",
        data: updatedProfile,
        originalPassword: updatedProfile.originalPassword,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating user profile",
        error: error.message,
      });
    }
  });
};

// Delete (deactivate) a user profile by ID
export const deleteUserProfile = async (req, res) => {
  try {
    const deletedProfile = await UserProfileModel.findByIdAndUpdate(
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
