import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/userSchema.js";

const userRegistration = async (req, res) => {
  const { name, email, password, phoneNumber, role } = req.body; 
  try {
    const user = await UserModel.findOne({ email: email });
    if (user) {
      return res
        .status(400)
        .json({ status: "failed", message: "Email already exists" });
    }

    if (!name || !email || !password || !phoneNumber || !role) {
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
    });

    await newUser.save();

    const saved_user = await UserModel.findOne({ email: email });
    const token = jwt.sign(
      { userID: saved_user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "5d" }
    );

    res.status(201).json({
      message: "Registration Success",
      token: token,
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
      return res
        .status(400)
        .json({ status: "failed", message: "All Fields are Required" });
    }

    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res
        .status(400)
        .json({ status: "failed", message: "You are not a Registered User" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: "failed", message: "Email or Password is not Valid" });
    }

    const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "5d",
    });

    res.json({
      status: "success",
      message: "Login Success",
      token: token,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to Login" });
  }
};

export { userRegistration, userLogin };
