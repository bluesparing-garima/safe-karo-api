import expres from "express";
import {
    createVehicleName,getAllvehicleNames,getvehicleNameByName,getvehicleNameById,updatevehicleName,deletevehicleName 
} from "../controller/adminController/vehicleNameController.js";

const router = expres.Router();

// Create a new vehicle type
router.post('/', createVehicleName);

// Get all case types or filter by vehicle name
router.get('/', getAllvehicleNames);

// Get vehicle types by ID
router.get('/:id', getvehicleNameById);

// Get a vehicle type by Name
router.get('/name/:vehicleType', getvehicleNameByName);

// Update a vehicle type by id
router.put('/:id', updatevehicleName);

// Delete a vehicle type by id
router.delete('/:id', deletevehicleName);

export default router;