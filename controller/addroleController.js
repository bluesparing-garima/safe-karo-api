import CreateRoleModel from "../models/addRole.js";

const createNewRole = async (req, res) => {
  try {
    const { roleName, createdBy } = req.body;

    // Check if case type already exists
    const existingRole = await CreateRoleModel.findOne({ roleName });
    if (existingRole) {
      return res
        .status(400)
        .json({ status: "failed", message: "Case type already exists" });
    }

    const newRoleName = new CreateRoleModel({
        roleName,
      createdBy
    });
    await newRoleName.save();
    res.status(200).json({
      status: "success",
      data: newRoleName,
      message: "New role created successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to create new Role" });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roleName = await CreateRoleModel.find();
    res.status(200).json({
      status: "success",
      data: roleName,
      message: "Success! Here are all your role name",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve roles" });
  }
};


const updateRoles = async (req, res) => {
  try {
    const { roleName } = req.params;
    const { updatedBy, ...updateData } = req.body;

    // Check if case type exists
    const existingroleName = await CreateRoleModel.findOne({ roleName });
    if (!existingroleName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Role with this name not found" });
    }

    // Update the case type
    const updatedRoleName = await CreateRoleModel.findOneAndUpdate(
      { roleName },
      { $set: { ...updateData, updatedBy, updatedOn: new Date() } }, // Add updatedBy and updatedBy
      { new: true }
    );
    res.status(200).json({
      status: "success",
      data: updatedRoleName,
      message: "Role Name updated successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to update Role" });
  }
};

const deleteRoleByName = async (req, res) => {
  try {
    const { roleName } = req.params;

    // Check if case type exists
    const existingRoleName = await CreateRoleModel.findOne({ roleName });
    if (!existingRoleName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Role was not found" });
    }

    // Delete the case type
    await CreateRoleModel.findOneAndDelete({ roleName });
    res
      .status(200)
      .json({ status: "success", message: "Role deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to delete Role" });
  }
};

export { createNewRole, getAllRoles, updateRoles, deleteRoleByName };
