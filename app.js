import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/connectdb.js";
import userRoutes from "./routes/userRoutes.js";
import assigneeRolesRouters from "./routes/userRolesRoutes.js";
import motorPolicyRoutes from "./routes/motorPolicyRoutes.js";
import policyTypeRoutes from "./routes/policyTypeRoutes.js";
import caseTypeRoutes from "./routes/caseTypeRoutes.js";
import addRolesRoutes from "./routes/rolesRoutes.js";
import excelRoutes from './routes/excelRoutes.js';
import fileUpload from "express-fileupload";
import payInRoutes from './routes/payInRoutes.js';
import vehicleType from './routes/vehicleTypeRoutes.js';
import vehicle from './routes/vehicleRoutes.js';
import partnerRoutes from './routes/partnerIdRoutes.js';
import productName from './routes/productRoutes.js';
import company from './routes/companyRoutes.js';
import broker from './routes/brokerRoutes.js';
import category from './routes/categoryRoutes.js';

const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATEBASE_URL;

// CORS Policy
app.use(cors());

// Database Connection
connectDB(DATABASE_URL);

// JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload({
  createParentPath: true, // Allow creating parent path if it doesn't exist
}));

// Load Routes
app.use("/api/user", userRoutes);

//assignee roles Routes
app.use("/api/user-roles", assigneeRolesRouters);

// motor policy Routes
app.use("/api/policy/motor", motorPolicyRoutes);

//create new Policy Routes
app.use("/api/policy-type", policyTypeRoutes);

//create case type Routes
app.use("/api/case-type", caseTypeRoutes);

//add Roles
app.use("/api/roles", addRolesRoutes);

// upload excel
app.use('/api/excel', excelRoutes);

// PayIn Routes
app.use("/api/calculate", payInRoutes);

// Vehicle Routes
app.use('/api/vehicle-type', vehicleType);

// Vehicle Names
app.use('/api/vehicle', vehicle)

// Use the partnerId routes
app.use('/api/partner', partnerRoutes);

// Product Name
app.use('/api/product',productName);

// Company Name's
app.use('/api/company', company);

// Broker 
app.use('/api/broker',broker);

// Category
app.use('/api/category',category)
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});




