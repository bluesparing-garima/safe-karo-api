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
import checkUserAuth from "./middlewares/Auth.js";

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
import testRoutes from "./routes/testRoutes.js";

// ranks
import ranks from "./routes/adminRoutes/rankRoutes.js";

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

// userProfile
app.use("/api/user-profile", userProfile);

// Booking request
app.use("/api/booking-request", checkUserAuth, bookingRequestRoute);

// motor policy Routes
app.use("/api/policy/motor", checkUserAuth, motorPolicyRoutes);

// motor policy payment Routes
app.use("/api/policy/motor/payment", checkUserAuth, motorPolicyPayment);

// filter policy Routes
app.use("/api/policy/motor/filter", checkUserAuth, filterPolicy);

//Partner lead generate.
app.use("/api/lead-Generate", checkUserAuth, leadGenerate);

// lead Quotation.
app.use("/api/lead-quotation", checkUserAuth, leadQuotation);

// lead payment.
app.use("/api/lead-payment", checkUserAuth, leadPayment);

// user login/register
app.use("/api/user", userRoutes);

//assignee roles Routes
app.use("/api/user-roles", checkUserAuth, assigneeRolesRouters);

//create new Policy Routes
app.use("/api/policy-type", checkUserAuth, policyTypeRoutes);

//create case type Routes
app.use("/api/case-type", checkUserAuth, caseTypeRoutes);

//add Roles
app.use("/api/roles", checkUserAuth, addRolesRoutes);

// upload payin excel
app.use("/api/pay-in/excel", checkUserAuth, payInexcelRoutes);

//upload payout excel
app.use("/api/pay-out/excel", checkUserAuth, payOutExcelRoutes);

// percentage Update manually
app.use("/api/policy/motor/commission", checkUserAuth, percentageUpdate);

// PayIn Routes
app.use("/api/calculate", checkUserAuth, payInRoutes);

//PayOut Routes
app.use("/api/calculate", checkUserAuth, payOutRoute);

// product-type Routes
app.use("/api/product-type", checkUserAuth, vehicleType);

// Product Name
app.use("/api/product", checkUserAuth, productName);

// Use the partner routes
app.use("/api/partner", checkUserAuth, partnerRoutes);

// Company Name's
app.use("/api/company", checkUserAuth, company);

// Broker
app.use("/api/broker", checkUserAuth, broker);

// Category
app.use("/api/category", checkUserAuth, category);

// FuelType
app.use("/api/fuel-type", checkUserAuth, fuelType);

// Make
app.use("/api/make", checkUserAuth, make);

// Model
app.use("/api/model", checkUserAuth, model);

// Branch
app.use("/api/branches", checkUserAuth, branch);

// --------------------------------------- Dashboard Route --------------------------------

app.use("/api/dashboard", adminDashboard);

app.use("/api/partner-dashboard", partnerDashboardRoutes);

app.use("/api/booking-dashboard", bookingDashboardRoutes);

app.use("/api/operation-dashboard", operationDashboardRoutes);

app.use("/api/account-dashboard", accountDashboardRoutes);

app.use("/api/broker-dashboard", brokerDashboardRoutes);

app.use("/api/relationship-manager-dashboard", relationShipManagerRoutes);

// ------------------------------------ PartnerAdmin Dashboard Routes -------------------------

app.use("/api/dashboard/partner-admin", partnerAdminDashboarRoutes);

// ------------------------------------ Broker Admin Dashboard Routes -------------------------

app.use("/api/dashboard/broker-admin", brokerAdminDashboarRoutes);

// ------------------------------------Premiums Dashboard Routes -------------------------

app.use("/api/dashboard/net-premium", netPremiumDashboardRoutes);

app.use("/api/dashboard/final-premium", finalPremiumDashboardRoutes);

// activity logs
app.use("/api/activityLog", checkUserAuth, activityLogRoutes);

// --------------------------------------- Account Route --------------------------------

// Account routes
app.use("/api/account", checkUserAuth, accountRoute);

// Credit and Debit
app.use("/api/credit-debit", checkUserAuth, creditAndDebit);

// Debit details
app.use("/api", checkUserAuth, debitRoute);

// Credit details
app.use("/api/credits", checkUserAuth, creditRoute);

// excel compare
app.use("/api", checkUserAuth, excelCompare);

// account Manage
app.use("/api/account-manage", checkUserAuth, accountManage);

// ---------------------------------------- Bar and Line charts ------------------------------
app.use("/api/partner-dashboard", checkUserAuth, partnerChart);
app.use("/api/admin-dashboard", checkUserAuth, adminChart);
app.use("/api/booking-dashboard", checkUserAuth, bookingChart);
app.use("/api/broker-dashboard", checkUserAuth, brokerChart);

// ---------------------------------------- ranks ------------------------------
app.use("/api/ranks", checkUserAuth, ranks);
// ---------------------------------------- blogs and newsLetter ------------------------------
app.use("/api/blog-category", blogcategories);
app.use("/api/blogs", blogs);
app.use("/api/news-letter-category", NewsLetterCategories);
app.use("/api/news-letter", NewsLetter);

// Test Routes
app.use("/api", checkUserAuth, testRoutes);

app.use(handleInvalidRoutes);

// Request logger
app.use(requestLogger);

// Listen on port
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
