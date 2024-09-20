import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
  try {
    const DB_OPTIONS = {
      dbName: "safekaro",
      connectTimeoutMS: 30000,
    };
    await mongoose.connect(DATABASE_URL, DB_OPTIONS);
    console.log("MongoDB Connected to server.....!!!!!");
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

export default connectDB;
