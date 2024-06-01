import express from "express";
const router = express.Router();
import { userRegistration, userLogin } from "../controller/userController.js";
// import checkUserAuth from "../middlewares/auth-middleware.js";

// ROute Level Middleware - To Protect Route
// router.use("/changepassword", checkUserAuth);
// router.use("/loggeduser", checkUserAuth);

// Public Routes
router.post("/register", userRegistration);
router.post("/login", userLogin);
// router.post('/', )
// router.post(
//   "/send-reset-password-email",
//   UserController.sendUserPasswordResetEmail
// );
// router.post("/reset-password/:id/:token", UserController.userPasswordReset);

// // Protected Routes
// router.post("/changepassword", UserController.changeUserPassword);
// router.get("/loggeduser", UserController.loggedUser);

export default router;
