import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/userSchema.js";

const generateAccessToken = (user) => {
  return jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ userID: user._id }, process.env.JWT_REFRESH_SECRET_KEY, {
    expiresIn: "1h",
  });
};

const userRegistration = async (req, res) => {
  const { name, email, password, phoneNumber, partnerId, partnerCode, role, isActive } = req.body; 

  try {
    const user = await UserModel.findOne({ email: email, partnerCode: partnerCode });
    if (user) {
      return res
        .status(400)
        .json({ status: "failed", message: "Email or PartnerCode already exists." });
    }

    if (!name || !email || !password || !partnerId || !phoneNumber || !role) {
      return res
        .status(400)
        .json({ status: "failed", message: "All fields are required" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      name,
      email,
      password: hashPassword,
      phoneNumber,
      role,
      partnerId,
      partnerCode,
      isActive: isActive !== undefined ? isActive : false,
    });

    await newUser.save();

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.status(201).json({
      message: "Registration Success",
      accessToken: accessToken,
      refreshToken: refreshToken,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to Register" });
  }
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