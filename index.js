import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/connectdb.js";
import userRoutes from "./routes/userRoutes.js";
import path from "path";
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
import payInRoutes from "./routes/adminRoutes/payInRoutes.js";
import percentageUpdate from "./routes/adminRoutes/percentageUpdateRoute.js";
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
// dashboard routes
import adminDashboard from "./routes/dashboardRoutes/adminDashboardRoute.js";
import partnerDashboardRoutes from "./routes/dashboardRoutes/partnerDashboardRoutes.js";
import bookingDashboardRoutes from "./routes/dashboardRoutes/bookingDashboardRoute.js";
import operationDashboardRoutes from "./routes/dashboardRoutes/operationDashboardRoute.js";
import accountDashboardRoutes from "./routes/dashboardRoutes/accountDashboardRoute.js";

import activityLogRoutes from "./routes/adminRoutes/activityLogRoutes.js";

// Motor policy routes
import motorPolicyRoutes from "./routes/policy/motorPolicyRoutes.js";
import motorPolicyPayment from "./routes/policy/motorPolicyPaymentRoutes.js";
import filterPolicy from "./routes/policy/filterRoutes.js";
// PartnerController Routes.
import leadGenerate from "./routes/partnerRoutes/leadGenerateRoutes.js";
import leadQuotation from "./routes/partnerRoutes/leadQuotationRoutes.js";
import leadPayment from "./routes/partnerRoutes/leadPaymentRoutes.js";

// Accounts
import accountRoute from "./routes/accountRoutes/accountRoute.js";
import creditAndDebit from "./routes/accountRoutes/creditAndDebitRoute.js";
import debitRoute from "./routes/accountRoutes/debitRoute.js";
import accountManage from "./routes/accountRoutes/accountManageRoute.js";
import creditRoute from "./routes/accountRoutes/creditRoute.js";

// Excel Compare
import excelCompare from "./routes/excelCompareRoutes.js";

// Bar and Line chart routes
import partnerChart from "./routes/barAndLineChartRoutes/partnerChartRoutes.js";
import adminChart from "./routes/barAndLineChartRoutes/adminChartRoutes.js";
import bookingChart from "./routes/barAndLineChartRoutes/bookingChartRoutes.js";
import brokerChart from "./routes/barAndLineChartRoutes/brokerChartRoutes.js";

import testRoutes from "./routes/testRoutes.js";

const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATEBASE_URL;

// CORS Policy
app.use(cors());

// Database Connection
connectDB(DATABASE_URL);
// if deployed successfully
app.get("/", (req, res) => {
  res.send("backend api deployed successfully!!!!!");
});

// JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use multer upload middleware where needed, for example:
// app.post("/upload", uploadMiddleware, (req, res) => {
//   res.send("Files uploaded successfully.");
// });

// userProfile
app.use("/api/user-profile", userProfile);

// Booking request
app.use("/api/booking-request", bookingRequestRoute);

// motor policy Routes
app.use("/api/policy/motor", motorPolicyRoutes);

// motor policy payment Routes
app.use("/api/policy/motor/payment", motorPolicyPayment);

// filter policy Routes
app.use("/api/policy/motor/filter", filterPolicy);

//Partner lead generate.
app.use("/api/lead-Generate", leadGenerate);

// lead Quotation.
app.use("/api/lead-quotation", leadQuotation);

// lead payment.
app.use("/api/lead-payment", leadPayment);

// Load Routes
app.use("/api/user", userRoutes);

//assignee roles Routes
app.use("/api/user-roles", assigneeRolesRouters);

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

// percentage Update manually
app.use("/api/policy/motor/commission", percentageUpdate);

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


/* ---------------------------Dashboard--------------------------- */
app.use("/api/dashboard", adminDashboard); // admin dashboard count 
app.use("/api/dashboard", partnerDashboardRoutes); // partner dashboard
app.use("/api/booking-dashboard", bookingDashboardRoutes); // partner dashboard
app.use('/api/account-dashboard', accountDashboardRoutes); // account dashboard
app.use('/api/operation-dashboard', operationDashboardRoutes); // operation Dashboard
// activity logs
app.use("/api/activityLog", activityLogRoutes);

// --------------------------------------- Account Route --------------------------------

// Account routes
app.use("/api/account", accountRoute);

// Credit and Debit
app.use("/api/credit-debit", creditAndDebit);

// Debit details
app.use("/api", debitRoute);

// Credit details
app.use("/api/credits",creditRoute);
// excel compare
app.use("/api", excelCompare);

// account Manage
app.use("/api/account-manage",accountManage);

// ---------------------------------------- Bar and Line charts ------------------------------
app.use("/api/partner-dashboard", partnerChart);
app.use("/api/admin-dashboard", adminChart);
app.use("/api/booking-dashboard", bookingChart);
app.use("/api/broker-dashboard", brokerChart);

// Test Routes
app.use("/api", testRoutes);

app.use(handleInvalidRoutes);

// Request logger
app.use(requestLogger);

// Listen on port
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});