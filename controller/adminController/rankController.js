import Rank from "../../models/adminModels/rankSchema.js"; 
import MotorPolicy from "../../models/policyModel/motorpolicySchema.js";

// Create a new rank with specified rank and count
export const createRank = async (req, res) => {
    try {
        const { rank, count, isActive = true } = req.body; // Allow isActive to be set from the request body, default to true
        const userId = req.user ? req.user.id : 'admin';

        const newRank = new Rank({
            rank,
            count,
            createdBy: userId,
            updatedBy: userId,
            isActive,
        });

        const savedRank = await newRank.save();
        res.status(201).json({
            message: 'Rank created successfully',
            data: savedRank,
            success: true,
            status: "success",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            data: null,
            success: false,
            status: "error",
        });
    }
};

// Update existing rank by ObjectId
export const updateRank = async (req, res) => {
    try {
        const { rankId } = req.params;
        const { rank, count } = req.body;
        const userId = req.user ? req.user.id : 'admin';

        const updatedRank = await Rank.findByIdAndUpdate(
            rankId,
            { rank, count, updatedBy: userId },
            { new: true }
        );

        if (!updatedRank || !updatedRank.isActive) {
            return res.status(404).json({
                message: 'Rank not found for this ID',
                data: null,
                success: false,
                status: "error",
            });
        }

        res.status(200).json({
            message: 'Rank updated successfully',
            data: updatedRank,
            success: true,
            status: "success",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            data: null,
            success: false,
            status: "error",
        });
    }
};

// Get all ranks
export const getAllRanks = async (req, res) => {
    try {
        const ranks = await Rank.find({ isActive: true });
        res.status(200).json({
            message: 'Active ranks retrieved successfully',
            data: ranks,
            success: true,
            status: "success",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            data: null,
            success: false,
            status: "error",
        });
    }
};

// Get partner category based on their policy count
export const getPartnerCategory = async (req, res) => {
    try {
        const { partnerId } = req.query;

        const policyCount = await MotorPolicy.countDocuments({ partnerId });

        const ranks = await Rank.find({ isActive: true });

        const partnerRank = ranks
            .filter(rank => policyCount >= rank.count)
            .sort((a, b) => b.count - a.count)
            .shift();

        if (!partnerRank) {
            return res.status(404).json({
                message: 'No rank found for this partner based on policy count',
                data: null,
                success: false,
                status: "error",
            });
        }

        res.status(200).json({
            message: 'Partner category retrieved successfully',
            data: { partnerId, rank: partnerRank.rank, policyCount },
            success: true,
            status: "success",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            data: null,
            success: false,
            status: "error",
        });
    }
};

// Delete rank by ObjectId (Soft delete by setting isActive to false)
export const deleteRank = async (req, res) => {
    try {
        const { rankId } = req.params;
        const userId = req.user ? req.user.id : 'system';

        const deletedRank = await Rank.findOneAndUpdate(
            { _id: rankId },
            { isActive: false, updatedBy: userId },
            { new: true }
        );

        if (!deletedRank) {
            return res.status(404).json({
                message: 'Rank not found for this ID',
                data: null,
                success: false,
                status: "error",
            });
        }

        res.status(200).json({
            message: 'Rank deactivated successfully',
            data: null,
            success: true,
            status: "success",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            data: null,
            success: false,
            status: "error",
        });
    }
};
