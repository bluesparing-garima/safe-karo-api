import investigationModel from "../../../models/Non-Motor Models/investigationModel/investigationSchema.js";

// Create a new investigation
export const createinvestigation = async (req, res) => {
  try {
    const { investigation, createdBy } = req.body;
    const newinvestigation = new investigationModel({ investigation, createdBy });
    await newinvestigation.save();

    res.status(201).json({
      status: "success",
      message: "investigation created successfully",
      data: newinvestigation,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error creating investigation",
      data: null,
    });
  }
};

// Get all active investigations
export const getAllinvestigations = async (req, res) => {
  try {
    const investigations = await investigationModel.find({ isActive: true });
    res.status(200).json({
      status: "success",
      message: "Success! Here are all active investigations",
      data: investigations,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching investigations",
      data: null,
    });
  }
};

// Get investigation by ID
export const getinvestigationById = async (req, res) => {
  try {
    const investigation = await investigationModel.findOne({ _id: req.params.id, isActive: true });

    if (!investigation) {
      return res.status(404).json({
        status: "error",
        message: "investigation not found or inactive",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "investigation fetched successfully",
      data: investigation,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching investigation",
      data: null,
    });
  }
};

// Update investigation by ID
export const updateinvestigation = async (req, res) => {
  try {
    const { investigation, updatedBy, isActive } = req.body;
    const updatedinvestigation = await investigationModel.findByIdAndUpdate(
      req.params.id,
      { investigation, updatedBy, updatedOn: Date.now(), isActive },
      { new: true }
    );

    if (!updatedinvestigation) {
      return res.status(404).json({
        status: "error",
        message: "investigation not found",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "investigation updated successfully",
      data: updatedinvestigation,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating investigation",
      data: null,
    });
  }
};

// Delete investigation by ID
export const deleteinvestigation = async (req, res) => {
  try {
    const deletedinvestigation = await investigationModel.findByIdAndDelete(req.params.id);
    if (!deletedinvestigation) {
      return res.status(404).json({
        status: "error",
        message: "investigation not found",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "investigation deleted successfully",
      data: deletedinvestigation,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting investigation",
      data: null,
    });
  }
};
