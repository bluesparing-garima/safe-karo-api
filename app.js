import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/connectdb.js";
import userRoutes from "./routes/userRoutes.js";
import assigneeRolesRouters from "./routes/assigneeRolesRoutes.js";
import motorPolicyRoutes from "./routes/motorPolicyRoutes.js";
import policyTypeRoutes from "./routes/policyTypeRoutes.js";
import caseTypeRoutes from "./routes/caseTypeRoutes.js";
import addRolesRoutes from "./routes/addRolesRoutes.js"

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

// Load Routes
app.use("/api/user", userRoutes);

//assignee roles Routes
app.use("/api/assignee", assigneeRolesRouters);

// motor policy Routes
app.use("/api/policy/motor", motorPolicyRoutes);

//create new POlicy Routes
app.use("/api/create/policy", policyTypeRoutes);

//create new case type Routes
app.use("/api/caseType", caseTypeRoutes);

//add Roles
app.use("/api/role", addRolesRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
