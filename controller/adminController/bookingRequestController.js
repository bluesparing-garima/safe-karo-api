import BookingRequestModel from "../../models/bookingRequestSchema.js";

// Helper function to check for missing fields
const getMissingFields = (fields, requiredFields) => {
  return requiredFields.filter(
    (field) =>
      !fields.hasOwnProperty(field) ||
      fields[field] === undefined ||
      fields[field] === null
  );
};

// Create a new bookingRequest
export const createBooking = async (req, res) => {
  try {
    const {
      partnerId,
      partnerName,
      policyNumber,
      category,
      caseType,
      policyType,
      productType,
      subCategory,
      companyName,
    //   policyPDF,
      documents,
      bookingStatus,
      createdBy,
      isActive,
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
    //   "policyPDF",
      "bookingStatus",
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

    const newBooking = new BookingRequestModel({
      partnerId,
      partnerName,
      policyNumber,
      category,
      caseType,
      policyType,
      productType,
      subCategory,
      companyName,
    //   policyPDF,
      documents,
      bookingStatus,
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

// Get all bookings
export const getAllBookings = async (req, res) => {
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

// Update a booking by ID
export const updateBooking = async (req, res) => {
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