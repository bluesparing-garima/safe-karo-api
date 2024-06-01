import mongoose from "mongoose";

 const connectDB = async (DATEBASE_URL) => {
    try {
        const DB_OPTIONS ={
            dbName: "safekaro",
        }
        await mongoose.connect(DATEBASE_URL, DB_OPTIONS);
        console.log("MongoDb Connected to server.....!!!!!");
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
 };
export default connectDB;