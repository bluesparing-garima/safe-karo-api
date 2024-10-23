import mongoose from "mongoose";
import AreaModel from "../../../models/Non-Motor Models/areaModel/areaSchema.js";
import CityModel from "../../../models/Non-Motor Models/cityModel/citySchema.js";

// Create a new area
export const createArea = async (req, res) => {
  try {
    const { area, cityId, createdBy } = req.body;

    if (!mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid City ID format",
        data: null,
      });
    }

    const city = await CityModel.findById(cityId).populate("stateId");

    if (!city) {
      return res.status(404).json({
        status: "error",
        message: "City not found",
        data: null,
      });
    }

    const newArea = new AreaModel({
      area,
      cityId: city._id,
      cityName: city.city,
      stateId: city.stateId,
      stateName: city.stateName,
      createdBy,
    });

    await newArea.save();
    res.status(201).json({
      status: "success",
      message: "Area created successfully",
      data: newArea,
    });
  } catch (error) {
    console.error("Error creating area:", error);
    res.status(500).json({
      status: "error",
      message: "Error creating area",
      data: null,
    });
  }
};

// Get all areas by cityId
export const getAreasByCity = async (req, res) => {
  try {
    const { cityId } = req.params;

    // Validate cityId format
    if (!mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid City ID format",
        data: null,
      });
    }

    const areas = await AreaModel.find({ cityId, isActive: true });

    if (areas.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No active areas found for the given city",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: `Active areas found for cityId: ${cityId}`,
      data: areas,
    });
  } catch (error) {
    console.error("Error fetching areas:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching areas",
      data: null,
    });
  }
};

// Get all active areas
export const getAllAreas = async (req, res) => {
  try {
    const areas = await AreaModel.find({ isActive: true });
    res.status(200).json({
      status: "success",
      message: "Active areas fetched successfully",
      data: areas,
    });
  } catch (error) {
    console.error("Error fetching areas:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching areas",
      data: null,
    });
  }
};

// Get area by ID
export const getAreaById = async (req, res) => {
  try {
    const area = await AreaModel.findOne({ _id: req.params.id, isActive: true });

    if (!area) {
      return res.status(404).json({
        status: "error",
        message: "Area not found or inactive",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Area fetched successfully",
      data: area,
    });
  } catch (error) {
    console.error("Error fetching area:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching area",
      data: null,
    });
  }
};

// Update area by ID
export const updateArea = async (req, res) => {
  try {
    const { area, updatedBy, isActive } = req.body;

    const updatedArea = await AreaModel.findByIdAndUpdate(
      req.params.id,
      { area, updatedBy, updatedOn: Date.now(), isActive },
      { new: true }
    );

    if (!updatedArea) {
      return res.status(404).json({
        status: "error",
        message: "Area not found",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Area updated successfully",
      data: updatedArea,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating area",
      data: null,
    });
  }
};

// Delete area by ID
export const deleteArea = async (req, res) => {
  try {
    const deletedArea = await AreaModel.findByIdAndDelete(req.params.id);

    if (!deletedArea) {
      return res.status(404).json({
        status: "error",
        message: "Area not found",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Area deleted successfully",
      data: deletedArea,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting area",
      data: null,
    });
  }
};
