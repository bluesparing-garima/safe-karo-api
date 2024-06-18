// controllers/userProfileController.js
import UserModel from "../../models/userProfileSchema.js";

// Create User Profile
export const createUserProfile = async (req, res) => {
    try {
        const {
            branch, role, headRM, fullName, mobileNumber, email, dateOfBirth, gender,
            address, pincode, bankName, IFSC, accountHolderName, accountNumber,
            salary, document, createdBy
        } = req.body;

        const newUser = new UserModel({
            branch,
            role,
            headRM,
            fullName,
            mobileNumber,
            email,
            dateOfBirth,
            gender,
            address,
            pincode,
            bankName,
            IFSC,
            accountHolderName,
            accountNumber,
            salary,
            document, // This should be an array of document objects
            createdBy,
        });

        const savedUser = await newUser.save();
        res.status(201).json({
            message: "User profile created successfully",
            data: savedUser,
            status: "success",
        });
    } catch (error) {
        console.error("Error creating user profile:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Get User Profile by ID
export const getUserProfileById = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ status: "error", message: "User profile not found" });
        }
        res.status(200).json({
            message: `User profile with ID ${req.params.id} retrieved successfully`,
            data: user,
            status: "success",
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Get All Active User Profiles
export const getAllActiveUserProfiles = async (req, res) => {
    try {
        const users = await UserModel.find({ isActive: true });
        res.status(200).json({
            message: "All active user profiles retrieved successfully",
            data: users,
            status: "success"
        });
    } catch (error) {
        console.error("Error fetching user profiles:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Update User Profile by ID
export const updateUserProfile = async (req, res) => {
    try {
        const {
            branch, role, headRM, fullName, mobileNumber, email, dateOfBirth, gender,
            address, pincode, bankName, IFSC, accountHolderName, accountNumber,
            salary, document, UpdatedBy
        } = req.body;

        const updatedData = {
            branch,
            role,
            headRM,
            fullName,
            mobileNumber,
            email,
            dateOfBirth,
            gender,
            address,
            pincode,
            bankName,
            IFSC,
            accountHolderName,
            accountNumber,
            salary,
            document, // Update with new document array
            UpdatedBy,
            updatedOn: new Date() // Set the current date for updatedOn
        };

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ status: "error", message: "User profile not found" });
        }

        res.status(200).json({
            message: `User profile with ID ${req.params.id} updated successfully`,
            data: updatedUser,
            status: "success"
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Delete (Deactivate) User Profile by ID
export const deleteUserProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ status: "error", message: "User profile not found" });
        }

        user.isActive = false; // Soft delete by marking isActive as false
        await user.save();

        res.status(200).json({
            message: `User profile with ID ${req.params.id} deactivated successfully`,
            status: "success"
        });
    } catch (error) {
        console.error("Error deleting user profile:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

