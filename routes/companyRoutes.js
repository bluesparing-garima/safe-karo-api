import express from "express";
import {
    createCompanyName,getAllCompanyNames,getCompanyNameById,updateCompanyName,deleteCompanyName 
} from "../controller/adminController/companyController.js";

const router = express.Router();

// Create a new vehicle type
router.post('/', createCompanyName);

// Get all case types or filter by vehicle name
router.get('/', getAllCompanyNames);

// Get vehicle types by ID
router.get('/:id', getCompanyNameById);

// Update a vehicle type by id
router.put('/:id', updateCompanyName);

// Delete a vehicle type by id
router.delete('/:id', deleteCompanyName);

export default router;