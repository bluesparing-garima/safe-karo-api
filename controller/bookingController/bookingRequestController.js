import BookingRequestModel from "../../models/bookingModel/bookingRequestSchema.js";

// Helper function to check for missing fields
const getMissingFields = (fields, requiredFields) => {
  return requiredFields.filter(
    (field) =>
      !fields.hasOwnProperty(field) ||
      fields[field] === undefined ||
      fields[field] === null
  );
};

// Check if a policy number already exists
const checkPolicyNumberExist = async (policyNumber) => {
  const existingBooking = await BookingRequestModel.findOne({ policyNumber });
  return existingBooking !== null;
};

// Create a new bookingRequest
export const createBookingRequest = async (req, res) => {
  try {
    const {
      partnerId,
      partnerName,
      relationshipManagerId,
      relationshipManagerName,
      policyNumber,
      category,
      caseType,
      policyType,
      productType,
      subCategory,
      companyName,
      documents,
      createdBy,
      isActive,
      bookingCreatedBy,
      bookingAcceptedBy,
    } = req.body;

    const requiredFields = [
      "partnerId",
      "partnerName",
      "policyNumber",
      "category",
      "caseType",
      "policyType",
      "productType",
      "companyName",
      "createdBy",
    ];
    const missingFields = getMissingFields(req.body, requiredFields);
    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
    }

    // Check if policy number already exists
    const policyExists = await checkPolicyNumberExist(policyNumber);
    if (policyExists) {
      return res.status(200).json({
        message: `Policy number '${policyNumber}' already exists`,
        status: "success",
      });
    }

    // Create new booking if policy number doesn't exist
    const newBooking = new BookingRequestModel({
      partnerId,
      partnerName,
      relationshipManagerId,
      relationshipManagerName,
      policyNumber,
      category,
      caseType,
      policyType,
      productType,
      subCategory,
      companyName,
      documents,
      bookingCreatedBy,
      bookingAcceptedBy,
      bookingStatus:"requested",
      createdBy,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newBooking.save();
    res
      .status(200)
      .json({
        message: "Booking Request generated successfully",
        data: newBooking,
        status: "success",
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating booking", error: error.message });
  }
};

// Check PolicyNumber exist.
export const validatePolicyNumber = async (req, res) => {
  try {
    const { policyNumber } = req.query;
    const policyExists = await BookingRequestModel.exists({ policyNumber });
    if (policyExists) {
      return res.status(200).json({
        message: `Policy number already exists`,
        exist: true,
        status: "success",
      });
    } else {
      return res.status(200).json({
        message: `Policy number does not exist`,
        exist: false,
        status: "success",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error checking policy number",
      error: error.message,
    });
  }
};


// Get all bookings
export const getAllBookingRequests = async (req, res) => {
  try {
    const bookings = await BookingRequestModel.find();
    res.status(200).json({
      message: "Bookings retrieved successfully.",
      data: bookings,
      status: "success",
    });
  } catch (error) {
    console.error("Error retrieving bookings:", error);
    res
      .status(500)
      .json({ message: "Error retrieving bookings", error: error.message });
  }
};
// Get booking requests by bookingCreatedBy
export const getBookingRequestsByCreatedBy = async (req, res) => {
  try {
    const { bookingCreatedBy } = req.params;
    const bookings = await BookingRequestModel.find({ bookingCreatedBy });
    
    if (bookings.length === 0) {
      return res.status(404).json({
        message: `No bookings found for bookingCreatedBy: ${bookingCreatedBy}`,
        status: "success",
      });
    }

    res.status(200).json({
      message: "Bookings retrieved successfully.",
      data: bookings,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving bookings",
      error: error.message,
    });
  }
};

// Get booking requests by bookingAcceptedy
export const getBookingRequestsByAcceptedBy = async (req, res) => {
  try {
    const { bookingAcceptedBy } = req.params;
    const bookings = await BookingRequestModel.find({ bookingAcceptedBy });
    
    if (bookings.length === 0) {
      return res.status(404).json({
        message: `No bookings found for bookingAcceptedeBy: ${bookingAcceptedBy}`,
        status: "success",
      });
    }

    res.status(200).json({
      message: "Bookings retrieved successfully.",
      data: bookings,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving bookings",
      error: error.message,
    });
  }
};

// Get booking requests by partnerId
export const getBookingRequestsByPartnerId = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const bookings = await BookingRequestModel.find({ partnerId });
    
    if (bookings.length === 0) {
      return res.status(404).json({
        message: `No bookings found for partnerId: ${partnerId}`,
        status: "success",
      });
    }

    res.status(200).json({
      message: "Bookings retrieved successfully.",
      data: bookings,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving bookings",
      error: error.message,
    });
  }
};

// Update a booking by ID
export const updateBookingRequest = async (req, res) => {
  try {
    const updatedBooking = await BookingRequestModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res
      .status(200)
      .json({
        message: "Booking updated successfully",
        data: updatedBooking,
        status: "success",
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating booking", error: error.message });
  }
};