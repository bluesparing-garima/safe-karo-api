import TaskModel from "../../../models/Non-Motor Models/taskModel/taskAssignSchema.js";
import UserProfileModel from "../../../models/adminModels/userProfileSchema.js";
import AreaModel from "../../../models/Non-Motor Models/areaModel/areaSchema.js";
import InvestigationModel from "../../../models/Non-Motor Models/investigationModel/investigationSchema.js";

const getLocationDetails = async (areaId) => {
  const areaData = await AreaModel.findById(areaId).lean();
  
  if (!areaData) {
    throw new Error("Invalid Area ID provided");
  }

  return {
    stateName: areaData.stateName || "Unknown",
    cityName: areaData.cityName || "Unknown",
    areaName: areaData.areaName || "Unknown",
  };
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { 
      areaId, 
      investigationId, 
      employeeId, 
      relationshipManagerId,
    } = req.body;

    if (!relationshipManagerId) {
      return res.status(400).json({ 
        success: false, 
        message: "Relationship Manager ID is required" 
      });
    }

    const rm = await UserProfileModel.findById(relationshipManagerId).lean();
    if (!rm) {
      return res.status(404).json({ 
        success: false, 
        message: "Relationship Manager not found" 
      });
    }

    const validRoles = ["RM", "Relationship Manager", "RelationShip Manager"];
    if (!validRoles.includes(rm.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "User is not authorized as a Relationship Manager" 
      });
    }

    const createdBy = rm.fullName;

    const areaData = await AreaModel.findById(areaId).lean();
    if (!areaData) {
      return res.status(404).json({ 
        success: false, 
        message: "Area not found" 
      });
    }

    const { stateId, stateName, cityId, cityName, area } = areaData;

    let employeeName = null;
    let status = "Created";
    if (employeeId) {
      const employee = await UserProfileModel.findById(employeeId).lean();
      if (employee) {
        employeeName = employee.fullName;
        status = "Assigned";
      }
    }

    const investigation = await InvestigationModel.findById(investigationId).lean();
    if (!investigation) {
      return res.status(404).json({ 
        success: false, 
        message: "Investigation not found" 
      });
    }

    const task = new TaskModel({
      state: stateName,
      stateId,
      city: cityName,
      cityId,
      area: area,
      areaId,
      investigation: investigation.investigation,
      investigationId,
      employee: employeeName,
      employeeId,
      relationshipManagerId,
      status,
      createdBy,
    });

    await task.save();

    return res.status(201).json({ 
      success: true, 
      message: "Task created successfully", 
      task 
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get all tasks
export const getTasks = async (req, res) => {
  try {
    const tasks = await TaskModel.find({ isActive: true }).lean();
    return res.status(200).json({ message:"Retrived all tasks", tasks, success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all tasks based on employeeId
export const getTasksByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const tasks = await TaskModel.find({ employeeId, isActive: true }).lean();
    return res.status(200).json({ message:"Retrived tasks based on employee", tasks, success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all tasks based on areaId
export const getTasksByArea = async (req, res) => {
  try {
    const { areaId } = req.params;
    const tasks = await TaskModel.find({ areaId, isActive: true }).lean();
    return res.status(200).json({ message:"Retrived tasks based on area", tasks, success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all tasks based on investigationId
export const getTasksByInvestigation = async (req, res) => {
  try {
    const { investigationId } = req.params;
    const tasks = await TaskModel.find({ investigationId, isActive: true }).lean();
    return res.status(200).json({ message:"Retrived tasks based on Investigation", tasks, success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all tasks based on status
export const getTasksByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const regexStatus = new RegExp(`^${status}$`, 'i');

    const tasks = await TaskModel.find({ status: regexStatus, isActive: true }).lean();
    
    return res.status(200).json({ message: "Retrieved tasks based on status", tasks, success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get a task by ID
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await TaskModel.findById(id).lean();
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    return res.status(200).json({ message:"Retrived task based on Id", task, success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { areaId, investigationId, employeeId, relationshipManagerId } = req.body;

    if (!relationshipManagerId) {
      return res.status(400).json({ 
        success: false, 
        message: "Relationship Manager ID is required" 
      });
    }

    const rm = await UserProfileModel.findById(relationshipManagerId).lean();
    if (!rm) {
      return res.status(404).json({ 
        success: false, 
        message: "Relationship Manager not found" 
      });
    }

    const validRoles = ["RM", "Relationship Manager", "RelationShip Manager"];
    if (!validRoles.includes(rm.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "User is not authorized as a Relationship Manager" 
      });
    }

    const updatedBy = rm.fullName;

    const areaData = await AreaModel.findById(areaId).lean();
    if (!areaData) {
      return res.status(404).json({ 
        success: false, 
        message: "Area not found" 
      });
    }

    const { stateId, stateName, cityId, cityName, area } = areaData;

    let employeeName = null;
    let status = "Created";

    if (employeeId) {
      const employee = await UserProfileModel.findById(employeeId).lean();
      if (employee) {
        employeeName = employee.fullName;
        status = "Assigned";
      }
    }

    const investigation = await InvestigationModel.findById(investigationId).lean();
    if (!investigation) {
      return res.status(404).json({ 
        success: false, 
        message: "Investigation not found" 
      });
    }

    const task = await TaskModel.findByIdAndUpdate(
      id,
      {
        state: stateName,
        stateId,
        city: cityName,
        cityId,
        area: area,
        areaId,
        investigation: investigation.investigation,
        investigationId,
        employee: employeeName,
        employeeId,
        status,
        updatedBy,
        updatedOn: Date.now(),
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: "Task not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Task updated successfully", 
      task 
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete a task (soft delete)
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await TaskModel.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    return res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
