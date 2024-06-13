import express from "express";
import {
    createVehicleName,getAllVehicleNames,getVehicleNameByName,getVehicleNameById,updateVehicleName,deleteVehicleName 
} from "../controller/adminController/vehicleNameController.js";

const router = express.Router();

// Create a new vehicle type
router.post('/', createVehicleName);

// Get all case types or filter by vehicle name
router.get('/', getAllVehicleNames);

// Get vehicle types by ID
router.get('/:id', getVehicleNameById);

// Get a vehicle type by Name
router.get('/name/:vehicleName', getVehicleNameByName);

// Update a vehicle type by id
router.put('/:id', updateVehicleName);

// Delete a vehicle type by id
router.delete('/:id', deleteVehicleName);

export default router;