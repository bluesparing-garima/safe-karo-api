import creditAndDebit from '../../models/accountsModels/creditAndDebitSchema.js';

// Create a new credit and debit transaction
export const createCredit = async (req, res) => {
    try {
        const {
            type,
            account,
            accountCode,
            amount,
            userName,
            remarks,
            createdBy,
            createdOn
        } = req.body;

        const newCreditAndDebit = new creditAndDebit({
            type,
            account,
            accountCode,
            amount,
            userName,
            remarks,
            createdBy,
            createdOn
        });

        await newCreditAndDebit.save();
        res.status(201).json({
            message: "Transaction created successfully",
            data: newCreditAndDebit,
            status: "success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating transaction",
            error: error.message,
            status: "error"
        });
    }
};

// Get all credit and debit transactions
export const getCredits = async (req, res) => {
    try {
        const credits = await creditAndDebit.find();
        res.status(200).json({
            message: "Transactions retrieved successfully",
            data: credits,
            status: "success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving transactions",
            error: error.message,
            status: "error"
        });
    }
};

// Get a credit and debit transaction by ID
export const getCreditById = async (req, res) => {
    try {
        const { id } = req.params;
        const credit = await creditAndDebit.findById(id);

        if (!credit) {
            return res.status(404).json({
                message: "Transaction not found",
                status: "error"
            });
        }

        res.status(200).json({
            message: "Transaction retrieved successfully",
            data: credit,
            status: "success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving transaction",
            error: error.message,
            status: "error"
        });
    }
};

// Update a credit and debit transaction by ID
export const updateCreditById = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const updatedCredit = await creditAndDebit.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedCredit) {
            return res.status(404).json({
                message: "Transaction not found",
                status: "error"
            });
        }

        res.status(200).json({
            message: "Transaction updated successfully",
            data: updatedCredit,
            status: "success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating transaction",
            error: error.message,
            status: "error"
        });
    }
};

// Delete a credit and debit transaction by ID
export const deleteCreditById = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCredit = await creditAndDebit.findByIdAndDelete(id);

        if (!deletedCredit) {
            return res.status(404).json({
                message: "Transaction not found",
                status: "error"
            });
        }

        res.status(200).json({
            message: "Transaction deleted successfully",
            status: "success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting transaction",
            error: error.message,
            status: "error"
        });
    }
};
