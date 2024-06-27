import CreateRoleModel from "../../models/adminModels/roleSchema.js";

// Create a new role
const createNewRole = async (req, res) => {
  try {
    const { roleName, createdBy, isActive } = req.body;

    // Check if role type already exists
    const existingRole = await CreateRoleModel.findOne({ roleName });
    if (existingRole) {
      return res
        .status(400)
        .json({ status: "failed", message: "Role type already exists" });
    }

    const newRoleName = new CreateRoleModel({
      roleName,
      createdBy,
      isActive: isActive !== undefined ? isActive : true, // Set isActive to true if not provided
    });
    await newRoleName.save();
    res.status(200).json({
      status: "success",
      data: newRoleName,
      message: "New role created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to create new role" });
  }
};

// Get all roles
const getAllRoles = async (req, res) => {
  try {
    const roles = await CreateRoleModel.find();
    res.status(200).json({
      status: "success",
      data: roles,
      message: "Success! Here are all your roles",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to retrieve roles" });
  }
};

// Get role by ID
const getRolesById = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if role type exists
    const existingRole = await CreateRoleModel.findById(id);
    if (!existingRole) {
      return res.status(404).json({ status: "failed", message: "Role type not found" });
    }
    res.status(200).json({
      status: "success",
      data: existingRole,
      message: "Success! Here is your role with ID",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to retrieve role" });
  }
};

// Update role
const updateRoles = async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy, isActive, ...updateData } = req.body;

    // Check if role type exists
    const existingRole = await CreateRoleModel.findById(id);
    if (!existingRole) {
      return res.status(404).json({ status: "failed", message: "Role not found" });
    }

    // Update the role fields
    Object.keys(updateData).forEach((key) => {
      existingRole[key] = updateData[key];
    });

    // Manually update isActive if provided in the request body
    if (isActive !== undefined) {
      existingRole.isActive = isActive;
    }

    // Set updatedBy and updatedOn fields
    existingRole.updatedBy = updatedBy;
    existingRole.updatedOn = new Date();

    // Save the updated role
    const updatedRole = await existingRole.save();

    res.status(200).json({
      status: "success",
      data: updatedRole,
      message: "Role updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to update role" });
  }
};

// Delete role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role type exists
    const existingRole = await CreateRoleModel.findById(id);
    if (!existingRole) {
      return res.status(404).json({ status: "failed", message: "Role not found" });
    }

    // Delete the role
    await CreateRoleModel.findByIdAndDelete(id);
    res.status(200).json({ status: "success", message: "Role deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to delete role" });
  }
};

export { createNewRole, getAllRoles, getRolesById, updateRoles, deleteRole };
