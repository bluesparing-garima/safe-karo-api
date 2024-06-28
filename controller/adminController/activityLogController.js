import ActivityLogModel from '../../models/adminModels/activityLogSchema.js';

// Create a new activity log
export const createActivityLog = async (logData) => {
  try {
    const newLog = new ActivityLogModel(logData);
    const savedLog = await newLog.save();
    return savedLog;
  } catch (error) {
    throw new Error(`Error creating activity log: ${error.message}`);
  }
};

// Get all activity logs
export const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLogModel.find();
    res.status(200).json({
      message: "All activity logs retrieved successfully.",
      data: logs,
      status: "success"
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get activity log by ID
export const getActivityLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await ActivityLogModel.findById(id);
    if (!log) {
      return res.status(404).json({ status: "error", message: "Activity log not found" });
    }
    res.status(200).json({
      message: "Activity log retrieved successfully.",
      data: log,
      status: "success"
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Delete activity log by ID
export const deleteActivityLog = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLog = await ActivityLogModel.findByIdAndDelete(id);
    if (!deletedLog) {
      return res.status(404).json({ status: "error", message: "Activity log not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Activity log deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
