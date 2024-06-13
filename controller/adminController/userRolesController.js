import RoleModel from "../../models/userRoleSchema.js";

// Create a new role
const createRoles = async (req, res) => {
  console.log("Received Request", req.body);
  try {
    const { name, description, createdBy, phoneNumber, assignedRole, email } =
      req.body;

    // Check if the user already exists
    const user = await RoleModel.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ status: "failed", message: "User already exists" });
    }

    const newRole = new RoleModel({
      name,
      description,
      createdBy,
      phoneNumber,
      assignedRole,
      email,
      isActive: true, // Set isActive to true initially
    });

    await newRole.save();
    res.status(201).json({
      status: "success",
      data: newRole,
      message: "User created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create user with this role. Please try again.",
    });
  }
};

// Get user roles by email
const getUserRoles = async (req, res) => {
  console.log("Received Request", req.params);
  try {
    const { email } = req.params;

    // Query the roles collection by email and isActive
    const user = await RoleModel.findOne({ email, isActive: true });
    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found" });
    }

    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to find user with assigned roles. Please try again.",
    });
  }
};

// Get all active users
const getAllUser = async (req, res) => {
  console.log("Received Request");
  try {
    // Query the roles collection to fetch all active users
    const data = await RoleModel.find({ isActive: true });
    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ status: "failed", message: "No active roles found" });
    }

    res.status(200).json({
      status: "success",
      data: data,
      message: "Here are all the active users in the roles collection",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve data. Please try again.",
    });
  }
};

// Get users by role
const getUsersByRole = async (req, res) => {
  console.log("Received Request", req.params);
  try {
    const { roleName } = req.params;

    // Query the roles collection to find active users with the specified role
    const users = await RoleModel.find({ assignedRole: roleName, isActive: true });
    if (!users || users.length === 0) {
      return res.status(404).json({
        status: "failed",
        message: `No active users found with role ${roleName}`,
      });
    }

    res.status(200).json({
      status: "success",
      data: users,
      message: `Here are the active users with the specified role ${roleName}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve active users by role. Please try again.",
    });
  }
};

// Delete user by email (soft delete by setting isActive to false)
const deleteUserByEmail = async (req, res) => {
  console.log("Received Request", req.params);
  try {
    const { email } = req.params;

    // Update isActive to false instead of deleting the user physically
    const result = await RoleModel.findOneAndUpdate({ email }, { isActive: false });
    if (!result) {
      return res.status(404).json({
        status: "failed",
        message: `No user found with email ${email}`,
      });
    }

    res.status(200).json({
      status: "success",
      message: `User with email ${email} marked as inactive successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update user. Please try again.",
    });
  }
};

// Update user by email
const updateUserByEmail = async (req, res) => {
  console.log("Received Request", req.body, req.params);
  try {
    const { email } = req.params;
    const { updatedBy, ...updateData } = req.body;

    const updatedUser = await RoleModel.findOneAndUpdate(
      { email, isActive: true }, // Ensure the user is active
      { $set: { ...updateData, updatedBy, updatedOn: new Date() } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: "failed",
        message: `No active user found with email ${email}`,
      });
    }

    res.status(200).json({
      status: "success",
      data: updatedUser,
      message: `User with email ${email} updated successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update user. Please try again.",
    });
  }
};

export {
  createRoles,
  getUserRoles,
  deleteUserByEmail,
  getUsersByRole,
  getAllUser,
  updateUserByEmail,
};
