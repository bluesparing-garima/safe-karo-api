import { createActivityLog } from "../controller/adminController/activityLogController.js";
import path from "path";

const requestLogger = async (req, res, next) => {
  const logData = {
    endpoint: req.originalUrl,
    statusCode: null,
    request: JSON.stringify(req.body) || JSON.stringify(req.query) || "",
    response: null,
    partnerId: req.body?.partnerId || req.query?.partnerId || "",
    isActive: true,
    createdBy: req.body?.createdBy || req.query?.createdBy || "",
    createdOn: new Date(),
  };

  // Add response logging
  res.on("finish", async () => {
    logData.statusCode = res.statusCode;
    logData.response = res.statusMessage || "";

    // Check if the endpoint accesses files in the 'uploads' folder
    if (req.originalUrl.startsWith("/uploads")) {
      logData.endpoint = "File Access: " + req.originalUrl; // Update endpoint for file access
    }

    try {
      await createActivityLog(logData);
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  });

  next();
};

const handleInvalidRoutes = async (req, res) => {

  const logData = {
    endpoint: req.originalUrl,
    statusCode: 404,
    request: JSON.stringify(req.body) || JSON.stringify(req.query) || "",
    response: JSON.stringify({ status: "failed", message: "Route not found" }),
    partnerId: req.body?.partnerId || req.query?.partnerId || "",
    isActive: true,
    createdBy: req.body?.createdBy || req.query?.createdBy || "",
    createdOn: new Date(),
  };

  try {
    await createActivityLog(logData);
  } catch (error) {
    console.error("Error logging invalid route activity:", error);
  }

  res.status(404).json({ status: "failed", message: "Route not found" });
};

export { requestLogger, handleInvalidRoutes };
