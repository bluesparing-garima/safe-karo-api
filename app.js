import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/connectdb.js";
import userRoutes from "./routes/userRoutes.js";
import rolesRouters from "./routes/rolesRoutes.js";

const app = express();
const port = process.env.PORT;
console.log("port", port);
const DATABASE_URL = process.env.DATEBASE_URL;
console.log("DB_URL", DATABASE_URL);

// CORS Policy
app.use(cors());

// Database Connection
connectDB(DATABASE_URL);

// JSON
app.use(express.json());

// Load Routes
app.use("/api/user", userRoutes);

// roles Routes
app.use("/api/roles", rolesRouters);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
