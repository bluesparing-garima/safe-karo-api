import jwt from "jsonwebtoken";
import UserModel from "../models/userSchema.js";
import { generateAccessToken } from "./userController.js";

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh Token not found" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
    const user = await UserModel.findById(decoded.userID);

    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({
      accessToken: newAccessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    res.status(403).json({ message: "Invalid Refresh Token" });
  }
};

export default refreshAccessToken ;
