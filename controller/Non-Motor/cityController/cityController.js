import CityModel from "../../../models/Non-Motor Models/cityModel/citySchema.js";
import StateModel from "../../../models/Non-Motor Models/stateModel/stateSchema.js";

// Create a new city
export const createCity = async (req, res) => {
  try {
    const { city, stateId, createdBy } = req.body;

    const state = await StateModel.findById(stateId);
    if (!state) {
      return res.status(404).json({
        status: "error",
        message: "State not found",
        data: null,
      });
    }

    const newCity = new CityModel({
      city,
      stateId,
      stateName: state.state,
      createdBy,
    });

    await newCity.save();
    res.status(201).json({
      status: "success",
      message: "City created successfully",
      data: newCity,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error creating city",
      data: null,
    });
  }
};

// Get all active cities
export const getAllCities = async (req, res) => {
  try {
    const cities = await CityModel.find({ isActive: true }).populate("stateId", "state");
    res.status(200).json({
      status: "success",
      message: "Success! Here are all active cities",
      data: cities,
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching cities",
      data: null,
    });
  }
};

// Get all cities by stateId (case-insensitive)
export const getCitiesByStateId = async (req, res) => {
  try {
    const { stateId } = req.params;

    const cities = await CityModel.find({
      stateId,
      isActive: true,
    });

    if (cities.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `No active cities found for state ID: ${stateId}`,
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: `Active cities found for state ID: ${stateId}`,
      data: cities,
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching cities",
      data: null,
    });
  }
};

// Get city by ID
export const getCityById = async (req, res) => {
  try {
    const city = await CityModel.findOne({ _id: req.params.id, isActive: true }).populate("stateId", "state");
    
    if (!city) {
      return res.status(404).json({
        status: "error",
        message: "City not found or inactive",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "City fetched successfully",
      data: city,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching city",
      data: null,
    });
  }
};

// Update city by ID
export const updateCity = async (req, res) => {
  try {
    const { city, stateId, updatedBy, isActive } = req.body;

    const state = await StateModel.findById(stateId);
    if (!state) {
      return res.status(404).json({
        status: "error",
        message: "State not found",
        data: null,
      });
    }

    const updatedCity = await CityModel.findByIdAndUpdate(
      req.params.id,
      {
        city,
        stateId,
        stateName: state.state,
        updatedBy,
        updatedOn: Date.now(),
        isActive,
      },
      { new: true }
    );

    if (!updatedCity) {
      return res.status(404).json({
        status: "error",
        message: "City not found",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "City updated successfully",
      data: updatedCity,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating city",
      data: null,
    });
  }
};

// Delete city by ID
export const deleteCity = async (req, res) => {
  try {
    const deletedCity = await CityModel.findByIdAndDelete(req.params.id);
    if (!deletedCity) {
      return res.status(404).json({
        status: "error",
        message: "City not found",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "City deleted successfully",
      data: deletedCity,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting city",
      data: null,
    });
  }
};
