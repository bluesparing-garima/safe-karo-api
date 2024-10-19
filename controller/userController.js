import UserModel from "../models/userSchema.js";
import UserProfileModel from "../models/adminModels/userProfileSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import upload from "../middlewares/uploadMiddleware.js";

const generatePartnerCode = async (role) => {
  let prefix;

  switch (role.toLowerCase()) {
    case "relationship manager":
    case "rm":
      prefix = "717RM";
      break;
    case "account":
      prefix = "717A";
      break;
    case "booking":
      prefix = "717B";
      break;
    case "operation":
      prefix = "717O";
      break;
    case "hr":
      prefix = "717H";
      break;
    case "partner":
      prefix = "8717A";
      break;
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

  let newPartnerCode;

  if (lastUser && lastUser.partnerId) {
    const suffix = lastUser.partnerId.slice(prefix.length);
    let number = parseInt(suffix, 10);
    number++;
    newPartnerCode = `${prefix}${number}`;
  } else {
    newPartnerCode = `${prefix}1`;
  }

  return newPartnerCode;
};

const generateAccessToken = (user) =>
  jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "3h" });

const generateRefreshToken = (user) =>
  jwt.sign({ userID: user._id }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: "2d" });

const userRegistration = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ status: "failed", message: err.message });

    try {
      const {
        name, email, password, phoneNumber, role, isActive,
        dateOfBirth, gender, branchName, address, pincode, qualification,
        bankProof, experience, other, joiningDate, headRMId, headRM,
        bankName, IFSC, accountHolderName, accountNumber, salary
      } = req.body;

      if (!name || !email || !password || !phoneNumber || !role) {
        return res.status(400).json({ status: "failed", message: "Required fields are missing." });
      }

      if (await UserModel.findOne({ email })) {
        return res.status(400).json({ status: "failed", message: "Email already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const partnerCode = await generatePartnerCode(role);

      const fileDetails = {};
      if (req.files) {
        Object.keys(req.files).forEach((key) => {
          fileDetails[key] = req.files[key][0].filename;
        });
      }

      const userProfile = new UserProfileModel({
        fullName: name,
        email,
        phoneNumber,
        role,
        partnerId: partnerCode,
        isActive: isActive ?? true,
        dateOfBirth,
        gender,
        branchName,
        address,
        pincode,
        profileImage: fileDetails.image,
        adharCardFront: fileDetails.adharCardFront,
        adharCardBack: fileDetails.adharCardBack,
        panCard: fileDetails.panCard,
        qualification,
        bankProof,
        experience,
        other,
        joiningDate,
        headRMId,
        headRM,
        bankName,
        IFSC,
        accountHolderName,
        accountNumber,
        salary,
        originalPassword: password,
      });

      const savedUserProfile = await userProfile.save();

      const user = new UserModel({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        role,
        partnerCode,
        partnerId: savedUserProfile._id,
        isActive: isActive ?? false,
      });

      const savedUser = await user.save();

      const accessToken = generateAccessToken(savedUser);
      const refreshToken = generateRefreshToken(savedUser);

      res.status(201).json({
        message: "Registration Success",
        status: "success",
        user: savedUser,
        userProfile: savedUserProfile,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "failed", message: "Unable to Register", error: error.message });
    }
  });
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ status: "failed", message: "All Fields are Required" });
    }

    const user = await UserModel.findOne({
      $or: [{ email: email }, { partnerCode: email }],
      isActive: true,
    });

    if (!user) {
      return res.status(400).json({
        status: "failed",
        message: "You are not a Registered User or your account is inactive",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: "failed",
        message: "Email / PartnerCode or Password is not Valid",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      status: "success",
      message: "Login Success",
      accessToken: accessToken,
      refreshToken: refreshToken,
      name: user.name,
      email: user.email,
      role: user.role,
      partnerId: user.partnerId,
      partnerCode: user.partnerCode,
      phoneNumber: user.phoneNumber,
      id: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to Login" });
  }
};

// const refreshToken = async (req, res) => {
//   const { refreshToken } = req.body;
//   if (!refreshToken) {
//     return res.status(401).json({ message: "Refresh Token not found" });
//   }

//   try {
//     const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
//     const user = await UserModel.findById(decoded.userID);
//     if (!user) {
//       return res.status(403).json({ message: "User not found" });
//     }

//     const newAccessToken = generateAccessToken(user);
//     res.json({
//       accessToken: newAccessToken,
//       refreshToken: refreshToken,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(403).json({ message: "Invalid Refresh Token" });
//   }
// };

const logout = async (req, res) => {
  res.status(200).json({ message: "Logout successful" });
};

export { userRegistration, userLogin, generateAccessToken, logout };
