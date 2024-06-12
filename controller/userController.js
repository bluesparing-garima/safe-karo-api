import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";

const userRegistration = async (req, res) => {
    console.log("RECEIVED event: ", req);
  const { name, email, password, phoneNumber} = req.body;
  try {
    const user = await UserModel.findOne({ email: email });
    if (user) {
      return res
        .status(400)
        .json({ status: "failed", message: "Email already exists" });
    }

    if (!name || !email || !password || !phoneNumber) {
      return res
        .status(400)
        .json({ status: "failed", message: "All fields are required" });
    }

    const salt = await bcrypt.genSalt(10);
    console.log("salt", salt);
    const hashPassword = await bcrypt.hash(password, salt);
    console.log("hashpassword", hashPassword);

    const doc = new UserModel({
      name,
      email,
      password: hashPassword,
    });

    await doc.save();

    const saved_user = await UserModel.findOne({ email: email });
    const token = jwt.sign(
      { userID: saved_user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "5d" }
    );

    res.status(201).json({
      message: "Registration Success",
      token: {token},
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
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to Login" });
  }
};

export { userRegistration, userLogin };
