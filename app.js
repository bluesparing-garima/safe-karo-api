import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/connectdb.js";
import userRoutes from "./routes/userRoutes.js";
import rolesRouters from "./routes/rolesRoutes.js";
import motorPolicyRoutes from "./routes/motorPolicyRoutes.js"

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

// roles Routes
app.use("/api/roles", rolesRouters);

// motor policy Routes
app.use("/api/policy", motorPolicyRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
