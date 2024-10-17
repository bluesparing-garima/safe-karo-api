import upload from "../../middlewares/uploadMiddleware.js";
import BookingRequestModel from "../../models/bookingModel/bookingRequestSchema.js";
import leadGenerateModel from "../../models/partnerModels/leadGenerateSchema.js";
import fs from "fs";
import path from "path";
import UserProfile from "../../models/adminModels/userProfileSchema.js";
import NotificationModel from '../../models/notificationModel.js';

// Function to check if the policy number already exists
const checkPolicyNumberExist = async (policyNumber) => {
  const booking = await BookingRequestModel.findOne({ policyNumber });
  return !!booking;
};

// Create Booking Request.
export const createBookingRequest = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const {
      partnerId,
      leadId,
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
      createdBy,
      isActive,
      bookingCreatedBy,
      bookingAcceptedBy,
      isRejected,
      rejectionReason,
    } = req.body;

    // Check if policy number already exists
    const policyExists = await checkPolicyNumberExist(policyNumber);
    if (policyExists) {
      return res.status(200).json({
        message: `Policy number ${policyNumber} already exists`,
        status: "success",
      });
    }

    try {
      const fileDetails = Object.keys(req.files).reduce((acc, key) => {
        acc[key] = req.files[key][0].filename;
        return acc;
      }, {});

      // Create new booking
      const newBooking = new BookingRequestModel({
        partnerId,
        leadId,
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
        ...fileDetails,
        bookingCreatedBy,
        bookingAcceptedBy,
        bookingStatus: "requested",
        createdBy,
        isActive: isActive !== undefined ? isActive : true,
        isRejected: isRejected !== undefined ? isRejected : false,
        rejectionReason,
      });

      if (leadId) {
        await leadGenerateModel.findByIdAndUpdate(
          leadId,
          { status: "Booking Pending" },
          { new: true }
        );
      }

      await newBooking.save();

      // Send notification to partner
      const partnerNotification = new NotificationModel({
        title: 'Booking Request Sent',
        type: 'success',
        role: 'operation',
        notificationFor: partnerId,
        notificationBy: bookingCreatedBy,
        createdBy: bookingCreatedBy,
      });
      await partnerNotification.save();

      // Retrieve users with role 'booking' or 'Booking' from userProfile
      const bookingPersons = await UserProfile.find({
        role: { $in: ['booking', 'Booking'] }
      });

      // Send notifications to all booking persons
      if (bookingPersons.length > 0) {
        for (const user of bookingPersons) {
          const personNotification = new NotificationModel({
            title: 'New Booking Request Assigned',
            type: 'success',
            role: 'operation',
            notificationFor: user._id,
            notificationBy: bookingCreatedBy,
            createdBy: bookingCreatedBy,
          });
          await personNotification.save();
        }
      } else {
        console.log("No booking persons to notify.");
      }

      res.status(200).json({
        message: "Booking Request generated successfully",
        data: newBooking,
        status: "success",
      });
    } catch (error) {
      res.status(500).json({
        message: "Error creating booking",
        error: error.message,
      });
    }
  });
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
    const bookings = await BookingRequestModel.find({
      isRejected: false,
      bookingStatus: "requested"
    });
    
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

export const getAllBookingStatusAccepted = async (req, res) => {
  try {
    const bookings = await BookingRequestModel.find({
      isRejected: false,
      bookingStatus: "accepted",
    });

    const bookingsWithUserFullName = await Promise.all(
      bookings.map(async (booking) => {

        const userProfile = await UserProfile.findOne({
          _id: booking.bookingAcceptedBy,
        });
        const fullName = userProfile ? userProfile.fullName : "Unknown";
        return {
          ...booking.toObject(),
          acceptedByName: fullName,
        };
      })
    );

    res.status(200).json({
      message: "Bookings retrieved successfully.",
      data: bookingsWithUserFullName,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving bookings",
      error: error.message,
    });
  }
};

// Get all rejected booking requests
export const getRejectedBookingRequests = async (req, res) => {
  try {
    const rejectedBookings = await BookingRequestModel.find({ isRejected: true });
    res.status(200).json({
      message: "Rejected bookings retrieved successfully.",
      data: rejectedBookings,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving rejected bookings",
      error: error.message,
    });
  }
};

export const getRejectedBookingRequestsByPartnerId = async (req, res) => {
  try {
    const { partnerId } = req.query;

    if (!partnerId) {
      return res.status(400).json({
        message: "Partner ID is required.",
        status: "error",
      });
    }

    const rejectedBookings = await BookingRequestModel.find({
      isRejected: true,
      bookingStatus:"rejected",
      bookingStatus:"Rejected",
      partnerId: partnerId,
    });

    res.status(200).json({
      message: "Rejected bookings of partner retrieved successfully.",
      data: rejectedBookings,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving rejected bookings",
      error: error.message,
    });
  }
};

// Get motorpolicy by bookingId
export const getBookingRequestsByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const policies = await BookingRequestModel.findById({ _id: bookingId });

    if (!policies) {
      return res.status(404).json({
        message: `No BookingRequest found for this bookingId ${bookingId}`,
        status: "success",
      });
    }

    res.status(200).json({
      message: "Motor Policies retrieved successfully.",
      data: policies,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving motor policies",
      error: error.message,
    });
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

// Get booking requests by bookingAcceptedBy
export const getBookingRequestsByAcceptedBy = async (req, res) => {
  try {
    const { bookingAcceptedBy } = req.params;
    const bookings = await BookingRequestModel.find({ 
      bookingAcceptedBy, 
      bookingStatus: "accepted" 
    });
    if (bookings.length === 0) {
      return res.status(404).json({
        message: `No bookings found for bookingAcceptedBy: ${bookingAcceptedBy}`,
        status: "success",
      });
    }

    res.status(200).json({
      message: "Accepted Bookings retrieved successfully.",
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

    const bookings = await BookingRequestModel.find({
      partnerId,
      bookingStatus: { $ne: "booked" }
    });

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

// Get booking requests by RMID
export const getBookingRequestsByRMId = async (req, res) => {
  try {
    const { relationshipManagerId } = req.query;

    const bookings = await BookingRequestModel.find({
      relationshipManagerId,
    });

    if (bookings.length === 0) {
      return res.status(404).json({
        message: `No bookings found for relationshipManagerId: ${relationshipManagerId}`,
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

// Accept booking request
export const acceptBookingRequest = async (req, res) => {
  try {
    const { bookingAcceptedBy } = req.body;

    const existingBooking = await BookingRequestModel.findById(req.params.id);
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const acceptingUser = await UserProfile.findById(bookingAcceptedBy);
    if (!acceptingUser) {
      return res.status(404).json({ message: "Accepting user not found" });
    }

    const updatedBooking = await BookingRequestModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    const notification = new NotificationModel({
      title: `Request accepted by ${acceptingUser.fullName}`,
      type: 'success',
      role: 'booking',
      notificationFor: existingBooking.bookingCreatedBy,
      notificationBy: bookingAcceptedBy,
      createdBy: acceptingUser.fullName,
    });
    await notification.save();

    res.status(200).json({
      message: "Booking Accepted successfully",
      data: updatedBooking,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error accepting booking",
      error: error.message,
    });
  }
};

// Update a booking by ID
export const updateBookingRequest = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const existingBooking = await BookingRequestModel.findById(req.params.id);
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const fileDetails = Object.keys(req.files).reduce((acc, key) => {
        acc[key] = req.files[key][0].filename;
        return acc;
      }, {});

      Object.keys(fileDetails).forEach((field) => {
        if (existingBooking[field]) {
          const oldFilePath = path.join("uploads", existingBooking[field]);
          fs.unlink(oldFilePath, (err) => {
            if (err) {
              console.error(`Error deleting old file: ${oldFilePath}`, err);
            }
          });
        }
      });

      const updateData = {
        ...req.body,
        ...fileDetails,
      };

      const updatedBooking = await BookingRequestModel.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      res.status(200).json({
        message: "Booking updated successfully",
        data: updatedBooking,
        status: "success",
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating booking",
        error: error.message,
      });
    }
  });
};

export const uploadFilesAndData = (req, res) => {
  upload.fields([
    { name: "rcFront", maxCount: 1 },
    { name: "rcBack", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No files selected!" });
    }

    const { rcBack, fullName, partnerId, rcFront, email } = req.body;
    if (!fullName || !email || !partnerId) {
      return res.status(400).json({ message: "Name and email are required!" });
    }

    const fileDetails = Object.keys(req.files).reduce((acc, key) => {
      acc[key] = req.files[key][0].filename;
      return acc;
    }, {});

    res.status(200).json({
      message: "Files and data uploaded successfully!",
      data: {
        fullName,
        email,
        files: fileDetails,
      },
    });
  });
};
