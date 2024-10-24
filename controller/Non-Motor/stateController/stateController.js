import StateModel from "../../../models/Non-Motor Models/stateModel/stateSchema.js";

// Create a new state
export const createState = async (req, res) => {
  try {
    const { state, createdBy } = req.body;
    const newState = new StateModel({ state, createdBy });
    await newState.save();

    res.status(201).json({
      status: "success",
      message: "State created successfully",
      data: newState,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error creating state",
      data: null,
    });
  }
};

// Get all active states
export const getAllStates = async (req, res) => {
  try {
    const states = await StateModel.find({ isActive: true });
    res.status(200).json({
      status: "success",
      message: "Success! Here are all active states",
      data: states,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching states",
      data: null,
    });
  }
};

// Get state by ID
export const getStateById = async (req, res) => {
  try {
    const state = await StateModel.findOne({ _id: req.params.id, isActive: true });

    if (!state) {
      return res.status(404).json({
        status: "error",
        message: "State not found or inactive",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "State fetched successfully",
      data: state,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching state",
      data: null,
    });
  }
};

// Update state by ID
export const updateState = async (req, res) => {
  try {
    const { state, updatedBy, isActive } = req.body;
    const updatedState = await StateModel.findByIdAndUpdate(
      req.params.id,
      { state, updatedBy, updatedOn: Date.now(), isActive },
      { new: true }
    );

    if (!updatedState) {
      return res.status(404).json({
        status: "error",
        message: "State not found",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "State updated successfully",
      data: updatedState,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating state",
      data: null,
    });
  }
};

// Deactivate state by setting isActive to false
export const deleteState = async (req, res) => {
  try {
    const state = await StateModel.findById(req.params.id);

    if (!state) {
      return res.status(404).json({
        status: "error",
        message: "State not found",
        data: null,
      });
    }

    state.isActive = false;
    await state.save();

    res.status(200).json({
      status: "success",
      message: "State deactivated successfully",
      data: state,
    });
  } catch (error) {
    console.error("Error deactivating state:", error);
    res.status(500).json({
      status: "error",
      message: "Error deactivating state",
      data: null,
    });
  }
};

