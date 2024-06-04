import RoleModel from "../models/assigneeRole.js";
import { v4 as uuidv4 } from "uuid";

const createRoles = async (req, res) => {
  console.log("RECIVE REQ", req);
  try {
    const { name, description, createdBy, phoneNumber, assignedRole, email } =
      req.body;
    const uuid = uuidv4();

    const newRole = new RoleModel({
      uuid,
      name,
      description,
      createdBy,
      phoneNumber,
      assignedRole,
      email,
    });
    await newRole.save();
    res
      .status(200)
      .json({
        status: "success",
        data: newRole,
        message: "user created succesfully",
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable create user with this roles as user with same role already existes in db...!!!" });
  }
};

const getUserRoles = async (req, res) => {
  console.log("RECIVE REQ", req);
  try {
    const { email } = req.params;
    // Query the roles collection by email
    const user = await RoleModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "user not found" });
    }
    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        status: "failed",
        message:
          "Unable to find user with assigned roles (no user found with this assigned role)",
      });
  }
};

const getAllUser = async (req, res) => {
  console.log("RECIVE REQ", req);
  try {
    // Query the roles collection to fetch all users
    const data = await RoleModel.find();
    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ status: "failed", message: "No roles found" });
    }
    res
      .status(200)
      .json({
        status: "success",
        data: data,
        message: "success here is your all user in roles collection",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      messsage: "Unable to retrieve data",
    });
  }
};

const getUsersByRole = async (req, res) => {
  console.log("RECIVE REQ", req);
  try {
    const { roleName } = req.body;
    // Query the roles collection to find users with the specified role
    const users = await RoleModel.find({ assignedRole: roleName });

    if (!users || users.length === 0) {
      return res.status(404).json({
        status: "failed",
        message: `No users found with role ${roleName}`,
      });
    }
    // If users found, send them as a response
    res
      .status(200)
      .json({
        status: "success",
        data: users,
        message: "here are your user with same roles",
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve users by role" });
  }
};

const deleteUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Delete the user with the specified email
    const result = await RoleModel.findOneAndDelete({ email });

    if (!result) {
      return res
        .status(404)
        .json({
          status: "failed",
          message: `No user found with email ${email}`,
        });
    }
    res
      .status(200)
      .json({
        status: "success",
        message: `User with email ${email} deleted successfully`,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to delete user" });
  }
};

const updateUserByEmail = async (req, res) => {
  console.log("RECIVE REQ", req);
  try {
        const { email } = req.params;
        const updateData = req.body;

    const updatedUser = await RoleModel.findOneAndUpdate(
      {email},
      { $set: updateData},
      { new: true}
    );
    if (!updatedUser) {
      return res
        .status(404)
        .json({
          status: "failed",
          message: `No user found with email ${email}`,
        });
    }

    res
      .status(200)
      .json({
        status: "success",
        data: updatedUser,
        message: `User with email ${email} updated successfully`,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to update user" });
  }
}

export { createRoles, getUserRoles, deleteUserByEmail, getUsersByRole, getAllUser, updateUserByEmail };
