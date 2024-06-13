import express from "express";
import {
    createBrokerName, getAllBrokerNames, getBrokerNameById, updateBrokerName, deleteBrokerName 
} from "../controller/adminController/brokerController.js";

const router = express.Router();

// Create a new broker name
router.post('/', createBrokerName);

// Get all broker names
router.get('/', getAllBrokerNames);

// Get broker name by ID
router.get('/:id', getBrokerNameById);

// Update a broker name by id
router.put('/:id', updateBrokerName);

// Delete a broker name by id
router.delete('/:id', deleteBrokerName);

export default router;
