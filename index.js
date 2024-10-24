import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/connectdb.js";
import userRoutes from "./routes/userRoutes.js";
import path from "path";
import serveIndex from "serve-index";
import { fileURLToPath } from "url";

// middleware
import {
  requestLogger,
  handleInvalidRoutes,
} from "./middlewares/requestLogger.js";
// impor from "./middlewares/Auth.js";

import activityLogRoutes from "./routes/adminRoutes/activityLogRoutes.js";

// blogs
import blogs from "./routes/websiteRoutes/blogRoutes.js";
import blogcategories from "./routes/websiteRoutes/blogCategoryRoutes.js";
import NewsLetter from "./routes/websiteRoutes/newsLetterRoutes.js";
import NewsLetterCategories from "./routes/websiteRoutes/newsLetterCategoryRoutes.js";
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
import brokerDashboardRoutes from "./routes/dashboardRoutes/brokerDashboardRoute.js";
import relationShipManagerRoutes from "./routes/dashboardRoutes/relationshipManagerRoute.js";
import hrDashboardRoutes from './routes/dashboardRoutes/hrDashboardRoute.js';

// partner - admin dashboard routes
import partnerAdminDashboarRoutes from "./routes/dashboardRoutes/partnerAdminDashboard/partnerAdminDashboardRoutes.js";

// broker - admin dashboard routes
import brokerAdminDashboarRoutes from "./routes/dashboardRoutes/brokerAdminDashboard/brokerAdminDashboardRoutes.js";

// premiums dashboard routes
import netPremiumDashboardRoutes from "./routes/dashboardRoutes/netPremiumDashboard/netPremiumDashboardRoute.js";
import finalPremiumDashboardRoutes from "./routes/dashboardRoutes/finalPremiumDashboard/finalPremiumDashboardRoute.js";

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

// pdf reader
import pdfRoutes from "./routes/pdfReaderRoute.js";
import pdfCompress from "./routes/pdfCompress.js";

// Refresh Token
import refreshTokenRoutes from "./routes/refreshTokenRoute.js";

// Holiday Calendar
import holidayCalendar from "./routes/adminRoutes/holidayCalendarRoutes.js";

// notification route
import notificationRoutes from "./routes/notificationRoutes.js";

import testRoutes from "./routes/testRoutes.js";

// ranks
import ranks from "./routes/adminRoutes/rankRoutes.js";

//HR and Attendance
import attendance from "./routes/adminRoutes/attendanceRoutes.js";

/* ---------------------------------------- Non-Motor -------------------------------------------------- */

/* ------------- State & City & Area ----------- */
import state from "./routes/Non-Motor Routes/stateRoutes/stateRoutes.js";
import city from "./routes/Non-Motor Routes/cityRoutes/cityRoutes.js";
import area from "./routes/Non-Motor Routes/areaRoutes/areaRoutes.js";
import investigation from "./routes/Non-Motor Routes/investigationRoutes/investigationRoute.js";

/* ------------- Task Management ----------- */
import task from "./routes/Non-Motor Routes/taskRoutes/taskAssignRoute.js";

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

// Derive __dirname from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads")),
  serveIndex(path.join(__dirname, "uploads"), { icons: true })
);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads")),
  serveIndex(path.join(__dirname, "uploads"), { icons: true })
);

app.use("/api/policy/pdf", pdfRoutes);
app.use("/api/pdf", pdfCompress);
// JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use multer upload middleware where needed, for example:
// app.post("/upload", uploadMiddleware, (req, res) => {
//   res.send("Files uploaded successfully.");
// });

app.use('/api/notification', notificationRoutes);

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

// user login/register
app.use("/api/user", userRoutes);

// Refresh token
app.use("/api/user/refresh-token", refreshTokenRoutes);

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

// --------------------------------------- Dashboard Route --------------------------------

app.use("/api/dashboard", adminDashboard);

app.use("/api/partner-dashboard", partnerDashboardRoutes);

app.use("/api/booking-dashboard", bookingDashboardRoutes);

app.use("/api/operation-dashboard", operationDashboardRoutes);

app.use("/api/account-dashboard", accountDashboardRoutes);

app.use("/api/broker-dashboard", brokerDashboardRoutes);

app.use("/api/relationship-manager-dashboard", relationShipManagerRoutes);

app.use("/api/hr-dashboard", hrDashboardRoutes);

// ------------------------------------ PartnerAdmin Dashboard Routes -------------------------

app.use("/api/dashboard/partner-admin", partnerAdminDashboarRoutes);

// ------------------------------------ Broker Admin Dashboard Routes -------------------------

app.use("/api/dashboard/broker-admin", brokerAdminDashboarRoutes);

// ------------------------------------Premiums Dashboard Routes -------------------------

app.use("/api/dashboard/net-premium", netPremiumDashboardRoutes);

app.use("/api/dashboard/final-premium", finalPremiumDashboardRoutes);

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
app.use("/api/credits", creditRoute);

// excel compare
app.use("/api", excelCompare);

// account Manage
app.use("/api/account-manage", accountManage);

// ---------------------------------------- Bar and Line charts ------------------------------
app.use("/api/partner-dashboard", partnerChart);
app.use("/api/admin-dashboard", adminChart);
app.use("/api/booking-dashboard", bookingChart);
app.use("/api/broker-dashboard", brokerChart);

// ---------------------------------------- ranks ------------------------------
app.use("/api/ranks", ranks);
// ---------------------------------------- blogs and newsLetter ------------------------------
app.use("/api/blog-category", blogcategories);
app.use("/api/blogs", blogs);
app.use("/api/news-letter-category", NewsLetterCategories);
app.use("/api/news-letter", NewsLetter);

/* ---------------------------------------- Non-Motor -------------------------------------------------- */

/* ------------- State & City & Area ----------- */
app.use("/api/non-motor/state",state);
app.use("/api/non-motor/city",city);
app.use("/api/non-motor/area",area);
app.use("/api/non-motor/investigation",investigation);

/* ------------- State & City & Area ----------- */
app.use("/api/non-motor/task",task);

// ---------------------------------------- HR and attendance ------------------------------

app.use("/api/attendance",attendance);

// ---------------------------------------- Holiday Calendar ------------------------------

app.use("/api/holiday-calendar", holidayCalendar);

// Test Routes
app.use("/api", testRoutes);

app.use(handleInvalidRoutes);

// Request logger
app.use(requestLogger);

// Listen on port
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
