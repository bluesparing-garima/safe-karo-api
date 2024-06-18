// controllers/userProfileController.js
import UserModel from "../../models/userProfileSchema.js";

// Create User Profile
export const createUserProfile = async (req, res) => {
    try {
        const {
            branch, role, headRM, fullName, mobileNumber, email, dateOfBirth, gender,
            address, pincode, bankName, IFSC, accountHolderName, accountNumber,
            salary, document, createdBy,isActive
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
            document, 
            createdBy,
            isActive
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

// Get User Profiles by Head RM (Generalized for specific headRM values)
export const getUserProfilesByHeadRM = async (req, res) => {
    try {
        let headRM;
        if (req.path.includes('/RM')) {
            headRM = ['RM', 'relationManager'];
        } else {
            headRM = ['relationManager']; 
        }

        const users = await UserModel.find({ headRM: { $in: headRM } });

        if (users.length === 0) {
            return res.status(404).json({ status: "error", message: `No user profiles found for ${headRM}` });
        }

        res.status(200).json({
            message: `User profiles with headRM ${headRM} retrieved successfully`,
            data: users,
            status: "success",
        });
    } catch (error) {
        console.error("Error fetching user profiles by headRM:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};



// Get All Active User Profiles
export const getAllActiveUserProfiles = async (req, res) => {
    try {
        const users = await UserModel.find();
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
            salary, document, UpdatedBy,isActive
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
            isActive,
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

        const savedUser = await user.save();

        res.status(200).json({
            message: `User profile with ID ${req.params.id} deactivated successfully`,
            status: "success",
            data: savedUser,
        });
    } catch (error) {
        console.error("Error deleting user profile:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

