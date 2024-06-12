import express from "express";
import {
  createVehicleType,
  getAllVehicleTypes,
  getVehicleTypeByName,
  getVehicleTypeById,
  updateVehicleType,
  deleteVehicleType
} from "../controller/adminController/vehicleTypeController.js";

const router = express.Router();

// Create a new vehicle type
router.post('/', createVehicleType);

// Get all vehicle types
router.get('/', getAllVehicleTypes);

// Get a vehicle type by Name
router.get('/name/:vehicleType', getVehicleTypeByName);

// Get vehicle type by ID
router.get('/:id', getVehicleTypeById);

// Update a vehicle type by id
router.put('/:id', updateVehicleType);

// Delete a vehicle type by id
router.delete('/:id', deleteVehicleType);

export default router;
