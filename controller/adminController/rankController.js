import Rank from "../../models/adminModels/rankSchema.js";
import MotorPolicy from "../../models/policyModel/motorpolicySchema.js";

// Create a new rank with specified rank and count
export const createRank = async (req, res) => {
    try {
        const { rank, count } = req.body; 
        const userId = req.user ? req.user.id : 'admin';

        const newRank = new Rank({
            rank,
            count,
            createdBy: userId,
            updatedBy: userId,
            isActive: true,
        });

        const savedRank = await newRank.save();
        res.status(201).json(savedRank);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all ranks
export const getAllRanks = async (req, res) => {
    try {
        const ranks = await Rank.find({ isActive: true });
        res.status(200).json(ranks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get partner category based on their policy count
export const getPartnerCategory = async (req, res) => {
    try {
        const { partnerId } = req.query;

        const policyCount = await MotorPolicy.countDocuments({ partnerId });

        const ranks = await Rank.find({ isActive: true });
        console.log("Active Ranks: ", ranks);

        const partnerRank = ranks
            .filter(rank => policyCount >= rank.count)
            .sort((a, b) => b.count - a.count)
            .shift();

        if (!partnerRank) {
            return res.status(404).json({ message: 'No rank found for this partner based on policy count' });
        }

        res.status(200).json({ partnerId, rank: partnerRank.rank, policyCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
            return res.status(404).json({ message: 'Rank not found for this ID' });
        }

        res.status(200).json({ message: 'Rank deactivated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
