import jwt from "jsonwebtoken";
import UserModel from "../models/userSchema.js";

const checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(" ")[1];

      const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);

      req.user = await UserModel.findById(userID).select("-password");

      if (req.user) {
        next();
      } else {
        res.status(401).json({ status: "failed", message: "Unauthorized User" });
      }
    } catch (error) {
      res.status(401).json({ status: "failed", message: "Invalid Token" });
    }
  } else {
    res.status(401).json({ status: "failed", message: "Unauthorized User, No Token Provided" });
  }
};

export default checkUserAuth;
