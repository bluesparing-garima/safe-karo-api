import jwt from "jsonwebtoken";
import UserModel from "../models/userSchema.js";
import CryptoJS from "crypto-js";

const decryptData = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8); 
};

const checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(" ")[1];

      const decryptedToken = decryptData(token);
      if (!decryptedToken) {
        return res.status(401).json({ status: "failed", message: "Invalid Token" });
      }

      const { userID } = jwt.verify(decryptedToken, process.env.JWT_SECRET_KEY);

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
