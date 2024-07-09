import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/connectdb.js";
import userRoutes from "./routes/userRoutes.js";
// middleware
import {
  requestLogger,
  handleInvalidRoutes,
} from "./middlewares/requestLogger.js";

import assigneeRolesRouters from "./routes/adminRoutes/userRolesRoutes.js";
import policyTypeRoutes from "./routes/adminRoutes/policyTypeRoutes.js";
import caseTypeRoutes from "./routes/adminRoutes/caseTypeRoutes.js";
import addRolesRoutes from "./routes/adminRoutes/rolesRoutes.js";
import payInexcelRoutes from "./routes/adminRoutes/payInExcelRoutes.js";
import payOutExcelRoutes from "./routes/adminRoutes/payOutExcelRoutes.js";
import fileUpload from "express-fileupload";
import payInRoutes from "./routes/adminRoutes/payInRoutes.js";
import vehicleType from "./routes/adminRoutes/productSubTypeRoutes.js";
import partnerRoutes from "./routes/adminRoutes/partnerRoutes.js";
import productName from "./routes/adminRoutes/productRoutes.js";
import company from "./routes/adminRoutes/companyRoutes.js";
import broker from "./routes/adminRoutes/brokerRoutes.js";
import category from "./routes/adminRoutes/categoryRoutes.js";
import fuelType from "./routes/adminRoutes/fuelTypeRoutes.js";
import make from "./routes/adminRoutes/makeRoutes.js";
import model from "./routes/adminRoutes/modelRoutes.js";
import branch from "./routes/adminRoutes/branchRoutes.js";
import userProfile from "./routes/adminRoutes/userProfileRoutes.js";
import payOutRoute from "./routes/adminRoutes/payOutRoutes.js";
import bookingRequestRoute from "./routes/bookingRequestRoutes/bookingRequestRoutes.js";
import adminDashboard from "./routes/dashboardRoutes/adminDashboardRoute.js";
import partnerDashboardRoutes from "./routes/dashboardRoutes/partnerDashboardRoutes.js";
// import policyTimerManageRoutes from './routes/policyTimerManageRoute.js';
import activityLogRoutes from "./routes/adminRoutes/activityLogRoutes.js";

// Motor policy routes
import motorPolicyRoutes from "./routes/policy/motorPolicyRoutes.js";
import motorPolicyPayment from "./routes/policy/motorPolicyPaymentRoutes.js";
// PartnerController Routes.
import leadGenerate from "./routes/partnerRoutes/leadGenerateRoutes.js";
import leadQuotation from "./routes/partnerRoutes/leadQuotationRoutes.js";
import leadPayment from "./routes/partnerRoutes/leadPaymentRoutes.js";
import testRoutes from "./routes/testRoutes.js";

const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATEBASE_URL;

// CORS Policy
app.use(cors());

app.use('/api', testRoutes);

// if deployed successfully
app.get("/", (req, res) => {
  res.send("backend api deployed successfully!!!!!");
});

// Database Connection
connectDB(DATABASE_URL);

// JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    createParentPath: true, // Allow creating parent path if it doesn't exist
  })
);

// Load Routes
app.use("/api/user", userRoutes);

// userProfile
app.use("/api/user-profile", userProfile);

//assignee roles Routes
app.use("/api/user-roles", assigneeRolesRouters);

// motor policy Routes
app.use("/api/policy/motor", motorPolicyRoutes);

// motor policy payment Routes
app.use("/api/policy/motor/payment", motorPolicyPayment);

//create new Policy Routes
app.use("/api/policy-type", policyTypeRoutes);

//create case type Routes
app.use("/api/case-type", caseTypeRoutes);

//add Roles
app.use("/api/roles", addRolesRoutes);

// upload payin excel
app.use("/api/pay-in/excel", payInexcelRoutes);

//upload payout excel
app.use("/api/pay-out/excel", payOutExcelRoutes);

// PayIn Routes
app.use("/api/calculate", payInRoutes);

//PayOut Routes
app.use("/api/calculate", payOutRoute);

// product-type Routes
app.use("/api/product-type", vehicleType);

// Product Name
app.use("/api/product", productName);

// Use the partner routes
app.use("/api/partner", partnerRoutes);

// Company Name's
app.use("/api/company", company);

// Broker
app.use("/api/broker", broker);

// Category
app.use("/api/category", category);

// FuelType
app.use("/api/fuel-type", fuelType);

// Make
app.use("/api/make", make);

// Model
app.use("/api/model", model);

// Branch
app.use("/api/branches", branch);

// lead generate

// Booking request
app.use("/api/booking-request", bookingRequestRoute);

// admin dashboard
app.use("/api/dashboard", adminDashboard);

// partner dashboard
app.use("/api/dashboard", partnerDashboardRoutes);

// timeManager
// app.use('/api/policyTimerManage',policyTimerManageRoutes);

// activity logs
app.use("/api/activityLog", activityLogRoutes);

// ---------------------------------- Lead Routes --------------------------------------//

//Partner lead generate.
app.use("/api/lead-generate", leadGenerate);

// lead Quotation.
app.use("/api/lead-quotation", leadQuotation);

// lead payment.
app.use("/api/lead-payment", leadPayment);

// Handle invalid routes
app.use(handleInvalidRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
