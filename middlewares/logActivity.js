import express from 'express';
import ActivityLog from '../models/adminModels/activityLogSchema.js';

export const getLogActivity = async (req, res) => {
  try {
    const { endpoint, statusCode, partnerId, isActive, startDate, endDate } = req.query;

    let query = {};

    if (endpoint) query.endpoint = endpoint;
    if (statusCode) query.statusCode = Number(statusCode);
    if (partnerId) query.partnerId = partnerId;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    if (startDate || endDate) {
      query.createdOn = {};
      if (startDate) query.createdOn.$gte = new Date(new Date(startDate).setHours(0, 0, 0));
      if (endDate) query.createdOn.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || Infinity;
    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find(query)
      .sort({ createdOn: -1 })
      .skip(skip)               
      .limit(limit)             
      .lean();

    const count = await ActivityLog.countDocuments(query);

    res.status(200).json({
      message: "Activity logs retrieved successfully",
      count: count,
      data: logs,
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving activity logs",
      error: err.message,
      status: "error",
    });
  }
};

// Middleware to log activity
const logActivity = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    const activityLog = new ActivityLog({
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
      request: JSON.stringify(req.body),
      response: body,
      partnerId: req.body.partnerId || req.query.partnerId || null, 
      createdBy: req.body.createdBy || 'system', 
    });

    activityLog.save().catch(err => {
      console.error('Error saving activity log:', err);
    });

    originalSend.apply(res, arguments);
  };

  next();
};

export default logActivity;
